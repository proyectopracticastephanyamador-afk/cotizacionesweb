import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET – Lista todos los entes
export async function GET() {
  const entes = await prisma.enteDeduccion.findMany({
    orderBy: { id: "asc" }
  })
  return NextResponse.json(entes)
}

// POST – Crear nuevo ente
export async function POST(req) {
  try {
    const body = await req.json()
    const nuevo = await prisma.enteDeduccion.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || "",
        estado: body.estado || "ACTIVO",
      }
    })
    return NextResponse.json(nuevo)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "No se pudo crear el ente" }, { status: 500 })
  }
}
