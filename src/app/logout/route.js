export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { clearSession } from "@/lib/session"

export async function GET() {
  await clearSession()
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"

  const normalizedBase = baseUrl.startsWith("http")
    ? baseUrl
    : `https://${baseUrl}`

  return NextResponse.redirect(new URL("/login", normalizedBase))
}
