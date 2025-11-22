import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET → todas las configuraciones
export async function GET() {
  const data = await prisma.configuracionDeduccion.findMany({
    include: { ente: true },
    orderBy: [{ enteId: "asc" }, { anio: "desc" }],
  })
  return NextResponse.json(data)
}

// POST → crear configuración
export async function POST(req) {
  try {
    const body = await req.json()

    const nueva = await prisma.configuracionDeduccion.create({
      data: {
        enteId: Number(body.enteId),
        anio: Number(body.anio),
        tipo: body.tipo,
        subTipo: body.subTipo || null,
        porcentaje: body.porcentaje ? Number(body.porcentaje) : null,
        montoFijo: body.montoFijo ? Number(body.montoFijo) : null,
        techo: body.techo ? Number(body.techo) : null,
        descripcion: body.descripcion || "",
        estado: body.estado || "ACTIVO",
      }
    })

    return NextResponse.json(nueva)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error creando configuración" }, { status: 500 })
  }
}
