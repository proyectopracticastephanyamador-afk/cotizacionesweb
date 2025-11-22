"use client"
import { useEffect, useState } from "react"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    email: "",
    rolId: "",
    password: "",   // solo requerido en creación
    estado: "ACTIVO",
  })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [resUsers, resRoles] = await Promise.all([
      fetch("/usuarios/api"),
      fetch("/roles/api"),
    ])
    const [dataUsers, dataRoles] = await Promise.all([
      resUsers.json(),
      resRoles.json(),
    ])
    setUsuarios(dataUsers)
    setRoles(dataRoles)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const openNew = () => {
    setForm({
      id: null,
      nombre: "",
      email: "",
      rolId: "",
      password: "",
      estado: "ACTIVO",
    })
    setShowModal(true)
  }

  const openEdit = (u) => {
    setForm({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rolId: u.rolId,
      password: "",           // vacío: no se cambia si no se escribe
      estado: u.estado,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.nombre) return alert("Ingresa el nombre")
    if (!form.email) return alert("Ingresa el email")
    if (!form.rolId) return alert("Selecciona un rol")

    const isCreate = !form.id
    if (isCreate && !form.password) return alert("Ingresa una contraseña para crear el usuario")

    const body = {
      nombre: form.nombre,
      email: form.email,
      rolId: Number(form.rolId),
      estado: form.estado,
    }
    // Solo enviar password si viene escrita (crear o actualizar)
    if (form.password && form.password.trim().length > 0) {
      body.password = form.password
    }

    setSaving(true)
    const url = isCreate ? "/usuarios/api" : `/usuarios/api/${form.id}`
    const method = isCreate ? "POST" : "PATCH"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setSaving(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err?.error || "Error al guardar usuario")
    }

    setShowModal(false)
    loadData()
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar (marcar como ELIMINADO) este usuario?")) return
    const res = await fetch(`/usuarios/api/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err?.error || "Error al eliminar usuario")
    }
    loadData()
  }

  if (loading) return <p className="p-6">Cargando usuarios...</p>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Nuevo Usuario
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Nombre</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Rol</th>
            <th className="border p-2 text-center">Estado</th>
            <th className="border p-2 text-center w-32">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.rol?.nombre}</td>
              <td className="p-2 text-center">{u.estado}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => openEdit(u)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">Sin usuarios registrados</td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-[520px]">
            <h2 className="font-semibold text-lg mb-3">
              {form.id ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder="correo@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Rol</label>
                <select
                  value={form.rolId}
                  onChange={(e) => setForm({ ...form, rolId: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Contraseña {form.id ? "(dejar vacío para no cambiar)" : "(requerida)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="border p-2 rounded w-full"
                  placeholder={form.id ? "•••••••• (opcional)" : "••••••••"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="SUSPENDIDO">SUSPENDIDO</option>
                  <option value="ELIMINADO">ELIMINADO</option>
                </select>
              </div>
            </div>

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
