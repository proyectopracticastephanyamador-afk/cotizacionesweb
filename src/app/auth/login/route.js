export const runtime = "nodejs"

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function POST(req) {
  try {
    let { email, password } = await req.json()

    email = String(email || "").trim().toLowerCase()
    password = String(password || "")

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

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "JWT_SECRET no configurado" }, { status: 500 })
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol?.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      token,
      usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol?.nombre },
    })
  } catch (err) {
    console.error("❌ /auth/login-mobile", err)
    return NextResponse.json({ error: "Error autenticando" }, { status: 500 })
  }
}
