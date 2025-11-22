import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// UTILIDADES =======================

async function getConfig(enteNombre, subTipo) {
  return prisma.configuracionDeduccion.findFirst({
    where: {
      ente: { nombre: enteNombre },
      subTipo,
      estado: "ACTIVO",
    }
  })
}

async function getTecho(enteNombre) {
  return prisma.configuracionDeduccion.findFirst({
    where: {
      ente: { nombre: enteNombre },
      tipo: "TECHO",
      estado: "ACTIVO",
    }
  })
}

async function calcularISR(salarioBruto) {
  const tramos = await prisma.tramoISR.findMany({
    where: { estado: "ACTIVO" },
    orderBy: { desde: "asc" },
  })

  const anual = salarioBruto * 12
  let impuesto = 0

  for (const t of tramos) {
    const limInf = Number(t.desde)
    const limSup = t.hasta ? Number(t.hasta) : Infinity

    if (anual > limInf) {
      const base = Math.min(anual, limSup) - limInf
      impuesto += base * Number(t.porcentaje)
    }
  }

  return impuesto / 12
}

// ===============================
// ENDPOINTS
// ===============================

// GET – listar cotizaciones
export async function GET() {
  const data = await prisma.cotizacion.findMany({
    include: { regimen: true },
    orderBy: { id: "desc" },
  })
  return NextResponse.json(data)
}

// POST – crear cotización
export async function POST(req) {
  try {
    const body = await req.json()
    const salario = Number(body.salarioBruto)
    const regimen = await prisma.regimenLaboral.findUnique({
      where: { id: Number(body.regimenId) }
    })

    let deducciones = {
      ihss: 0,
      rap: 0,
      injupemp: 0,
      imprema: 0,
      isr: 0,
    }

    // =============================
    // IHSS
    if (regimen.aplicaIHSS) {
      const techoIHSS = await getTecho("IHSS")
      const base = Math.min(salario, Number(techoIHSS?.techo || salario))
      const porcTrab = await getConfig("IHSS", "TRABAJADOR")
      deducciones.ihss = base * Number(porcTrab.porcentaje)
    }

    // =============================
    // RAP
    if (regimen.aplicaRAP) {
      const techoRAP = await getTecho("RAP")
      const base = Math.min(salario, Number(techoRAP?.techo || salario))
      const porcRAP = await getConfig("RAP", "TRABAJADOR")
      deducciones.rap = base * Number(porcRAP.porcentaje)
    }

    // =============================
    // INJUPEMP
    if (regimen.aplicaINJUPEMP) {
      const porcINJ = await getConfig("INJUPEMP", "TRABAJADOR")
      deducciones.injupemp = salario * Number(porcINJ.porcentaje)
    }

    // =============================
    // IMPREMA
    if (regimen.aplicaIMPREMA) {
      const porcIMP = await getConfig("IMPREMA", "TRABAJADOR")
      deducciones.imprema = salario * Number(porcIMP.porcentaje)
    }

    // =============================
    // ISR
    if (regimen.aplicaISR) {
      deducciones.isr = await calcularISR(salario)
    }

    // =============================
    // TOTAL Y NETO
    const total = Object.values(deducciones).reduce((a, b) => a + b, 0)
    const neto = salario - total

    // =============================
    // GUARDAR COTIZACION
    const nueva = await prisma.cotizacion.create({
      data: {
        empleadoNombre: body.empleadoNombre,
        salarioBruto: salario,
        regimenId: regimen.id,
        totalDeducciones: total,
        salarioNeto: neto,
      }
    })

    return NextResponse.json({
      ...nueva,
      detalle: deducciones
    })

  } catch (error) {
    console.error("Error cotizando:", error)
    return NextResponse.json({ error: "Error al calcular cotización" }, { status: 500 })
  }
}
