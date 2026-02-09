import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const idNumber = Number(id);
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 });
    }
    const body = await req.json();

    const actualizado = await prisma.tramoISR.update({
      where: { id: idNumber },
      data: {
        anio: body.anio,
        desde: body.desde,
        hasta: body.hasta,
        porcentaje: body.porcentaje,
        estado: body.estado ?? "ACTIVO",
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error actualizando tramo ISR:", error);
    return NextResponse.json(
      { error: "Error al actualizar tramo ISR" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const idNumber = Number(id);
    if (Number.isNaN(idNumber)) {
      return NextResponse.json({ error: "Id inválido" }, { status: 400 });
    }

    // Soft delete: marcar como ELIMINADO
    const eliminado = await prisma.tramoISR.update({
      where: { id: idNumber },
      data: { estado: "ELIMINADO" },
    });

    return NextResponse.json(eliminado);
  } catch (error) {
    console.error("Error eliminando tramo ISR:", error);
    return NextResponse.json(
      { error: "Error al eliminar tramo ISR" },
      { status: 500 }
    );
  }
}
