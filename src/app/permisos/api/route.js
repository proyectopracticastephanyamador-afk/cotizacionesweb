import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma.js"

// ✅ Obtener todos los permisos (con su módulo)
export async function GET() {
  try {
    const permisos = await prisma.permiso.findMany({
      include: { modulo: true },
      orderBy: { id: "asc" },
    })
    return NextResponse.json(permisos)
  } catch (error) {
    console.error("❌ Error GET /permisos/api:", error)
    return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 })
  }
}

// ✅ Crear nuevo permiso
export async function POST(req) {
  try {
    const body = await req.json()
    const nuevo = await prisma.permiso.create({
      data: {
        moduloId: Number(body.moduloId),
        descripcion: body.descripcion || null,
        puedeCrear: body.puedeCrear || false,
        puedeLeer: body.puedeLeer || false,
        puedeEditar: body.puedeEditar || false,
        puedeEliminar: body.puedeEliminar || false,
        estado: "ACTIVO",
      },
      include: { modulo: true },
    })
    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /permisos/api:", error)
    return NextResponse.json({ error: "Error al crear permiso" }, { status: 500 })
  }
}
