"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err.error || "Login inválido")
    }

    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* BANNER ROJO SUPERIOR */}
      <div className="top-red-bar justify-center">
        <img
          src="/logo.png"
          alt="logo"
          style={{ height: "26px" }}
        />
      </div>

      {/* CUERPO */}
      <div
        className="flex flex-1 items-center justify-center p-6"
        style={{ background: "var(--dav-red)" }}
      >
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded shadow w-[380px] space-y-4"
        >
          <h1 className="text-xl font-semibold text-center">
            Iniciar sesión
          </h1>

          <input
            className="border p-2 rounded w-full"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full p-2 rounded text-white disabled:opacity-60"
            style={{ background: "var(--dav-red)" }}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </div>

    </div>
  )
}
