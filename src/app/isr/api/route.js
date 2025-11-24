import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: listar tramos ISR (solo no eliminados)
export async function GET() {
  try {
    const data = await prisma.tramoISR.findMany({
      where: {
        estado: {
          not: "ELIMINADO",
        },
      },
      orderBy: [
        { anio: "desc" },
        { desde: "asc" },
      ],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error listando tramos ISR:", error);
    return NextResponse.json(
      { error: "Error obteniendo tramos ISR" },
      { status: 500 }
    );
  }
}

// POST: crear tramo ISR
export async function POST(req) {
  try {
    const body = await req.json();

    const nuevo = await prisma.tramoISR.create({
      data: {
        anio: body.anio,
        desde: body.desde,
        hasta: body.hasta, // puede ser null
        porcentaje: body.porcentaje,
        estado: body.estado ?? "ACTIVO",
      },
    });

    return NextResponse.json(nuevo);
  } catch (error) {
    console.error("Error creando tramo ISR:", error);
    return NextResponse.json(
      { error: "Error al crear tramo ISR" },
      { status: 500 }
    );
  }
}
