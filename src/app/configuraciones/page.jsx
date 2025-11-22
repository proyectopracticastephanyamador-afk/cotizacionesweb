"use client"
import { useEffect, useState } from "react"

export default function ConfiguracionesPage() {
  const [conf, setConf] = useState([])
  const [entes, setEntes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    id: null,
    enteId: "",
    anio: new Date().getFullYear(),
    tipo: "PORCENTAJE",
    subTipo: "",
    porcentaje: "",
    montoFijo: "",
    techo: "",
    estado: "ACTIVO",
    descripcion: "",
  })

  async function loadData() {
    setLoading(true)

    const [resEntes, resConf] = await Promise.all([
      fetch("/entes/api"),
      fetch("/configuraciones/api"),
    ])

    setEntes(await resEntes.json())
    setConf(await resConf.json())

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openNew() {
    setForm({
      id: null,
      enteId: "",
      anio: new Date().getFullYear(),
      tipo: "PORCENTAJE",
      subTipo: "",
      porcentaje: "",
      montoFijo: "",
      techo: "",
      estado: "ACTIVO",
      descripcion: "",
    })
    setShowModal(true)
  }

  function openEdit(c) {
    setForm({
      id: c.id,
      enteId: c.enteId,
      anio: c.anio,
      tipo: c.tipo,
      subTipo: c.subTipo || "",
      porcentaje: c.porcentaje || "",
      montoFijo: c.montoFijo || "",
      techo: c.techo || "",
      estado: c.estado,
      descripcion: c.descripcion || "",
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.enteId) return alert("Selecciona un ente.")
    if (!form.anio) return alert("Ingresa un año.")

    const isCreate = !form.id
    const url = isCreate ? "/configuraciones/api" : `/configuraciones/api/${form.id}`
    const method = isCreate ? "POST" : "PATCH"

    setSaving(true)
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)

    if (!res.ok) return alert("Error guardando configuración")

    setShowModal(false)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar configuración?")) return
    const res = await fetch(`/configuraciones/api/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) return alert("No se pudo eliminar")
    loadData()
  }

  if (loading) return <p className="p-6">Cargando configuraciones...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Configuraciones de Deducción</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Nueva Configuración
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2 text-left">Ente</th>
            <th className="border p-2">Año</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">SubTipo</th>
            <th className="border p-2">Porcentaje</th>
            <th className="border p-2">Monto Fijo</th>
            <th className="border p-2">Techo</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {conf.map((c) => (
            <tr key={c.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.ente?.nombre}</td>
              <td className="p-2">{c.anio}</td>
              <td className="p-2">{c.tipo}</td>
              <td className="p-2">{c.subTipo || "-"}</td>
              <td className="p-2">{c.porcentaje ?? "-"}</td>
              <td className="p-2">{c.montoFijo ?? "-"}</td>
              <td className="p-2">{c.techo ?? "-"}</td>
              <td className="p-2">{c.estado}</td>

              <td className="p-2 space-x-2">
                <button
                  onClick={() => openEdit(c)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ✏️
                </button>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {conf.length === 0 && (
            <tr>
              <td colSpan={10} className="p-4 text-center text-gray-500">
                No hay configuraciones
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-[560px] shadow-xl space-y-3 max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-3">
              {form.id ? "Editar Configuración" : "Nueva Configuración"}
            </h2>

            {/* Ente */}
            <label className="block text-sm font-semibold">Ente</label>
            <select
              value={form.enteId}
              onChange={(e) => setForm({ ...form, enteId: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="">Selecciona un ente</option>
              {entes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>

            {/* Año */}
            <label className="block text-sm font-semibold">Año</label>
            <input
              type="number"
              value={form.anio}
              onChange={(e) => setForm({ ...form, anio: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />

            {/* Tipo */}
            <label className="block text-sm font-semibold">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="PORCENTAJE">PORCENTAJE</option>
              <option value="TECHO">TECHO</option>
              <option value="MONTO_FIJO">MONTO_FIJO</option>
            </select>

            {/* SubTipo */}
            <label className="block text-sm font-semibold">SubTipo</label>
            <input
              type="text"
              value={form.subTipo}
              onChange={(e) => setForm({ ...form, subTipo: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              placeholder="TRABAJADOR, EMPLEADOR, etc."
            />

            {/* Porcentaje */}
            <label className="block text-sm font-semibold">
              Porcentaje (0.085, 0.10, etc.)
            </label>
            <input
              type="number"
              step="0.0001"
              value={form.porcentaje}
              onChange={(e) =>
                setForm({ ...form, porcentaje: e.target.value })
              }
              className="border p-2 rounded w-full mb-2"
            />

            {/* Monto */}
            <label className="block text-sm font-semibold">Monto Fijo</label>
            <input
              type="number"
              step="0.01"
              value={form.montoFijo}
              onChange={(e) =>
                setForm({ ...form, montoFijo: e.target.value })
              }
              className="border p-2 rounded w-full mb-2"
            />

            {/* Techo */}
            <label className="block text-sm font-semibold">Techo</label>
            <input
              type="number"
              step="0.01"
              value={form.techo}
              onChange={(e) => setForm({ ...form, techo: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />

            {/* Estado */}
            <label className="block text-sm font-semibold">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="ELIMINADO">ELIMINADO</option>
            </select>

            {/* Descripción */}
            <label className="block text-sm font-semibold">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />

            {/* Botones */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
