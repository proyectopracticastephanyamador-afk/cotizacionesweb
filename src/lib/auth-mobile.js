import jwt from "jsonwebtoken"

export function verifyMobileAuth(req) {
  const auth = req.headers.get("authorization")
  if (!auth) return null

  try {
    const token = auth.replace("Bearer ", "")
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}
