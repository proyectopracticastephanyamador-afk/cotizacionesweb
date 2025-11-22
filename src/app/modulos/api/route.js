import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma.js"

// Obtener todos los módulos
export async function GET() {
  try {
    const modulos = await prisma.modulo.findMany({
      orderBy: { id: "asc" },
    })
    return NextResponse.json(modulos)
  } catch (error) {
    console.error("❌ Error GET /modulos/api:", error)
    return NextResponse.json({ error: "Error al obtener módulos" }, { status: 500 })
  }
}

// Crear módulo
export async function POST(req) {
  try {
    const body = await req.json()
    const nuevo = await prisma.modulo.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        estado: "ACTIVO",
      },
    })
    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /modulos/api:", error)
    return NextResponse.json({ error: "Error al crear módulo" }, { status: 500 })
  }
}
