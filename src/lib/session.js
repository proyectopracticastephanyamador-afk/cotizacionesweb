import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const SESSION_COOKIE = "session_token"

/**
 * Crea sesión WEB (cookie httpOnly)
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
 * Lee usuario autenticado desde cookie
 */
export function getSessionUserId() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.SESSION_SECRET)
    return payload.userId
  } catch {
    return null
  }
}

/**
 * Cierra sesión WEB
 */
export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE)
}

/**
 * 🔐 Login MOBILE (Bearer Token)
 */
export function createMobileToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol?.nombre,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}

/**
 * 🔐 Verifica token MOBILE
 */
export function verifyMobileToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}
