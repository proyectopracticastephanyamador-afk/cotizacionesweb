import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "session"
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || process.env.JWT_SECRET)

export async function setSessionCookie(res, payload) {
  // payload: { id, rol, nombre } lo que quieras guardar
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET)

  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSessionCookie(res) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
