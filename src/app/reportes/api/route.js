import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseIntSafe(value, fallback) {
  const n = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Rango de fechas requerido" },
        { status: 400 }
      );
    }

    let start = new Date(startParam);
    let end = new Date(endParam);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Rango inválido" }, { status: 400 });
    }
    // incluir todo el día final
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);

    const rows = await prisma.cotizacion.findMany({
      where: {
        creadoEn: {
          gte: start,
          lt: end,
        },
      },
      include: {
        regimen: true,
      },
    });

    const byRegimen = new Map();
    for (const r of rows) {
      const key = r.regimen?.nombre || "Sin régimen";
      const current = byRegimen.get(key) || 0;
      byRegimen.set(key, current + 1);
    }

    const data = Array.from(byRegimen.entries())
      .map(([regimen, total]) => ({ regimen, total }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      start: startParam,
      end: endParam,
      total: rows.length,
      data,
    });
  } catch (error) {
    console.error("Error en reportes:", error);
    return NextResponse.json(
      { error: "Error obteniendo reporte" },
      { status: 500 }
    );
  }
}
