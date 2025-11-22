"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CotizacionesPage() {
  const [regimenes, setRegimenes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    empleadoNombre: "",
    salarioBruto: "",
    regimenId: "",
  });

  const [detalle, setDetalle] = useState(null);

  /* ======================
     CARGAR DATOS
     ====================== */
  async function loadData() {
    setLoading(true);
    const [resCot, resReg] = await Promise.all([
      fetch("/cotizaciones/api"),
      fetch("/regimenes/api"),
    ]);

    setItems(await resCot.json());
    setRegimenes(await resReg.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ======================
     PREVIEW DE CÁLCULO
     ====================== */
  async function calcularPreview() {
    if (!form.salarioBruto || !form.regimenId) return;

    const res = await fetch("/cotizaciones/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, preview: true }),
    });

    if (res.ok) {
      const d = await res.json();
      setDetalle(d.detalle);
      setShowDetalleModal(true);
    }
  }

  /* ======================
     GUARDAR COTIZACION
     ====================== */
  async function handleSave() {
    if (!form.empleadoNombre) return alert("Nombre requerido");
    if (!form.salarioBruto) return alert("Salario requerido");
    if (!form.regimenId) return alert("Seleccione un régimen");

    setSaving(true);
    const res = await fetch("/cotizaciones/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    setSaving(false);

    if (!res.ok) return alert("Error creando cotización");
    setShowModal(false);
    setShowDetalleModal(false);
    loadData();
  }

  /* ======================
     ELIMINAR
     ====================== */
  async function handleDelete(id) {
    if (!confirm("¿Eliminar?")) return;

    const res = await fetch(`/cotizaciones/api/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("No se pudo eliminar");

    loadData();
  }


  async function verDetalleCotizacion(c) {
  const res = await fetch("/cotizaciones/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empleadoNombre: c.empleadoNombre,
      salarioBruto: c.salarioBruto,
      regimenId: c.regimenId,
      preview: true
    })
  });

  if (res.ok) {
    const d = await res.json();
    setDetalle(d.detalle);
    setShowDetalleModal(true);
  }
}


  /* ======================
     GENERAR PDF
     ====================== */
  const generarPDF = async () => {
    const input = document.getElementById("pdf-content");

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "letter");
    pdf.addImage(imgData, "PNG", 20, 20, 560, 0);
    pdf.save(`cotizacion-${Date.now()}.pdf`);
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Cotizaciones</h1>

        <button
          onClick={() => {
            setForm({ empleadoNombre: "", salarioBruto: "", regimenId: "" });
            setDetalle(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Nueva Cotización
        </button>
      </div>

      {/* TABLA */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Empleado</th>
            <th className="border p-2">Salario</th>
            <th className="border p-2">Deducciones</th>
            <th className="border p-2">Neto</th>
            <th className="border p-2">Régimen</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.empleadoNombre}</td>
              <td className="p-2">L {Number(c.salarioBruto).toFixed(2)}</td>
              <td className="p-2">L {Number(c.totalDeducciones).toFixed(2)}</td>
              <td className="p-2">L {Number(c.salarioNeto).toFixed(2)}</td>
              <td className="p-2">{c.regimen?.nombre}</td>
              <button
  onClick={() => verDetalleCotizacion(c)}
  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
>
  🔍
</button>

              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==========================
          MODAL CREAR COTIZACIÓN
         ========================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[500px] space-y-3 shadow-lg">

            <h2 className="font-semibold text-lg">Nueva Cotización</h2>

            <label>Empleado</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={form.empleadoNombre}
              onChange={(e) =>
                setForm({ ...form, empleadoNombre: e.target.value })
              }
            />

            <label>Salario Bruto</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={form.salarioBruto}
              onChange={(e) =>
                setForm({ ...form, salarioBruto: e.target.value })
              }
              onBlur={calcularPreview}
            />

            <label>Régimen</label>
            <select
              className="border p-2 rounded w-full"
              value={form.regimenId}
              onChange={(e) => {
                setForm({ ...form, regimenId: e.target.value });
                calcularPreview();
              }}
            >
              <option value="">Seleccione...</option>
              {regimenes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
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

      {/* ==========================
          MODAL CON DETALLE
         ========================== */}
      {showDetalleModal && detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-lg p-6 shadow-lg max-h-[90vh] overflow-auto">

            <div id="pdf-content">
              <h2 className="text-xl font-semibold mb-4">Detalle del Cálculo</h2>

              {/* IHSS */}
              {detalle.ihss && (
                <div className="mb-3">
                  <h3 className="font-semibold">IHSS</h3>
                  <p>Base: L {detalle.ihss.base.toFixed(2)}</p>
                  <p>%: {(detalle.ihss.porcentaje * 100).toFixed(2)}%</p>
                  <p>Techo: L {detalle.ihss.techoAplicado.toFixed(2)}</p>
                  <p>Monto: L {detalle.ihss.monto.toFixed(2)}</p>
                </div>
              )}

              {/* RAP */}
              {detalle.rap && (
                <div className="mb-3">
                  <h3 className="font-semibold">RAP</h3>
                  <p>Base: L {detalle.rap.base.toFixed(2)}</p>
                  <p>%: {(detalle.rap.porcentaje * 100).toFixed(2)}%</p>
                  <p>Techo: L {detalle.rap.techoAplicado.toFixed(2)}</p>
                  <p>Monto: L {detalle.rap.monto.toFixed(2)}</p>
                </div>
              )}

              {/* INJUPEMP */}
              {detalle.injupemp && (
                <div className="mb-3">
                  <h3 className="font-semibold">INJUPEMP</h3>
                  <p>Base: L {detalle.injupemp.base.toFixed(2)}</p>
                  <p>%: {(detalle.injupemp.porcentaje * 100).toFixed(2)}%</p>
                  <p>Monto: L {detalle.injupemp.monto.toFixed(2)}</p>
                </div>
              )}

              {/* IMPREMA */}
              {detalle.imprema && (
                <div className="mb-3">
                  <h3 className="font-semibold">IMPREMA</h3>
                  <p>Base: L {detalle.imprema.base.toFixed(2)}</p>
                  <p>%: {(detalle.imprema.porcentaje * 100).toFixed(2)}%</p>
                  <p>Monto: L {detalle.imprema.monto.toFixed(2)}</p>
                </div>
              )}

              {/* ISR */}
              {detalle.isr && (
                <div className="mb-3">
                  <h3 className="font-semibold">ISR</h3>
                  <p>Renta anual: L {detalle.isr.anual.toFixed(2)}</p>

                  {detalle.isr.tramosAplicados.map((t, i) => (
                    <p key={i}>
                      Tramo {i + 1}: Base L {t.base.toFixed(2)} ×{" "}
                      {(t.porcentaje * 100).toFixed(2)}% = L{" "}
                      {t.monto.toFixed(2)}
                    </p>
                  ))}

                  <p className="font-semibold mt-2">
                    ISR mensual: L {detalle.isr.monto.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowDetalleModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cerrar
              </button>

              <button
                onClick={generarPDF}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
