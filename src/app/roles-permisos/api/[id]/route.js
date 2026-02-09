import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// =======================================
// DELETE → Quitar permiso de un rol (lógico)
// =======================================
export async function DELETE(_, { params }) {
  try {
    const { id } = await params
    const idNumber = Number(id)
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }

    await prisma.rolPermiso.update({
      where: { id: idNumber },
      data: { estado: "INACTIVO" },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Error DELETE /roles-permisos/api/[id]", error)
    return NextResponse.json(
      { error: "Error eliminando permiso del rol" },
      { status: 500 }
    )
  }
}
