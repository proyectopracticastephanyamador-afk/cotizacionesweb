import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// ======================================================
// PATCH → Editar usuario
// ======================================================
export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const idNumber = Number(id)
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }
    const body = await req.json()

    const data = {
      nombre: body.nombre,
      email: body.email,
      rolId: body.rolId ? Number(body.rolId) : undefined,
      estado: body.estado,
    }

    // 🔐 Solo rehasear si viene password
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10)
    }

    const updated = await prisma.usuario.update({
      where: { id: idNumber },
      data,
      include: { rol: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("❌ Error PATCH /usuarios/api/[id]", error)
    return NextResponse.json(
      { error: "Error actualizando usuario" },
      { status: 500 }
    )
  }
}

// ======================================================
// DELETE → Eliminación lógica
// ======================================================
export async function DELETE(_, { params }) {
  try {
    const { id } = await params
    const idNumber = Number(id)
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }

    await prisma.usuario.update({
      where: { id: idNumber },
      data: { estado: "INACTIVO" },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Error DELETE /usuarios/api/[id]", error)
    return NextResponse.json(
      { error: "Error eliminando usuario" },
      { status: 500 }
    )
  }
}
