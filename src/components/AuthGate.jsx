"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function AuthGate({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      // Permitir entrar a /login sin sesión
      if (pathname === "/login") {
        setLoading(false)
        return
      }

      const res = await fetch("/auth/me")
      if (!res.ok) {
        router.replace("/login")
        return
      }
      setLoading(false)
    }

    check()
  }, [pathname, router])

  if (loading) return <p className="p-6">Cargando...</p>

  return children
}
