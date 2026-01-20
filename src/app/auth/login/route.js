import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { setSession } from "@/lib/session"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y password requeridos" }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    })

    if (!user || user.estado !== "ACTIVO") {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // ✅ Crear sesión
    setSession(user.id)

    // Respuesta segura (sin password)
    return NextResponse.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.nombre,
    })
  } catch (error) {
    console.error("❌ /auth/login", error)
    return NextResponse.json({ error: "Error en login" }, { status: 500 })
  }
}
