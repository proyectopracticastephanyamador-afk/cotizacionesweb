"use client"
import { useEffect, useState } from "react"

export default function RegimenesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    aplicaIHSS: false,
    aplicaRAP: false,
    aplicaISR: true,
    aplicaINJUPEMP: false,
    aplicaIMPREMA: false,
    estado: "ACTIVO",
  })

  async function loadData() {
    setLoading(true)
    const res = await fetch("/regimenes/api")
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const openNew = () => {
    setForm({
      id: null,
      nombre: "",
      aplicaIHSS: false,
      aplicaRAP: false,
      aplicaISR: true,
      aplicaINJUPEMP: false,
      aplicaIMPREMA: false,
      estado: "ACTIVO",
    })
    setShowModal(true)
  }

  const openEdit = (r) => {
    setForm(r)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre) return alert("Nombre requerido")

    const isCreate = !form.id
    const url = isCreate ? "/regimenes/api" : `/regimenes/api/${form.id}`
    const method = isCreate ? "POST" : "PATCH"

    setSaving(true)
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)

    if (!res.ok) return alert("Error guardando")

    setShowModal(false)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar régimen?")) return

    const res = await fetch(`/regimenes/api/${id}`, {
      method: "DELETE"
    })

    if (!res.ok) return alert("No se pudo eliminar")

    loadData()
  }

  if (loading) return <p className="p-6">Cargando...</p>

  return (
    <div className="p-6 space-y-4">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Regímenes Laborales</h1>

        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Nuevo Régimen
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">IHSS</th>
            <th className="border p-2">RAP</th>
            <th className="border p-2">ISR</th>
            <th className="border p-2">INJUPEMP</th>
            <th className="border p-2">IMPREMA</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2 w-24">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{r.id}</td>
              <td className="p-2">{r.nombre}</td>
              <td className="p-2 text-center">{r.aplicaIHSS ? "✔" : "—"}</td>
              <td className="p-2 text-center">{r.aplicaRAP ? "✔" : "—"}</td>
              <td className="p-2 text-center">{r.aplicaISR ? "✔" : "—"}</td>
              <td className="p-2 text-center">{r.aplicaINJUPEMP ? "✔" : "—"}</td>
              <td className="p-2 text-center">{r.aplicaIMPREMA ? "✔" : "—"}</td>
              <td className="p-2">{r.estado}</td>
              <td className="p-2 space-x-1 flex">
                <button onClick={() => openEdit(r)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  ✏️
                </button>
                <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center text-gray-500">
                No hay regímenes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded shadow-xl w-[450px] space-y-3">
            <h2 className="text-lg font-semibold">
              {form.id ? "Editar Régimen" : "Nuevo Régimen"}
            </h2>

            <label className="font-semibold text-sm">Nombre</label>
            <input
              className="border p-2 rounded w-full"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaIHSS}
                  onChange={(e) => setForm({ ...form, aplicaIHSS: e.target.checked })}
                />
                IHSS
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaRAP}
                  onChange={(e) => setForm({ ...form, aplicaRAP: e.target.checked })}
                />
                RAP
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaISR}
                  onChange={(e) => setForm({ ...form, aplicaISR: e.target.checked })}
                />
                ISR
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaINJUPEMP}
                  onChange={(e) => setForm({ ...form, aplicaINJUPEMP: e.target.checked })}
                />
                INJUPEMP
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaIMPREMA}
                  onChange={(e) => setForm({ ...form, aplicaIMPREMA: e.target.checked })}
                />
                IMPREMA
              </label>
            </div>

            <label className="font-semibold text-sm">Estado</label>
            <select
              className="border p-2 rounded w-full"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="ELIMINADO">ELIMINADO</option>
            </select>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
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
