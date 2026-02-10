import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { verifyMobileAuth } from "@/lib/auth-mobile";

const ANIO_VIGENTE = new Date().getFullYear();

async function getActorInfo(req) {
  const auth = req.headers.get("authorization");
  if (auth) {
    const mobile = verifyMobileAuth(req);
    const mobileId = Number(mobile?.id);
    if (Number.isInteger(mobileId)) {
      return { userId: mobileId, canal: "MOBILE" };
    }
    return { userId: 1, canal: "MOBILE" };
  }

  const webUserId = await getSessionUserId();
  if (Number.isInteger(webUserId)) {
    return { userId: webUserId, canal: "WEB" };
  }

  return { userId: 1, canal: "WEB" };
}

/* ============================================================
   UTILIDADES DE CONFIGURACIÓN
   ============================================================ */

/**
 * Obtiene una configuración de deducción para un ente, año y subTipo
 * (TRABAJADOR, EMPLEADOR, etc.) que NO esté eliminada.
 */
async function getConfigDeduccion(enteNombre, subTipo = "TRABAJADOR") {
  return prisma.configuracionDeduccion.findFirst({
    where: {
      ente: { nombre: enteNombre },
      subTipo,
      estado: "ACTIVO",
    },
    include: {
      ente: true,
    },
  });
}

/**
 * Obtiene el TECHO para un ente en el año vigente.
 */
async function getTechoDeduccion(enteNombre) {
  return prisma.configuracionDeduccion.findFirst({
    where: {
      ente: { nombre: enteNombre },
      tipo: "TECHO",
      estado: "ACTIVO",
    },
    include: {
      ente: true,
    },
  });
}

/**
 * Calcula una deducción genérica para un ente dado, siguiendo el flujo:
 * 1. Verificar tipo (MONTO_FIJO, PORCENTAJE, TECHO)
 * 2. Si es PORCENTAJE → verificar si tiene TECHO
 * 3. Aplicar según subTipo (TRABAJADOR en este módulo)
 * 4. Si no hay config → todo en 0
 *
 * Retorna:
 * {
 *   base,
 *   porcentaje,
 *   techoAplicado,
 *   monto
 * }
 */
async function calcularDeduccionEnte(enteNombre, salario, subTipo = "TRABAJADOR") {
  const config = await getConfigDeduccion(enteNombre, subTipo);

  // Si no hay configuración → 0 en todo
  if (!config) {
    return {
      base: 0,
      porcentaje: 0,
      techoAplicado: 0,
      monto: 0,
    };
  }

  const tipo = config.tipo; // PORCENTAJE | TECHO | MONTO_FIJO

  // MONTO FIJO → no depende de salario
  if (tipo === "MONTO_FIJO") {
    const montoFijo = Number(config.montoFijo || 0);
    return {
      base: 0,
      porcentaje: 0,
      techoAplicado: 0,
      monto: montoFijo,
    };
  }

  // PORCENTAJE → puede tener techo
  if (tipo === "PORCENTAJE") {
    const techoConfig = await getTechoDeduccion(enteNombre);
    const baseBruta = Number(salario);
    const techo = techoConfig?.techo ? Number(techoConfig.techo) : baseBruta;
    const baseAplicada = Math.min(baseBruta, techo);
    const porcentaje = Number(config.porcentaje || 0); // ej. 0.04, 0.015, 0.085, etc.
    const monto = baseAplicada * porcentaje;

    return {
      base: baseAplicada,
      porcentaje,
      techoAplicado: techoConfig?.techo ? Number(techoConfig.techo) : 0,
      monto,
    };
  }

  // TECHO solo como registro de referencia → no se descuenta nada directamente
  return {
    base: 0,
    porcentaje: 0,
    techoAplicado: Number(config.techo || 0),
    monto: 0,
  };
}

/**
 * Calcula el ISR mensual con detalle por tramos, basado en TramoISR
 * para el año vigente, estado != ELIMINADO.
 *
 * Retorna:
 * {
 *   anual,
 *   tramosAplicados: [{ base, porcentaje, monto }],
 *   monto
 * }
 */
async function calcularISRDetalle(salarioBruto) {
  const tramos = await prisma.tramoISR.findMany({
    where: { estado: "ACTIVO" },
    orderBy: { desde: "asc" },
  });

  const anual = Number(salarioBruto) * 12;

  const idx = tramos.findIndex((t) => {
    const limInf = Number(t.desde);
    const limSup = t.hasta ? Number(t.hasta) : Infinity;
    return anual > limInf && anual <= limSup;
  });

  if (idx === -1) {
    return {
      anual,
      tramosAplicados: [],
      monto: 0,
      exento: 0,
      gravable: 0,
    };
  }

  const tramo = tramos[idx];
  const limInf = Number(tramo.desde);
  const limSup = tramo.hasta ? Number(tramo.hasta) : Infinity;
  const porcentaje = Number(tramo.porcentaje); // Ej: 0.15

  const baseExenta =
    idx > 0 && tramos[idx - 1].hasta != null
      ? Number(tramos[idx - 1].hasta)
      : limInf;

  const base = Math.max(0, anual - baseExenta);
  const impuestoAnual = base * porcentaje;

  return {
    anual,
    tramosAplicados: [
      {
        tramo: `${limInf} - ${limSup === Infinity ? "en adelante" : limSup}`,
        base,
        porcentaje,
        monto: impuestoAnual,
      },
    ],
    monto: impuestoAnual / 12,
    exento: baseExenta,
    gravable: base,
  };
}


/**
 * Calcula todas las deducciones de la cotización según el régimen laboral:
 * - IHSS
 * - RAP
 * - INJUPEMP
 * - IMPREMA
 * - ISR
 *
 * Usa únicamente la configuración de BD (ConfiguracionDeduccion, TramoISR).
 */
async function calcularDeducciones(regimen, salarioBruto) {
  const salario = Number(salarioBruto);

  const detalle = {
    ihss: null,
    rap: null,
    injupemp: null,
    imprema: null,
    isr: null,
  };
  const warnings = [];

  // IHSS
  if (regimen.aplicaIHSS) {
    detalle.ihss = await calcularDeduccionEnte("IHSS", salario, "TRABAJADOR");
    if (detalle.ihss.monto === 0 && detalle.ihss.porcentaje === 0) {
      warnings.push("No hay configuración vigente para IHSS");
    }
  }

  // RAP
  if (regimen.aplicaRAP) {
    detalle.rap = await calcularDeduccionEnte("RAP", salario, "TRABAJADOR");
    if (detalle.rap.monto === 0 && detalle.rap.porcentaje === 0) {
      warnings.push("No hay configuración vigente para RAP");
    }
  }

  // INJUPEMP
  if (regimen.aplicaINJUPEMP) {
    detalle.injupemp = await calcularDeduccionEnte("INJUPEMP", salario, "TRABAJADOR");
    if (detalle.injupemp.monto === 0 && detalle.injupemp.porcentaje === 0) {
      warnings.push("No hay configuración vigente para INJUPEMP");
    }
  }

  // IMPREMA
  if (regimen.aplicaIMPREMA) {
    detalle.imprema = await calcularDeduccionEnte("IMPREMA", salario, "TRABAJADOR");
    if (detalle.imprema.monto === 0 && detalle.imprema.porcentaje === 0) {
      warnings.push("No hay configuración vigente para IMPREMA");
    }
  }

  // ISR
  if (regimen.aplicaISR) {
    detalle.isr = await calcularISRDetalle(salario);
    if (!detalle.isr.tramosAplicados.length) {
      warnings.push("No hay configuración vigente para ISR");
    }
  }

  // Total deducciones: suma de todos los montos no nulos
  const totalDeducciones = Object.values(detalle)
    .filter((d) => d && typeof d.monto === "number")
    .reduce((acc, d) => acc + d.monto, 0);

  const salarioNeto = salario - totalDeducciones;

  return {
    detalle,
    totalDeducciones,
    salarioNeto,
    warnings,
  };
}

/* ============================================================
   ENDPOINTS
   ============================================================ */

// GET – listar cotizaciones con su régimen
export async function GET() {
  const data = await prisma.cotizacion.findMany({
    include: { regimen: true },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(data);
}

// POST – crear cotización o solo preview (preview = true)
export async function POST(req) {
  try {
    const body = await req.json();
    const salarioBruto = Number(body.salarioBruto);

    if (!body.regimenId) {
      return NextResponse.json(
        { error: "Debe seleccionar un régimen" },
        { status: 400 }
      );
    }

    const regimen = await prisma.regimenLaboral.findUnique({
      where: { id: Number(body.regimenId) },
    });

    if (!regimen) {
      return NextResponse.json(
        { error: "Régimen no encontrado" },
        { status: 404 }
      );
    }

    // Calcular deducciones y detalle según configuración
    const { detalle, totalDeducciones, salarioNeto, warnings } =
      await calcularDeducciones(regimen, salarioBruto);

    // Si es preview → no guarda en BD, solo devuelve detalle
    if (body.preview) {
      return NextResponse.json({
        ok: true,
        detalle,
        totalDeducciones,
        salarioNeto,
        warnings,
      });
    }

    // Crear cotización REAL en BD (solo totales)
    const nueva = await prisma.cotizacion.create({
      data: {
        empleadoNombre: body.empleadoNombre,
        salarioBruto: salarioBruto,
        regimenId: regimen.id,
        totalDeducciones: totalDeducciones,
        salarioNeto: salarioNeto,
      },
      include: {
        regimen: true,
      },
    });

    try {
      const actor = await getActorInfo(req);
      await prisma.bitacora.create({
        data: {
          usuarioId: actor.userId,
          accion: "CREACION DE COTIZACION",
          modulo: "Cotizaciones",
          descripcion: `Empleado ${nueva.empleadoNombre} - Salario L ${Number(nueva.salarioBruto).toFixed(2)} - Regimen ${nueva.regimen?.nombre || ""} - Canal ${actor.canal}`,
        },
      });
    } catch (logError) {
      console.error("Error guardando bitacora cotizacion:", logError);
    }

    return NextResponse.json({
      ...nueva,
      detalle, // se devuelve para que el front muestre el modal/PDF
      warnings,
    });
  } catch (error) {
    console.error("Error en cotización:", error);
    return NextResponse.json(
      { error: "Error al calcular cotización" },
      { status: 500 }
    );
  }
}
