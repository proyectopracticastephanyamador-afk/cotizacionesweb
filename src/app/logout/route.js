import { NextResponse } from "next/server"
import { clearSessionCookie } from "@/lib/session"

export async function GET() {
  clearSessionCookie()
  return NextResponse.redirect(new URL("/login", "http://localhost:3000"))
}
