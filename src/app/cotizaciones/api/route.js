import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ANIO_VIGENTE = new Date().getFullYear();

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
      anio: ANIO_VIGENTE,
      subTipo,
      estado: { not: "ELIMINADO" },
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
      anio: ANIO_VIGENTE,
      tipo: "TECHO",
      estado: { not: "ELIMINADO" },
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
  const ANIO_VIGENTE = 2025;

  const tramos = await prisma.tramoISR.findMany({
    where: { anio: ANIO_VIGENTE, estado: { not: "ELIMINADO" }},
    orderBy: { desde: "asc" },
  });

  const anual = Number(salarioBruto) * 12;

  let impuestoAnual = 0;
  const tramosAplicados = [];

  for (const t of tramos) {

    const limInf = Number(t.desde);
    const limSup = t.hasta ? Number(t.hasta) : Infinity;
    const porcentaje = Number(t.porcentaje); // Ej: 0.15

    // Saltar tramo si el salario anual está BAJO del límite inferior
    if (anual <= limInf) continue;

    // Base gravada dentro del tramo
    const base = Math.min(anual, limSup) - limInf;
    if (base <= 0) continue;

    // Cálculo correcto del monto:
    const monto = base * porcentaje;  // NO dividir entre 100

    impuestoAnual += monto;

    tramosAplicados.push({
      tramo: `${limInf} - ${limSup === Infinity ? "en adelante" : limSup}`,
      base,
      porcentaje, // 0.15, 0.20, etc.
      monto,
    });
  }

  return {
    anual,
    tramosAplicados,
    monto: impuestoAnual / 12,
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

  // IHSS
  if (regimen.aplicaIHSS) {
    detalle.ihss = await calcularDeduccionEnte("IHSS", salario, "TRABAJADOR");
  }

  // RAP
  if (regimen.aplicaRAP) {
    detalle.rap = await calcularDeduccionEnte("RAP", salario, "TRABAJADOR");
  }

  // INJUPEMP
  if (regimen.aplicaINJUPEMP) {
    detalle.injupemp = await calcularDeduccionEnte("INJUPEMP", salario, "TRABAJADOR");
  }

  // IMPREMA
  if (regimen.aplicaIMPREMA) {
    detalle.imprema = await calcularDeduccionEnte("IMPREMA", salario, "TRABAJADOR");
  }

  // ISR
  if (regimen.aplicaISR) {
    detalle.isr = await calcularISRDetalle(salario);
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
    const { detalle, totalDeducciones, salarioNeto } =
      await calcularDeducciones(regimen, salarioBruto);

    // Si es preview → no guarda en BD, solo devuelve detalle
    if (body.preview) {
      return NextResponse.json({
        ok: true,
        detalle,
        totalDeducciones,
        salarioNeto,
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

    return NextResponse.json({
      ...nueva,
      detalle, // se devuelve para que el front muestre el modal/PDF
    });
  } catch (error) {
    console.error("Error en cotización:", error);
    return NextResponse.json(
      { error: "Error al calcular cotización" },
      { status: 500 }
    );
  }
}
