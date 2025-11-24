"use client";

import { useEffect, useState } from "react";

const ESTADOS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];

export default function ISRConfigPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // tramo en edición o null

  const [form, setForm] = useState({
    anio: new Date().getFullYear().toString(),
    desde: "",
    hasta: "",
    porcentaje: "",
    estado: "ACTIVO",
  });

  // =======================
  // CARGAR DATOS
  // =======================
  async function loadData() {
    setLoading(true);
    const res = await fetch("/isr/api");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // =======================
  // ABRIR MODAL (nuevo / editar)
  // =======================
  function abrirNuevo() {
    setEditing(null);
    setForm({
      anio: new Date().getFullYear().toString(),
      desde: "",
      hasta: "",
      porcentaje: "",
      estado: "ACTIVO",
    });
    setShowModal(true);
  }

  function abrirEdicion(tramo) {
    setEditing(tramo);
    setForm({
      anio: tramo.anio.toString(),
      desde: tramo.desde.toString(),
      hasta: tramo.hasta !== null ? tramo.hasta.toString() : "",
      porcentaje: tramo.porcentaje.toString(),
      estado: tramo.estado,
    });
    setShowModal(true);
  }

  // =======================
  // GUARDAR (create / update)
  // =======================
  async function handleSave(e) {
    e.preventDefault();

    if (!form.anio || !form.desde || !form.porcentaje) {
      alert("Año, desde y porcentaje son obligatorios");
      return;
    }

    const payload = {
      anio: parseInt(form.anio, 10),
      desde: parseFloat(form.desde),
      hasta: form.hasta ? parseFloat(form.hasta) : null,
      porcentaje: parseFloat(form.porcentaje) / 100, // guardamos como 0.15, etc.
      estado: form.estado,
    };

    setSaving(true);

    let res;
    if (editing) {
      res = await fetch(`/isr/api/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/isr/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Error guardando ISR", err);
      alert("No se pudo guardar el tramo ISR");
      return;
    }

    setShowModal(false);
    setEditing(null);
    await loadData();
  }

  // =======================
  // ELIMINAR (soft delete)
  // =======================
  async function handleDelete(id) {
    if (!confirm("¿Eliminar este tramo de ISR?")) return;

    const res = await fetch(`/isr/api/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("No se pudo eliminar");
      return;
    }
    await loadData();
  }

  if (loading) return <p className="p-6">Cargando configuración ISR...</p>;

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--sap-primary)]">
            Configuración de ISR
          </h1>
          <p className="text-sm text-[var(--sap-text-muted)]">
            Administración de tramos de Impuesto Sobre la Renta según normativa vigente.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="bg-[var(--sap-primary)] text-white px-4 py-1 rounded hover:bg-[var(--sap-primary-hover)]"
        >
          Nuevo tramo ISR
        </button>
      </div>

      {/* TABLA */}
      <div className="card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2">Año</th>
              <th className="border p-2">Desde (L)</th>
              <th className="border p-2">Hasta (L)</th>
              <th className="border p-2">% Impuesto</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-[var(--sap-text-muted)]">
                  No hay tramos configurados
                </td>
              </tr>
            )}

            {items.map((t) => (
              <tr key={t.id} className="border-t hover:bg-[#ffe6e6]">
                <td className="p-2">{t.anio}</td>
                <td className="p-2">L {Number(t.desde).toFixed(2)}</td>
                <td className="p-2">
                  {t.hasta ? `L ${Number(t.hasta).toFixed(2)}` : "En adelante"}
                </td>
                <td className="p-2">
                  {(Number(t.porcentaje) * 100).toFixed(2)} %
                </td>
                <td className="p-2">
                  <span
                    className={
                      t.estado === "ACTIVO"
                        ? "px-2 py-0.5 rounded text-xs bg-green-100 text-green-700"
                        : "px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                    }
                  >
                    {t.estado}
                  </span>
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => abrirEdicion(t)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[480px] space-y-3 shadow-lg">
            <h2 className="font-semibold text-lg mb-2">
              {editing ? "Editar tramo ISR" : "Nuevo tramo ISR"}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Año</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Desde (L)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="border p-2 rounded w-full"
                    value={form.desde}
                    onChange={(e) =>
                      setForm({ ...form, desde: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Hasta (L)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="border p-2 rounded w-full"
                    value={form.hasta}
                    onChange={(e) =>
                      setForm({ ...form, hasta: e.target.value })
                    }
                    placeholder="Vacío = en adelante"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Porcentaje de impuesto (%)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="border p-2 rounded w-full"
                  value={form.porcentaje}
                  onChange={(e) =>
                    setForm({ ...form, porcentaje: e.target.value })
                  }
                  placeholder="Ej. 15.0 para 15%"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Estado</label>
                <select
                  className="border p-2 rounded w-full"
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value })
                  }
                >
                  {ESTADOS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 bg-[var(--sap-primary)] text-white rounded disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
