import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// =======================================
// GET → Listar roles
// =======================================
export async function GET() {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: { id: "asc" },
    })
    return NextResponse.json(roles)
  } catch (error) {
    console.error("❌ Error GET /roles/api", error)
    return NextResponse.json(
      { error: "Error obteniendo roles" },
      { status: 500 }
    )
  }
}

// =======================================
// POST → Crear rol
// =======================================
export async function POST(req) {
  try {
    const body = await req.json()

    const nuevo = await prisma.rol.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        estado: body.estado || "ACTIVO",
      },
    })

    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /roles/api", error)
    return NextResponse.json(
      { error: "Error creando rol" },
      { status: 500 }
    )
  }
}
