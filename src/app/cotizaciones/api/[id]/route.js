import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(_, { params }) {
  try {
    await prisma.cotizacion.delete({
      where: { id: Number(params.id) }
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 })
  }
}
