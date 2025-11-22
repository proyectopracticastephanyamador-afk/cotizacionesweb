"use client"
import { useEffect, useState } from "react"

export default function RolesPermisosPage() {
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    id: null,
    rolId: "",
    permisoId: "",
    descripcion: "",
  })

  async function loadData() {
    setLoading(true)
    const [resRoles, resPermisos, resAsignaciones] = await Promise.all([
      fetch("/roles/api"),
      fetch("/permisos/api"),
      fetch("/roles-permisos/api"),
    ])
    const [dataRoles, dataPermisos, dataAsignaciones] = await Promise.all([
      resRoles.json(),
      resPermisos.json(),
      resAsignaciones.json(),
    ])
    setRoles(dataRoles)
    setPermisos(dataPermisos)
    setAsignaciones(dataAsignaciones)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSave() {
    if (!form.rolId || !form.permisoId) return alert("Seleccione rol y permiso")
    const method = form.id ? "PATCH" : "POST"
    const url = form.id ? `/roles-permisos/api/${form.id}` : `/roles-permisos/api`
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta asignación?")) return
    await fetch(`/roles-permisos/api/${id}`, { method: "DELETE" })
    loadData()
  }

  const openNew = () => {
    setForm({ id: null, rolId: "", permisoId: "", descripcion: "" })
    setShowModal(true)
  }

  const openEdit = (a) => {
    setForm({
      id: a.id,
      rolId: a.rolId,
      permisoId: a.permisoId,
      descripcion: a.descripcion || "",
    })
    setShowModal(true)
  }

  if (loading) return <p className="p-6">Cargando roles y permisos...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Asignar Permisos a Roles</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Nueva Asignación
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Módulo</th>
            <th className="border p-2">Descripción</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2 w-32 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((a) => (
            <tr key={a.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{a.id}</td>
              <td className="p-2">{a.rol?.nombre}</td>
              <td className="p-2">{a.permiso?.modulo?.nombre}</td>
              <td className="p-2">{a.descripcion || a.permiso?.descripcion || "-"}</td>
              <td className="p-2 text-center">{a.estado}</td>
              <td className="text-center">
                <button
                  onClick={() => openEdit(a)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
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
              {form.id ? "Editar Asignación" : "Nueva Asignación"}
            </h2>

            <label className="block mb-2 text-sm font-semibold">Rol</label>
            <select
              value={form.rolId}
              onChange={(e) => setForm({ ...form, rolId: e.target.value })}
              className="border p-2 w-full mb-3 rounded"
            >
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-semibold">Permiso</label>
            <select
              value={form.permisoId}
              onChange={(e) => setForm({ ...form, permisoId: e.target.value })}
              className="border p-2 w-full mb-3 rounded"
            >
              <option value="">Seleccione un permiso</option>
              {permisos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.modulo?.nombre} — {p.descripcion || "Sin descripción"}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Descripción de la asignación"
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
