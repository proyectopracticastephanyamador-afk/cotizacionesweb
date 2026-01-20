"use client"

import { useEffect, useState } from "react"
import "./globals.css"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AuthGate from "../components/AuthGate"

export default function RootLayout({ children }) {
  const pathname = usePathname()

  const [openMenu, setOpenMenu] = useState(null)
  const [usuario, setUsuario] = useState(null)

  const MENU = [
    { id: "inicio", label: "Inicio", children: [] },
    {
      id: "cotizacion",
      label: "Cotización",
      children: [
        { id: "cotizaciones", label: "Cotizaciones" },
        { id: "reportes", label: "Reportes" },
      ],
    },
    {
      id: "configuracion",
      label: "Configuración",
      children: [
        { id: "entes", label: "Entes de deducción" },
        { id: "configuraciones", label: "Parámetros globales" },
        { id: "isr", label: "Impuesto sobre la Renta" },
        { id: "regimenes", label: "Regímenes laborales" },
      ],
    },
    {
      id: "seguridad",
      label: "Seguridad",
      children: [
        { id: "usuarios", label: "Usuarios" },
        { id: "roles", label: "Roles" },
        { id: "roles-permisos", label: "Roles-Permisos" },
        { id: "permisos", label: "Permisos" },
        { id: "bitacora", label: "Bitácora del sistema" },
      ],
    },
  ]

  // Si estás en /login → NO pintar nada de la app
  const isLogin = pathname === "/login"

  return (
    <html lang="es">
      <body>
        {isLogin ? (
          // ✅ Login limpio, sin banner ni menú
          <main>{children}</main>
        ) : (
          // ✅ Rutas protegidas
          <AuthGate onUser={(u) => setUsuario(u)}>
            {/* BARRA ROJA */}
            <div className="top-red-bar">
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src="/logo.png" alt="logo" style={{ height: "23px" }} />
              </div>

              {/* Usuario */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: 600 }}>
                  {usuario?.nombre || "Usuario"}
                </span>

                <Link
                  href="/logout"
                  className="btn"
                  style={{ background: "white", color: "var(--dav-red)" }}
                >
                  Cerrar
                </Link>
              </div>
            </div>

            {/* MENU GRIS */}
            <div className="menu-tabs">
              {MENU.map((m) => (
                <div key={m.id} className="relative">
                  <button
                    className="menu-item"
                    onClick={() =>
                      m.children.length > 0
                        ? setOpenMenu(openMenu === m.id ? null : m.id)
                        : (window.location.href = "/")
                    }
                  >
                    {m.label}
                  </button>

                  {m.children.length > 0 && openMenu === m.id && (
                    <div className="submenu">
                      {m.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/${child.id}`}
                          className="submenu-item"
                          onClick={() => setOpenMenu(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CONTENIDO */}
            <main style={{ padding: "0px 64px 64px 64px", marginTop: "4px" }}>
              {children}
            </main>
          </AuthGate>
        )}
      </body>
    </html>
  )
}
