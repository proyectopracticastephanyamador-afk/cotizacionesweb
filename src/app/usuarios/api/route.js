import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// ======================================================
// GET → Listar usuarios
// ======================================================
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { rol: true },
      orderBy: { id: "desc" },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("❌ Error GET /usuarios/api", error)
    return NextResponse.json(
      { error: "Error obteniendo usuarios" },
      { status: 500 }
    )
  }
}

// ======================================================
// POST → Crear usuario
// ======================================================
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
        usuarioId: 1,
        accion: "CREACIÓN DE USUARIO",
        modulo: "Usuarios",
        descripcion: `Usuario ${nuevo.email} creado con rol ${nuevo.rol.nombre}`,
      },
    })

    return NextResponse.json(nuevo)
  } catch (error) {
    console.error("❌ Error POST /usuarios/api", error)
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}
