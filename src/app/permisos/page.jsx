"use client"
import { useEffect, useState } from "react"

export default function PermisosPage() {
  const [permisos, setPermisos] = useState([])
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    id: null,
    moduloId: "",
    descripcion: "",
    puedeCrear: false,
    puedeLeer: false,
    puedeEditar: false,
    puedeEliminar: false,
  })

  // 🔄 Cargar permisos y módulos
  async function loadData() {
    setLoading(true)
    const [resPerm, resMod] = await Promise.all([
      fetch("/permisos/api"),
      fetch("/modulos/api"),
    ])
    const [dataPerm, dataMod] = await Promise.all([
      resPerm.json(),
      resMod.json(),
    ])
    setPermisos(dataPerm)
    setModulos(dataMod)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // 💾 Guardar (crear o actualizar)
  async function handleSave() {
    if (!form.moduloId) return alert("Selecciona un módulo")
    const method = form.id ? "PATCH" : "POST"
    const url = form.id ? `/permisos/api/${form.id}` : `/permisos/api`
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    loadData()
  }

  // 🗑️ Eliminar
  async function handleDelete(id) {
    if (!confirm("¿Eliminar este permiso?")) return
    await fetch(`/permisos/api/${id}`, { method: "DELETE" })
    loadData()
  }

  // ➕ Nuevo permiso
  const openNew = () => {
    setForm({
      id: null,
      moduloId: "",
      descripcion:  "",

      puedeCrear: false,
      puedeLeer: false,
      puedeEditar: false,
      puedeEliminar: false,
    })
    setShowModal(true)
  }

  // ✏️ Editar permiso
  const openEdit = (p) => {
    setForm({
      id: p.id,
      moduloId: p.moduloId,
      descripcion: p.descripcion,
      puedeCrear: p.puedeCrear,
      puedeLeer: p.puedeLeer,
      puedeEditar: p.puedeEditar,
      puedeEliminar: p.puedeEliminar,
    })
    setShowModal(true)
  }

  if (loading) return <p className="p-6">Cargando permisos...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Gestión de Permisos</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Nuevo Permiso
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Descripción</th>
            <th className="border p-2 text-left">Módulo</th>
            <th className="border p-2 text-center">Crear</th>
            <th className="border p-2 text-center">Leer</th>
            <th className="border p-2 text-center">Editar</th>
            <th className="border p-2 text-center">Eliminar</th>
            <th className="border p-2 text-center w-32">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {permisos.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.descripcion || "-"}</td>
              <td className="p-2">{p.modulo?.nombre}</td>
              <td className="text-center">{p.puedeCrear ? "✅" : "❌"}</td>
              <td className="text-center">{p.puedeLeer ? "✅" : "❌"}</td>
              <td className="text-center">{p.puedeEditar ? "✅" : "❌"}</td>
              <td className="text-center">{p.puedeEliminar ? "✅" : "❌"}</td>
              <td className="text-center">
                <button
                  onClick={() => openEdit(p)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🧱 Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="font-semibold text-lg mb-3">
              {form.id ? "Editar Permiso" : "Nuevo Permiso"}
            </h2>
            <textarea
  placeholder="Descripción del permiso"
  value={form.descripcion || ""}
  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
  className="border p-2 w-full mb-3 rounded"
/>

            <label className="block mb-2 text-sm font-semibold">Módulo</label>
            <select
              value={form.moduloId}
              onChange={(e) => setForm({ ...form, moduloId: e.target.value })}
              className="border p-2 w-full mb-3 rounded"
            >
              <option value="">Seleccionar módulo</option>
              {modulos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>

            {["puedeCrear", "puedeLeer", "puedeEditar", "puedeEliminar"].map((key) => (
              <label key={key} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {key.replace("puede", "")}
              </label>
            ))}

            <div className="flex justify-end gap-2 mt-4">
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
