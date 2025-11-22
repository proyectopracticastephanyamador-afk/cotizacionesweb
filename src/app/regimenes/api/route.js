import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET → Lista todos los regímenes
export async function GET() {
  const items = await prisma.regimenLaboral.findMany({
    orderBy: { id: "asc" }
  })
  return NextResponse.json(items)
}

// POST → Crear un nuevo régimen
export async function POST(req) {
  try {
    const body = await req.json()

    const nuevo = await prisma.regimenLaboral.create({
      data: {
        nombre: body.nombre,
        aplicaIHSS: Boolean(body.aplicaIHSS),
        aplicaRAP: Boolean(body.aplicaRAP),
        aplicaISR: Boolean(body.aplicaISR),
        aplicaINJUPEMP: Boolean(body.aplicaINJUPEMP),
        aplicaIMPREMA: Boolean(body.aplicaIMPREMA),
        estado: body.estado || "ACTIVO",
      }
    })

    return NextResponse.json(nuevo)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error creando régimen" }, { status: 500 })
  }
}
