"use client"
import { useEffect, useState } from "react"

export default function RolesPermisosPage() {
  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [items, setItems] = useState([])
  const [rolActivo, setRolActivo] = useState(null)
  const [permisoId, setPermisoId] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // =============================
  // Carga inicial
  // =============================
  async function loadBase() {
    const [r, p] = await Promise.all([
      fetch("/roles/api").then(r => r.json()),
      fetch("/permisos/api").then(r => r.json()),
    ])
    setRoles(r)
    setPermisos(p)
    setLoading(false)
  }

  async function loadAsignaciones(rolId) {
    const res = await fetch(`/roles-permisos/api?rolId=${rolId}`)
    setItems(await res.json())
  }

  useEffect(() => {
    loadBase()
  }, [])

  // =============================
  // Modal
  // =============================
  const openModal = async (rol) => {
    setRolActivo(rol)
    setShowModal(true)
    await loadAsignaciones(rol.id)
  }

  // =============================
  // Asignar permiso
  // =============================
  async function handleAdd() {
    if (!permisoId) return alert("Seleccione un permiso")

    setSaving(true)
    const res = await fetch("/roles-permisos/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rolId: rolActivo.id,
        permisoId,
      }),
    })
    setSaving(false)

    if (!res.ok) return alert("Error asignando permiso")

    setPermisoId("")
    loadAsignaciones(rolActivo.id)
  }

  // =============================
  // Quitar permiso
  // =============================
  async function handleDelete(id) {
    if (!confirm("¿Quitar permiso del rol?")) return

    await fetch(`/roles-permisos/api/${id}`, { method: "DELETE" })
    loadAsignaciones(rolActivo.id)
  }

  if (loading) return <p className="p-6">Cargando...</p>

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-semibold">Roles</h1>

      {/* TABLA ROLES */}
      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2 w-32">Permisos</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.id}</td>
              <td className="border p-2">{r.nombre}</td>
              <td className="border p-2">{r.estado}</td>
              <td className="border p-2">
                <button
                  onClick={() => openModal(r)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && rolActivo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded shadow-xl w-[520px] space-y-3">

            <h2 className="text-lg font-semibold">
              Permisos del rol: {rolActivo.nombre}
            </h2>

            {/* SELECT PERMISOS */}
            <div className="flex gap-2">
              <select
                className="border p-2 rounded w-full"
                value={permisoId}
                onChange={(e) => setPermisoId(e.target.value)}
              >
                <option value="">Seleccione permiso</option>
                {permisos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.descripcion}
                  </option>
                ))}
              </select>

              <button
                disabled={saving}
                onClick={handleAdd}
                className="bg-blue-600 text-white px-3 rounded disabled:opacity-60"
              >
                Agregar
              </button>
            </div>

            {/* TABLA PERMISOS ASIGNADOS */}
            <table className="w-full border text-sm">
              <thead>
                <tr>
                  <th className="border p-2">Permiso</th>
                  <th className="border p-2 w-20">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id}>
                    <td className="border p-2">
                      {i.permiso.descripcion}
                    </td>
                    <td className="border p-2 text-center">
                      <button onClick={() => handleDelete(i.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-3 text-center text-gray-500">
                      Sin permisos asignados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
