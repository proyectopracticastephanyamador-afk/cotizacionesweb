import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH – Editar un ente
export async function PATCH(req, { params }) {
  const { id } = params
  try {
    const body = await req.json()

    const actualizado = await prisma.enteDeduccion.update({
      where: { id: Number(id) },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        estado: body.estado,
      }
    })

    return NextResponse.json(actualizado)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

// DELETE – Eliminar un ente
export async function DELETE(_, { params }) {
  const { id } = params

  try {
    await prisma.enteDeduccion.update({
      where: { id: Number(id) },
      data: { estado: "ELIMINADO" }
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 })
  }
}
