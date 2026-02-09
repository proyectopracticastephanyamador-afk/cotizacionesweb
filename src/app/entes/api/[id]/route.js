import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH – Editar un ente
export async function PATCH(req, { params }) {
  const { id } = await params
  const idNumber = Number(id)
  if (Number.isNaN(idNumber)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 })
  }
  try {
    const body = await req.json()

    const actualizado = await prisma.enteDeduccion.update({
      where: { id: idNumber },
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
  const { id } = await params
  const idNumber = Number(id)
  if (Number.isNaN(idNumber)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 })
  }

  try {
    await prisma.enteDeduccion.update({
      where: { id: idNumber },
      data: { estado: "ELIMINADO" }
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 })
  }
}
