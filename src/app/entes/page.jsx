"use client"
import { useEffect, useState } from "react"

export default function EntesPage() {
  const [entes, setEntes] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    estado: "ACTIVO",
  })

  async function loadData() {
    setLoading(true)
    const res = await fetch("/entes/api")
    const data = await res.json()
    setEntes(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function openNew() {
    setForm({
      id: null,
      nombre: "",
      descripcion: "",
      estado: "ACTIVO",
    })
    setShowModal(true)
  }

  function openEdit(e) {
    setForm({
      id: e.id,
      nombre: e.nombre,
      descripcion: e.descripcion,
      estado: e.estado,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre) return alert("El nombre es obligatorio.")

    const isCreate = !form.id
    const url = isCreate ? "/entes/api" : `/entes/api/${form.id}`
    const method = isCreate ? "POST" : "PATCH"

    setSaving(true)
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)

    if (!res.ok) {
      return alert("Error al guardar el ente.")
    }

    setShowModal(false)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este ente?")) return

    const res = await fetch(`/entes/api/${id}`, {
      method: "DELETE"
    })

    if (!res.ok) return alert("No se pudo eliminar.")

    loadData()
  }

  if (loading) return <p className="p-6">Cargando...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Entes de Deducción</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Nuevo Ente
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2 text-left">Nombre</th>
            <th className="border p-2 text-left">Descripción</th>
            <th className="border p-2 text-center">Estado</th>
            <th className="border p-2 text-center w-28">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entes.map((e) => (
            <tr key={e.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{e.id}</td>
              <td className="p-2">{e.nombre}</td>
              <td className="p-2">{e.descripcion}</td>
              <td className="p-2 text-center">{e.estado}</td>
              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => openEdit(e)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {entes.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No hay entes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-[480px]">
            <h2 className="font-semibold text-lg mb-3">
              {form.id ? "Editar Ente" : "Nuevo Ente"}
            </h2>

            <label className="block text-sm font-semibold mb-1">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border p-2 rounded w-full mb-3"
              placeholder="IHSS, RAP, ISR, INJUPEMP, IMPREMA..."
            />

            <label className="block text-sm font-semibold mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="border p-2 rounded w-full mb-3"
            />

            <label className="block text-sm font-semibold mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="border p-2 rounded w-full mb-3"
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="ELIMINADO">ELIMINADO</option>
            </select>

            <div className="flex justify-end gap-2 mt-4">
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
