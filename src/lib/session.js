import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export const SESSION_COOKIE = "session_token"

function getCookieSameSite() {
  const env = String(process.env.COOKIE_SAMESITE || "").trim().toLowerCase()
  if (env === "lax" || env === "strict" || env === "none") return env
  return "lax"
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: getCookieSameSite(),
    path: "/",
    maxAge: 60 * 60 * 24, // 1 día
  }
}

/* =========================
   SESIÓN WEB (COOKIE)
========================= */

export async function setSession(userId) {
  const token = jwt.sign(
    { userId },
    process.env.SESSION_SECRET,
    { expiresIn: "1d" }
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions())
}

export async function getSessionUserId() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.SESSION_SECRET)

    const id = Number(payload.userId)
    if (!Number.isInteger(id)) return null

    return id
  } catch {
    return null
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE, { path: "/" })
}

/* 🔁 Alias (NO CAMBIAR) */
export const clearSession = clearSessionCookie
