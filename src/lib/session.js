import { cookies } from "next/headers"

const COOKIE_NAME = "sid"

// ⚠️ Demo simple: guardamos userId en cookie
// En producción, lo ideal es guardar un token/tabla de sesiones.
export function setSession(userId) {
  cookies().set(COOKIE_NAME, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
}

export function clearSession() {
  cookies().delete(COOKIE_NAME)
}

export function getSessionUserId() {
  const v = cookies().get(COOKIE_NAME)?.value
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
