import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/session"

export async function GET() {
  try {
    // ✅ SIEMPRE await
    const userId = await getSessionUserId()

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    console.log("User ID from session:", userId, typeof userId)

    const user = await prisma.usuario.findUnique({
      where: { id: userId }, // ✅ DIRECTO, SIN .value
      include: { rol: true },
    })

    if (!user || user.estado !== "ACTIVO") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.nombre,
    })
  } catch (error) {
    console.error("❌ /auth/me", error)
    return NextResponse.json({ error: "Error leyendo sesión" }, { status: 500 })
  }
}
