"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AuthGate({ children, onUser }) {
  const router = useRouter()
  const pathname = usePathname()

  const [loading, setLoading] = useState(true)
  const executedRef = useRef(false) // 🔐 evita loops

  useEffect(() => {
    if (pathname === "/login") {
      setLoading(false)
      return
    }

    // ⛔ evita ejecutar más de una vez
    if (executedRef.current) return
    executedRef.current = true

    const check = async () => {
      try {
        const res = await fetch("/auth/me", {
          credentials: "include",
          cache: "no-store",
        })

        if (!res.ok) {
          router.replace("/login")
          return
        }

        const user = await res.json()
        onUser?.(user)
      } catch {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    check()
  }, [pathname, router]) // 👈 NO onUser aquí

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>

  return children
}
