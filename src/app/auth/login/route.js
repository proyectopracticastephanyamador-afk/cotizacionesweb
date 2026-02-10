export const runtime = "nodejs"

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { SESSION_COOKIE, getSessionCookieOptions } from "@/lib/session"


export async function POST(req) {
  try {
    let { email, password } = await req.json()

    email = String(email || "").trim().toLowerCase()
    password = String(password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email y password requeridos" }, { status: 400 })
    }

    if (!process.env.SESSION_SECRET) {
      return NextResponse.json({ error: "SESSION_SECRET no configurado" }, { status: 500 })
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

    // ✅ token de sesión (cookie) para web
    const sessionToken = jwt.sign(
      { userId: user.id },
      process.env.SESSION_SECRET,
      { expiresIn: "1d" }
    )

    const res = NextResponse.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.nombre,
    })

    try {
      await prisma.bitacora.create({
        data: {
          usuarioId: user.id,
          accion: "INICIO DE SESION",
          modulo: "Autenticacion",
          descripcion: `Inicio de sesion de ${user.email}`,
        },
      })
    } catch (logError) {
      console.error("Error guardando bitacora login:", logError)
    }

    // ✅ aquí SÍ se guarda la cookie (Next 16)
    res.cookies.set(SESSION_COOKIE, sessionToken, getSessionCookieOptions())

    return res
  } catch (err) {
    console.error("❌ /auth/login", err)
    return NextResponse.json({ error: "Error autenticando" }, { status: 500 })
  }
}
