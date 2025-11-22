import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma.js"

// 🔹 Actualizar asignación
export async function PATCH(req, context) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const actualizado = await prisma.rolPermiso.update({
      where: { id: Number(id) },
      data: {
        descripcion: body.descripcion || null,
        estado: body.estado || "ACTIVO",
      },
      include: {
        rol: true,
        permiso: { include: { modulo: true } },
      },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error("❌ Error PATCH /roles-permisos/api/[id]:", error)
    return NextResponse.json({ error: "Error al actualizar asignación" }, { status: 500 })
  }
}

// 🔹 Eliminar asignación
export async function DELETE(req, context) {
  try {
    const { id } = await context.params
    await prisma.rolPermiso.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Error DELETE /roles-permisos/api/[id]:", error)
    return NextResponse.json({ error: "Error al eliminar asignación" }, { status: 500 })
  }
}
