import React, { useEffect, useState } from "react";
import {
  listarAudiosDisponibles,
  type AudioDisponible,
} from "../services/presentacion_service";
import {
  generarResumenSeleccion,
  listarHistorialResumenesUsuario,
  obtenerResumenPorId,
  descargarResumen,
  type Resumen,
  type TipoResumen,
} from "../services/resumen_service";

export default function PDFs() {
  // Estados para cargar datos
  const [audios, setAudios] = useState<AudioDisponible[]>([]);
  const [historial, setHistorial] = useState<Resumen[]>([]);
  const [loadingAudios, setLoadingAudios] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // Estados del generador
  const [tituloDoc, setTituloDoc] = useState("");
  const [selectedAudios, setSelectedAudios] = useState<number[]>([]);
  const [tipoResumen, setTipoResumen] = useState<TipoResumen>("MEDIO");
  const [generando, setGenerando] = useState(false);

  // Estados de visualización
  const [resumenActivo, setResumenActivo] = useState<Resumen | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Estados de feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setLoadingAudios(true);
      const dataAudios = await listarAudiosDisponibles();
      setAudios(dataAudios);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error al obtener los audios disponibles.");
    } finally {
      setLoadingAudios(false);
    }

    try {
      setLoadingHistorial(true);
      const dataHistorial = await listarHistorialResumenesUsuario();
      setHistorial(dataHistorial);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  }

  const toggleAudioSelection = (audioId: number) => {
    setSelectedAudios((prev) =>
      prev.includes(audioId) ? prev.filter((id) => id !== audioId) : [...prev, audioId]
    );
  };

  const handleCrearResumen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAudios.length === 0) {
      setErrorMsg("Debes seleccionar al menos un audio para resumir.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setGenerando(true);

    try {
      const nuevoResumen = await generarResumenSeleccion(
        tituloDoc,
        selectedAudios,
        tipoResumen
      );
      setResumenActivo(nuevoResumen);
      setSuccessMsg("¡Resumen de estudio generado con éxito por la IA!");
      setTituloDoc("");
      setSelectedAudios([]);
      
      // Recargar historial
      const dataHistorial = await listarHistorialResumenesUsuario();
      setHistorial(dataHistorial);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
          "Error al generar el resumen. Verifica el servicio de Ollama."
      );
    } finally {
      setGenerando(false);
    }
  };

  const seleccionarHistorial = async (resumenId: number) => {
    setErrorMsg("");
    setSuccessMsg("");
    setCargandoDetalle(true);
    try {
      const resumen = await obtenerResumenPorId(resumenId);
      setResumenActivo(resumen);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("No se pudo cargar el detalle del resumen seleccionado.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const descargarDoc = async (resumenId: number, formato: "pdf" | "docx" | "txt") => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await descargarResumen(resumenId, formato);
      setSuccessMsg(`Documento descargado en formato ${formato.toUpperCase()} correctamente.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error al descargar el archivo en el formato seleccionado.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
              Centro de Documentos y PDF
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
              Resúmenes Académicos con Ollama
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Combina múltiples audios y conferencias grabadas en un reporte en PDF listo para estudiar.
            </p>
          </div>
        </div>

        {/* Notificaciones */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-fade-in">
            <span>✨</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-sm">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: Generador Académico */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-6 space-y-5">
              <h2 className="text-lg font-black text-slate-800 flex items-center space-x-2">
                <span>📝</span>
                <span>Configurar Resumen</span>
              </h2>

              <form onSubmit={handleCrearResumen} className="space-y-4">
                {/* Título de Documento */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Nombre del Reporte / PDF
                  </label>
                  <input
                    type="text"
                    value={tituloDoc}
                    onChange={(e) => setTituloDoc(e.target.value)}
                    placeholder="Ej. Resumen Tema 1 y 2 - Redes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:border-[#0284c7] text-xs font-semibold text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Tipo de Resumen */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Profundidad de la IA
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["CORTO", "MEDIO", "DETALLADO"] as TipoResumen[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipoResumen(t)}
                        className={`py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${
                          tipoResumen === t
                            ? "border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selección de Audios con Scroll */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Seleccionar Audios ({selectedAudios.length})
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl max-h-56 overflow-y-auto p-3 space-y-2">
                    {loadingAudios ? (
                      <div className="text-center py-10 text-xs font-semibold text-slate-400 animate-pulse">
                        Cargando audios transcritos...
                      </div>
                    ) : audios.length === 0 ? (
                      <div className="text-center py-8 text-xs font-semibold text-slate-400">
                        No hay audios transcritos en este proyecto.
                      </div>
                    ) : (
                      audios.map((audio) => {
                        const isSelected = selectedAudios.includes(audio.id);
                        return (
                          <div
                            key={audio.id}
                            onClick={() => toggleAudioSelection(audio.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-white border-[#0284c7] shadow-sm"
                                : "bg-white/50 border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-bold text-slate-700 truncate">
                                {audio.titulo}
                              </p>
                              <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                                Proy: {audio.proyecto}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] font-bold ${
                                isSelected
                                  ? "bg-[#0284c7] border-[#0284c7] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && "✓"}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generando || selectedAudios.length === 0}
                  className="w-full bg-[#0284c7] text-white py-3 px-6 rounded-2xl font-bold text-xs shadow-lg shadow-sky-600/10 hover:bg-[#0369a1] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {generando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando en Ollama...</span>
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      <span>Generar Resumen de Estudio</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Panel Historial lateral */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2">
                <span>📚</span>
                <span>Documentos Generados ({historial.length})</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {loadingHistorial ? (
                  <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
                    Cargando historial...
                  </div>
                ) : historial.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    No tienes resúmenes creados aún.
                  </div>
                ) : (
                  historial.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => seleccionarHistorial(item.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                        resumenActivo?.id === item.id
                          ? "bg-[#f0f9ff] border-[#0284c7]"
                          : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <h4 className="text-xs font-bold text-slate-700 truncate">
                        {item.titulo || "Resumen generado"}
                      </h4>
                      <div className="flex items-center justify-between mt-2 text-[9px] text-slate-400 font-semibold">
                        <span>Profundidad: {item.tipo_resumen}</span>
                        <span>{new Date(item.creado_en).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Vista Académica Previa de Papel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-6 space-y-6">
              
              {cargandoDetalle ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-400">Cargando contenido del resumen...</p>
                </div>
              ) : !resumenActivo ? (
                <div className="border border-dashed border-slate-250 bg-slate-50/30 rounded-2xl py-24 px-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-[#e0f2fe] text-[#0284c7] rounded-3xl flex items-center justify-center text-3xl shadow-inner">
                    📄
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-lg font-bold text-slate-700">
                      No hay ningún resumen seleccionado
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Selecciona un documento del historial o completa el formulario de la izquierda para procesar audios y ver su vista académica previa aquí.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cabecera del papel */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">
                        {resumenActivo.titulo || "Resumen de Estudio"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          Profundidad: {resumenActivo.tipo_resumen}
                        </span>
                        <span className="bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded text-[10px] font-bold">
                          Motor: {resumenActivo.contenido?.modelo_usado || "Ollama"}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          Fecha: {new Date(resumenActivo.creado_en).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setResumenActivo(null)}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Cerrar Vista
                    </button>
                  </div>

                  {/* Cuerpo del Documento (Apariencia Académica) */}
                  <div className="bg-[#fcfcfd] border border-slate-200/60 rounded-2xl p-8 shadow-inner max-h-[500px] overflow-y-auto font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-wrap select-text">
                    <div className="text-center font-sans border-b-2 border-slate-800/10 pb-6 mb-6">
                      <h4 className="text-lg font-black uppercase tracking-wider text-slate-700">REPORTES ACADÉMICOS DE AUDIO</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">GENERADO MEDIANTE INTELIGENCIA ARTIFICIAL LOCAL</p>
                    </div>
                    {resumenActivo.contenido?.texto || "Este resumen no tiene texto."}
                  </div>

                  {/* Opciones de Exportación */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Exportar y Descargar Reporte Formal
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => descargarDoc(resumenActivo.id, "pdf")}
                        className="px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 border border-red-100 transition-all flex items-center justify-center space-x-2"
                      >
                        <span>📄</span>
                        <span>Descargar PDF Académico</span>
                      </button>

                      <button
                        onClick={() => descargarDoc(resumenActivo.id, "docx")}
                        className="px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-600 border border-blue-100 transition-all flex items-center justify-center space-x-2"
                      >
                        <span>📘</span>
                        <span>Descargar Word (.docx)</span>
                      </button>

                      <button
                        onClick={() => descargarDoc(resumenActivo.id, "txt")}
                        className="px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200 transition-all flex items-center justify-center space-x-2"
                      >
                        <span>📝</span>
                        <span>Descargar Texto (.txt)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
