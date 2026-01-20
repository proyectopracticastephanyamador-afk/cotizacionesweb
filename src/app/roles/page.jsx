"use client"
import { useEffect, useState } from "react"

export default function RolesPage() {
  const [items, setItems] = useState([])
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
    const res = await fetch("/roles/api")
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const openNew = () => {
    setForm({ id: null, nombre: "", descripcion: "", estado: "ACTIVO" })
    setShowModal(true)
  }

  const openEdit = (r) => {
    setForm(r)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre) return alert("Nombre requerido")

    const isCreate = !form.id
    const url = isCreate ? "/roles/api" : `/roles/api/${form.id}`
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
    if (!confirm("¿Eliminar rol?")) return

    const res = await fetch(`/roles/api/${id}`, { method: "DELETE" })
    if (!res.ok) return alert("No se pudo eliminar")

    loadData()
  }

  if (loading) return <p className="p-6">Cargando...</p>

  return (
    <div className="p-6 space-y-4">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-1 rounded">
          Nuevo Rol
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Descripción</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2 w-24">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.id}</td>
              <td className="border p-2">{r.nombre}</td>
              <td className="border p-2">{r.descripcion}</td>
              <td className="border p-2">{r.estado}</td>
              <td className="border p-2 flex gap-1">
                <button onClick={() => openEdit(r)}>✏️</button>
                <button onClick={() => handleDelete(r.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 w-[400px] space-y-2">
            <input
              className="border p-2 w-full"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <textarea
              className="border p-2 w-full"
              placeholder="Descripción"
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <select
              className="border p-2 w-full"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option>ACTIVO</option>
              <option>INACTIVO</option>
              <option>ELIMINADO</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
