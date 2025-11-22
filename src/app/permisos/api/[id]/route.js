import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma.js"

// ✅ Actualizar permiso
export async function PATCH(req, { params }) {
  try {
    const { id } = params
    const body = await req.json()
    const actualizado = await prisma.permiso.update({
      where: { id: Number(id) },
      data: {
        moduloId: Number(body.moduloId),
        puedeCrear: body.puedeCrear,
        descripcion: body.descripcion || null,
        puedeLeer: body.puedeLeer,
        puedeEditar: body.puedeEditar,
        puedeEliminar: body.puedeEliminar,
        estado: body.estado || "ACTIVO",


      },
      include: { modulo: true },
    })
    return NextResponse.json(actualizado)
  } catch (error) {
    console.error("❌ Error PATCH /permisos/api/[id]:", error)
    return NextResponse.json({ error: "Error al actualizar permiso" }, { status: 500 })
  }
}

// ✅ Eliminar permiso
export async function DELETE(_, { params }) {
  try {
    const { id } = params
    await prisma.permiso.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Error DELETE /permisos/api/[id]:", error)
    return NextResponse.json({ error: "Error al eliminar permiso" }, { status: 500 })
  }
}
