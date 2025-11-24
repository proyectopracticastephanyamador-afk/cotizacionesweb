"use client";

import { useState } from "react";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const usuario = {
    nombre: "TEST",
    avatar: "/avatar.png",
    rol: "ADMIN",
  };

const MENU = [
   {
    id: "inicio",
    label: "Inicio",
    children: []  // No tiene submenú
  },
  {
    id: "cotizacion",
    label: "Cotización",
    children: [
      { id: "cotizaciones", label: "Cotizaciones" },

      { id: "reportes", label: "Reportes" },
    ]
  },

  {
    id: "configuracion",
    label: "Configuración",
    children: [
      { id: "entes", label: "Entes de deducción" },
      { id: "configuraciones", label: "Parámetros globales" },
      { id: "isr", label: "Impuesto sobre la Renta" },
      { id: "regimenes", label: "Regímenes laborales" },
    ]
  },

  {
    id: "seguridad",
    label: "Seguridad",
    children: [
      { id: "usuarios", label: "Usuarios" },
      { id: "roles", label: "Roles" },
      { id: "permisos", label: "Permisos" },
      { id: "bitacora", label: "Bitácora del sistema" },
    ]
  }
];

const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <html lang="es">
      <body >

        {/* BARRA ROJA */}
        <div className="top-red-bar">
          
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/logo.png"
              alt="logo"
              style={{ height: "23px" }}
            />
          </div>

          {/* Usuario */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 600 }}>{usuario.nombre}</span>
            <Link href="/logout" className="btn" style={{ background: "white", color: "var(--dav-red)" }}>
              Cerrar
            </Link>
          </div>
        </div>

        {/* MENU GRIS */}
   {/* MENU GRIS (PRIMER NIVEL) */}
{/* MENU GRIS */}
<div className="menu-tabs">

  {MENU.map((m) => (
    <div key={m.id} className="relative">

      {/* BOTÓN DEL MENÚ */}
      <button
        className="menu-item"
        onClick={() =>
          m.children.length > 0
            ? setOpenMenu(openMenu === m.id ? null : m.id)
            : window.location.href = "/"

        }
      >
        {m.label}
      </button>

      {/* SUBMENÚ SI TIENE HIJOS */}
      {m.children.length > 0 && openMenu === m.id && (
        <div className="submenu">
          {m.children.map((child) => (
            <Link key={child.id} href={`/${child.id}`} className="submenu-item">
              {child.label}
            </Link>
          ))}
        </div>
      )}

    </div>
  ))}

</div>


        {/* CONTENIDO */}
        <main style={{ padding: "0px 64px 64px 64px", marginTop: "4px",border: "8px", borderBlock: "white" }}>
          {children}
        </main>

      </body>
    </html>
  );
}
