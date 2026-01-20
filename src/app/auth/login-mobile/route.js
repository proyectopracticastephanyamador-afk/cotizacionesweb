// src/app/auth/login-mobile/route.js
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req) {
  const { email, password } = await req.json()

  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { rol: true }
  })

  if (!user || user.estado !== "ACTIVO") {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  // 🔐 TOKEN JWT
  const token = jwt.sign(
    {
      id: user.id,
      rol: user.rol?.nombre
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  return NextResponse.json({
    token,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.nombre
    }
  })
}
