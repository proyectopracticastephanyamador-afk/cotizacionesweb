import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(_, { params }) {
  try {
    const { id } = await params
    const idNumber = Number(id)
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }
    await prisma.cotizacion.delete({
      where: { id: idNumber }
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 })
  }
}
