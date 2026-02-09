import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH → Actualizar un régimen
export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const idNumber = Number(id)
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }
    const body = await req.json()

    const updated = await prisma.regimenLaboral.update({
      where: { id: idNumber },
      data: {
        nombre: body.nombre,
        aplicaIHSS: Boolean(body.aplicaIHSS),
        aplicaRAP: Boolean(body.aplicaRAP),
        aplicaISR: Boolean(body.aplicaISR),
        aplicaINJUPEMP: Boolean(body.aplicaINJUPEMP),
        aplicaIMPREMA: Boolean(body.aplicaIMPREMA),
        estado: body.estado,
      }
    })

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: "Error actualizando régimen" }, { status: 500 })
  }
}

// DELETE → Eliminación lógica
export async function DELETE(_, { params }) {
  try {
    const { id } = await params
    const idNumber = Number(id)
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }
    await prisma.regimenLaboral.update({
      where: { id: idNumber },
      data: { estado: "ELIMINADO" }
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error eliminando régimen" }, { status: 500 })
  }
}
