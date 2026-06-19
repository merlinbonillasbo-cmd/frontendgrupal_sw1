import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  descargarResumen,
  listarResumenesProyecto,
  obtenerResumenPorId,
} from "../services/resumen_service";

import type { Resumen } from "../services/resumen_service";

export default function Resumenes() {
  const { proyectoId } = useParams();
  const navigate = useNavigate();

  const idProyecto = Number(proyectoId);

  const [resumenes, setResumenes] = useState<Resumen[]>([]);
  const [resumenSeleccionado, setResumenSeleccionado] = useState<Resumen | null>(null);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarResumenes() {
    try {
      setCargando(true);
      setError("");

      const data = await listarResumenesProyecto(idProyecto);

      setResumenes(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar resúmenes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!idProyecto) {
      navigate("/proyectos");
      return;
    }

    cargarResumenes();
  }, [idProyecto]);

  async function verDetalle(resumenId: number) {
    try {
      setError("");
      setMensaje("");

      const data = await obtenerResumenPorId(resumenId);

      setResumenSeleccionado(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al obtener resumen");
    }
  }

  async function descargar(resumenId: number, formato: "txt" | "pdf" | "docx") {
    try {
      setError("");
      setMensaje("");

      await descargarResumen(resumenId, formato);

      setMensaje(`Resumen descargado en formato ${formato.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al descargar resumen");
    }
  }

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/proyectos/${idProyecto}/audios`)}
            className="mb-4 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Volver a audios
          </button>

          <p className="text-sm text-primario font-semibold uppercase tracking-wide">
            Contenido generado
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Resúmenes generados
          </h1>

          <p className="text-slate-400 mt-2">
            Consulta y descarga los resúmenes generados por la IA dentro de este proyecto.
          </p>
        </div>

        {mensaje && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Historial</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Total: {resumenes.length}
                  </p>
                </div>

                <button
                  onClick={cargarResumenes}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                >
                  Actualizar
                </button>
              </div>

              {cargando ? (
                <div className="text-slate-400 py-10 text-center">
                  Cargando resúmenes...
                </div>
              ) : resumenes.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-xl p-8 text-center">
                  <div className="text-5xl mb-4">📄</div>

                  <h3 className="text-lg font-semibold text-slate-200">
                    No hay resúmenes
                  </h3>

                  <p className="text-slate-400 mt-2">
                    Genera un resumen desde la sección de audios.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumenes.map((resumen) => (
                    <button
                      key={resumen.id}
                      onClick={() => verDetalle(resumen.id)}
                      className={`w-full text-left bg-slate-950 border rounded-xl p-4 transition-colors ${
                        resumenSeleccionado?.id === resumen.id
                          ? "border-primario"
                          : "border-slate-800 hover:border-primario/60"
                      }`}
                    >
                      <h3 className="font-semibold text-white line-clamp-1">
                        {resumen.titulo || "Resumen generado"}
                      </h3>

                      <p className="text-xs text-slate-500 mt-2">
                        Tipo: {resumen.tipo_resumen}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(resumen.creado_en).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              {!resumenSeleccionado ? (
                <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
                  <div className="text-5xl mb-4">🧠</div>

                  <h3 className="text-lg font-semibold text-slate-200">
                    Selecciona un resumen
                  </h3>

                  <p className="text-slate-400 mt-2">
                    El contenido aparecerá en este panel.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {resumenSeleccionado.titulo || "Resumen generado"}
                      </h2>

                      <p className="text-sm text-slate-400 mt-2">
                        Tipo: {resumenSeleccionado.tipo_resumen} · Modelo:{" "}
                        {resumenSeleccionado.contenido?.modelo_usado || "No especificado"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Creado: {new Date(resumenSeleccionado.creado_en).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setResumenSeleccionado(null)}
                      className="text-sm text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 max-h-[520px] overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                    {resumenSeleccionado.contenido?.texto || "Sin contenido"}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    <button
                      onClick={() => descargar(resumenSeleccionado.id, "txt")}
                      className="px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                    >
                      Descargar TXT
                    </button>

                    <button
                      onClick={() => descargar(resumenSeleccionado.id, "pdf")}
                      className="px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-colors"
                    >
                      Descargar PDF
                    </button>

                    <button
                      onClick={() => descargar(resumenSeleccionado.id, "docx")}
                      className="px-4 py-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-sm text-blue-400 transition-colors"
                    >
                      Descargar Word
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}