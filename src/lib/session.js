import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const SESSION_COOKIE = "session"

/**
 * Crear sesión (login)
 */
export function setSession(userId) {
  const token = jwt.sign(
    { userId },
    process.env.SESSION_SECRET,
    { expiresIn: "1d" }
  )

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

/**
 * Obtener ID de usuario desde la sesión
 */
export function getSessionUserId() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET)
    return decoded.userId
  } catch {
    return null
  }
}

/**
 * Cerrar sesión (logout)
 */
export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    maxAge: 0,
    path: "/",
  })
}
