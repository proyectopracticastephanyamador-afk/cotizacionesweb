import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// =======================================
// PATCH → Editar rol
// =======================================
export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id)
    const body = await req.json()

    const updated = await prisma.rol.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        estado: body.estado,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("❌ Error PATCH /roles/api/[id]", error)
    return NextResponse.json(
      { error: "Error actualizando rol" },
      { status: 500 }
    )
  }
}

// =======================================
// DELETE → Eliminación lógica
// =======================================
export async function DELETE(_, { params }) {
  try {
    const id = Number(params.id)

    await prisma.rol.update({
      where: { id },
      data: { estado: "ELIMINADO" },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Error DELETE /roles/api/[id]", error)
    return NextResponse.json(
      { error: "Error eliminando rol" },
      { status: 500 }
    )
  }
}
