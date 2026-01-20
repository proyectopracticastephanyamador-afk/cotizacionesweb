import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// =======================================
// DELETE → Quitar permiso de un rol (lógico)
// =======================================
export async function DELETE(_, { params }) {
  try {
    const id = Number(params.id)

    await prisma.rolPermiso.update({
      where: { id },
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
