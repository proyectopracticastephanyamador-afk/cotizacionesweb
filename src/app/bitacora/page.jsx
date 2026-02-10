"use client";

import { useEffect, useState } from "react";

export default function BitacoraPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/bitacora/api");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="p-6">Cargando bitacora...</p>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--sap-primary)]">
          Bitacora del sistema
        </h1>
        <p className="text-sm text-[var(--sap-text-muted)]">
          Ultimos 100 registros
        </p>
      </div>

      <div className="card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Usuario</th>
              <th className="border p-2">Accion</th>
              <th className="border p-2">Modulo</th>
              <th className="border p-2">Descripcion</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-[var(--sap-text-muted)]">
                  No hay registros en la bitacora
                </td>
              </tr>
            )}

            {items.map((b) => (
              <tr key={b.id} className="border-t hover:bg-[#ffe6e6]">
                <td className="p-2">
                  {b.fecha ? new Date(b.fecha).toLocaleString() : ""}
                </td>
                <td className="p-2">
                  {b.usuario?.nombre || "Usuario"}
                </td>
                <td className="p-2">{b.accion}</td>
                <td className="p-2">{b.modulo}</td>
                <td className="p-2">{b.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
