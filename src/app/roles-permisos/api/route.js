import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// =======================================
// GET → Listar permisos por rol (opcional filtro)
// /roles-permisos/api?rolId=1
// =======================================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const rolId = searchParams.get("rolId")

    const where = rolId ? { rolId: Number(rolId) } : {}

    const items = await prisma.rolPermiso.findMany({
      where,
      include: {
        rol: true,
        permiso: true,
      },
      orderBy: { id: "asc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("❌ Error GET /roles-permisos/api", error)
    return NextResponse.json(
      { error: "Error obteniendo permisos por rol" },
      { status: 500 }
    )
  }
}

// =======================================
// POST → Asignar permiso a rol
// =======================================
export async function POST(req) {
  try {
    const body = await req.json()

    const nuevo = await prisma.rolPermiso.create({
      data: {
        rolId: Number(body.rolId),
        permisoId: Number(body.permisoId),
        descripcion: body.descripcion,
        estado: body.estado || "ACTIVO",
      },
      include: {
        rol: true,
        permiso: true,
      },
    })

    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /roles-permisos/api", error)
    return NextResponse.json(
      { error: "Error asignando permiso al rol" },
      { status: 500 }
    )
  }
}
