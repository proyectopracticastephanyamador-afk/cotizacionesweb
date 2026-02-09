import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH → actualizar configuración
export async function PATCH(req, { params }) {
  const resolvedParams = await params
  const rawId =
    resolvedParams?.id ??
    req?.nextUrl?.pathname?.split("/").filter(Boolean).pop()
  const id = Number(rawId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 })
  }
  try {
    const body = await req.json()

    const updated = await prisma.configuracionDeduccion.update({
      where: { id },
      data: {
        anio: Number(body.anio),
        tipo: body.tipo,
        subTipo: body.subTipo || null,
        porcentaje: body.porcentaje ? Number(body.porcentaje) : null,
        montoFijo: body.montoFijo ? Number(body.montoFijo) : null,
        techo: body.techo ? Number(body.techo) : null,
        descripcion: body.descripcion || "",
        estado: body.estado,
      }
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

// DELETE → eliminar (lógico)
export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params
    const rawId =
      resolvedParams?.id ??
      req?.nextUrl?.pathname?.split("/").filter(Boolean).pop()
    const id = Number(rawId)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 })
    }
    await prisma.configuracionDeduccion.update({
      where: { id },
      data: { estado: "ELIMINADO" }
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 })
  }
}
