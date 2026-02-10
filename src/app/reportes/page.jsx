"use client";

import { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ReportesPage() {
  const now = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ total: 0, data: [] });

  async function loadData(start, end) {
    setLoading(true);
    const params = new URLSearchParams();
    if (start && end) {
      params.set("start", start);
      params.set("end", end);
    }
    const res = await fetch(`/reportes/api?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadData(startDate, endDate);
  }, []);

  const chartData = useMemo(() => {
    const labels = (data?.data || []).map((d) => d.regimen);
    const values = (data?.data || []).map((d) => d.total);
    const colors = [
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#84cc16",
      "#22c55e",
      "#14b8a6",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#d946ef",
      "#ec4899",
    ];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: "#ffffff",
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--sap-primary)]">
          Reporte de Cotizaciones
        </h1>
        <p className="text-sm text-[var(--sap-text-muted)]">
          Filtra por mes y visualiza el total por régimen
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Desde</label>
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Hasta</label>
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          className="bg-[var(--sap-primary)] text-white px-4 py-1 rounded hover:bg-[var(--sap-primary-hover)]"
          onClick={() => loadData(startDate, endDate)}
        >
          Aplicar
        </button>
      </div>

      {loading ? (
        <p className="p-4">Cargando reporte...</p>
      ) : (
        <>
          <div className="card p-4">
            <p className="text-sm text-[var(--sap-text-muted)]">
              Total cotizaciones: <strong>{data?.total || 0}</strong>
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex justify-center md:justify-start">
                {(data?.data || []).length === 0 ? (
                  <p className="text-sm text-[var(--sap-text-muted)]">
                    No hay cotizaciones para este mes
                  </p>
                ) : (
                  <div className="max-w-[420px] w-full">
                    <Pie data={chartData} />
                  </div>
                )}
              </div>

              <div className="w-full">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border p-2">Régimen</th>
                      <th className="border p-2">Total cotizaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.data || []).map((d) => (
                      <tr key={d.regimen} className="border-t">
                        <td className="p-2">{d.regimen}</td>
                        <td className="p-2">{d.total}</td>
                      </tr>
                    ))}

                    {(data?.data || []).length === 0 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="p-3 text-center text-[var(--sap-text-muted)]"
                        >
                          No hay datos para mostrar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
