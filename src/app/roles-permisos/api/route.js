import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma.js"

// 🔹 Obtener todas las asignaciones Rol-Permiso
export async function GET() {
  try {
    const asignaciones = await prisma.rolPermiso.findMany({
      include: {
        rol: true,
        permiso: { include: { modulo: true } },
      },
      orderBy: { id: "asc" },
    })
    return NextResponse.json(asignaciones)
  } catch (error) {
    console.error("❌ Error GET /roles-permisos/api:", error)
    return NextResponse.json({ error: "Error al obtener asignaciones" }, { status: 500 })
  }
}

// 🔹 Crear nueva asignación
export async function POST(req) {
  try {
    const body = await req.json()

    // Evita duplicados: rolId + permisoId deben ser únicos
    const existente = await prisma.rolPermiso.findUnique({
      where: { rolId_permisoId: { rolId: Number(body.rolId), permisoId: Number(body.permisoId) } },
    })

    if (existente) {
      return NextResponse.json({ error: "Esta asignación ya existe" }, { status: 400 })
    }

    const nuevo = await prisma.rolPermiso.create({
      data: {
        rolId: Number(body.rolId),
        permisoId: Number(body.permisoId),
        descripcion: body.descripcion || null,
        estado: body.estado || "ACTIVO",
      },
      include: {
        rol: true,
        permiso: { include: { modulo: true } },
      },
    })

    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /roles-permisos/api:", error)
    return NextResponse.json({ error: "Error al crear asignación" }, { status: 500 })
  }
}
