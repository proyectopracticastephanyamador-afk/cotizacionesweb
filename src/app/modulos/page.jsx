"use client"
import { useEffect, useState } from "react"

export default function ModulosPage() {
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ id: null, nombre: "", descripcion: "" })

  async function loadData() {
    setLoading(true)
    const res = await fetch("/modulos/api")
    const data = await res.json()
    setModulos(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSave() {
    if (!form.nombre.trim()) return alert("El nombre del módulo es obligatorio")
    const method = form.id ? "PATCH" : "POST"
    const url = form.id ? `/modulos/api/${form.id}` : `/modulos/api`
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este módulo?")) return
    await fetch(`/modulos/api/${id}`, { method: "DELETE" })
    loadData()
  }

  const openNew = () => {
    setForm({ id: null, nombre: "", descripcion: "" })
    setShowModal(true)
  }

  const openEdit = (m) => {
    setForm(m)
    setShowModal(true)
  }

  if (loading) return <p className="p-6">Cargando módulos...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gestión de Módulos</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Nuevo Módulo
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Nombre</th>
            <th className="border p-2 text-left">Descripción</th>
            <th className="border p-2 text-center w-32">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {modulos.map((m) => (
            <tr key={m.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{m.id}</td>
              <td className="p-2">{m.nombre}</td>
              <td className="p-2">{m.descripcion || "-"}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => openEdit(m)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="font-semibold text-lg mb-3">
              {form.id ? "Editar Módulo" : "Nuevo Módulo"}
            </h2>
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border p-2 w-full mb-3 rounded"
            />
            <textarea
              placeholder="Descripción"
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="border p-2 w-full mb-3 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
