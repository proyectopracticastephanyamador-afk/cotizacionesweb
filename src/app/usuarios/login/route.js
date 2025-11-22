import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "../../../lib/prisma.js"

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    })

    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    if (usuario.estado !== "ACTIVO") return NextResponse.json({ error: "Cuenta inactiva" }, { status: 403 })

    const valido = await bcrypt.compare(password, usuario.password)
    if (!valido) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })

    return NextResponse.json({
      message: "Login correcto",
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol.nombre },
    })
  } catch (error) {
    console.error("❌ Error POST /usuarios/login:", error)
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 })
  }
}
