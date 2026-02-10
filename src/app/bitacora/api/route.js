import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { verifyMobileAuth } from "@/lib/auth-mobile";

async function getActorInfo(req) {
  const auth = req.headers.get("authorization");
  if (auth) {
    const mobile = verifyMobileAuth(req);
    const mobileId = Number(mobile?.id);
    if (Number.isInteger(mobileId)) {
      return { userId: mobileId, canal: "MOBILE" };
    }
    return { userId: 1, canal: "MOBILE" };
  }

  const webUserId = await getSessionUserId();
  if (Number.isInteger(webUserId)) {
    return { userId: webUserId, canal: "WEB" };
  }

  return { userId: 1, canal: "WEB" };
}

// GET: listar ultimos 100 registros de bitacora
export async function GET() {
  try {
    const data = await prisma.bitacora.findMany({
      orderBy: { fecha: "desc" },
      take: 100,
      include: {
        usuario: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error listando bitacora:", error);
    return NextResponse.json(
      { error: "Error obteniendo bitacora" },
      { status: 500 }
    );
  }
}

// POST: crear registro de bitacora (uso interno)
export async function POST(req) {
  try {
    const body = await req.json();
    const actor = await getActorInfo(req);

    if (!body?.accion || !body?.modulo) {
      return NextResponse.json(
        { error: "accion y modulo son requeridos" },
        { status: 400 }
      );
    }

    const created = await prisma.bitacora.create({
      data: {
        usuarioId: actor.userId,
        accion: String(body.accion),
        modulo: String(body.modulo),
        descripcion: body.descripcion
          ? `${String(body.descripcion)} - Canal ${actor.canal}`
          : `Canal ${actor.canal}`,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error creando bitacora:", error);
    return NextResponse.json(
      { error: "Error creando bitacora" },
      { status: 500 }
    );
  }
}
