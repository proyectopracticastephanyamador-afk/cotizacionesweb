import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { verifyMobileAuth } from "@/lib/auth-mobile";

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
   UTILIDADES DE CONFIGURACIÓN (copiadas del endpoint principal)
   ============================================================ */

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

async function calcularDeduccionEnte(enteNombre, salario, subTipo = "TRABAJADOR") {
  const config = await getConfigDeduccion(enteNombre, subTipo);

  if (!config) {
    return {
      base: 0,
      porcentaje: 0,
      techoAplicado: 0,
      monto: 0,
    };
  }

  const tipo = config.tipo;

  if (tipo === "MONTO_FIJO") {
    const montoFijo = Number(config.montoFijo || 0);
    return {
      base: 0,
      porcentaje: 0,
      techoAplicado: 0,
      monto: montoFijo,
    };
  }

  if (tipo === "PORCENTAJE") {
    const techoConfig = await getTechoDeduccion(enteNombre);
    const baseBruta = Number(salario);
    const techo = techoConfig?.techo ? Number(techoConfig.techo) : baseBruta;
    const baseAplicada = Math.min(baseBruta, techo);
    const porcentaje = Number(config.porcentaje || 0);
    const monto = baseAplicada * porcentaje;

    return {
      base: baseAplicada,
      porcentaje,
      techoAplicado: techoConfig?.techo ? Number(techoConfig.techo) : 0,
      monto,
    };
  }

  return {
    base: 0,
    porcentaje: 0,
    techoAplicado: Number(config.techo || 0),
    monto: 0,
  };
}

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
  const porcentaje = Number(tramo.porcentaje);

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

  if (regimen.aplicaIHSS) {
    detalle.ihss = await calcularDeduccionEnte("IHSS", salario, "TRABAJADOR");
    if (detalle.ihss.monto === 0 && detalle.ihss.porcentaje === 0) {
      warnings.push("No hay configuración vigente para IHSS");
    }
  }

  if (regimen.aplicaRAP) {
    detalle.rap = await calcularDeduccionEnte("RAP", salario, "TRABAJADOR");
    if (detalle.rap.monto === 0 && detalle.rap.porcentaje === 0) {
      warnings.push("No hay configuración vigente para RAP");
    }
  }

  if (regimen.aplicaINJUPEMP) {
    detalle.injupemp = await calcularDeduccionEnte("INJUPEMP", salario, "TRABAJADOR");
    if (detalle.injupemp.monto === 0 && detalle.injupemp.porcentaje === 0) {
      warnings.push("No hay configuración vigente para INJUPEMP");
    }
  }

  if (regimen.aplicaIMPREMA) {
    detalle.imprema = await calcularDeduccionEnte("IMPREMA", salario, "TRABAJADOR");
    if (detalle.imprema.monto === 0 && detalle.imprema.porcentaje === 0) {
      warnings.push("No hay configuración vigente para IMPREMA");
    }
  }

  if (regimen.aplicaISR) {
    detalle.isr = await calcularISRDetalle(salario);
    if (!detalle.isr.tramosAplicados.length) {
      warnings.push("No hay configuración vigente para ISR");
    }
  }

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
   ENDPOINT
   ============================================================ */

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

    const { detalle, totalDeducciones, salarioNeto, warnings } =
      await calcularDeducciones(regimen, salarioBruto);

    const empleadoNombre = body.empleadoNombre || "(sin nombre)";

    const respuesta = {
      titulo: "Detalle de Cotización Laboral",
      encabezado: {
        empleado: empleadoNombre,
        salarioBruto: salarioBruto,
        regimen: regimen.nombre,
      },
      detalle,
      resumen: {
        totalDeducciones,
        salarioNeto,
      },
      warnings,
    };

    if (body.descarga === true) {
      try {
        const actor = await getActorInfo(req);
        await prisma.bitacora.create({
          data: {
            usuarioId: actor.userId,
            accion: "DESCARGA DE COTIZACION",
            modulo: "Cotizaciones",
            descripcion: `Empleado ${empleadoNombre} - Neto L ${Number(salarioNeto).toFixed(2)} - Canal ${actor.canal}`,
          },
        });
      } catch (logError) {
        console.error("Error guardando bitacora descarga:", logError);
      }
    }

    return NextResponse.json(respuesta);
  } catch (error) {
    console.error("Error en pdf-preview:", error);
    return NextResponse.json(
      { error: "Error al calcular cotización" },
      { status: 500 }
    );
  }
}
