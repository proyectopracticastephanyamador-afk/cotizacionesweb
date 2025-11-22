import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "../../../lib/prisma.js"

export async function POST(req) {
  try {
    const body = await req.json()
    const hashed = await bcrypt.hash(body.password, 10)

    const nuevo = await prisma.usuario.create({
      data: {
        nombre: body.nombre,
        email: body.email,
        password: hashed,
        rolId: Number(body.rolId),
        estado: "ACTIVO",
      },
      include: { rol: true },
    })

    await prisma.bitacora.create({
      data: {
        usuarioId: 1, // 🧩 el admin que lo creó (ajustar según sesión)
        accion: "CREACIÓN DE USUARIO",
        modulo: "Usuarios",
        descripcion: `Usuario ${nuevo.email} creado con rol ${nuevo.rol.nombre}`,
      },
    })

    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /usuarios/api:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
