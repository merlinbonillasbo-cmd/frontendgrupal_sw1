import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarProyectos,
  type Proyecto,
} from "../services/proyecto_service";
import {
  descargarResumen,
  listarResumenesProyecto,
  obtenerResumenPorId,
  guardarResumenManual,
  listarHistorialResumenesUsuario,
  type Resumen,
} from "../services/resumen_service";
import {
  preguntarProyecto,
  listarConversacionesProyecto,
  listarMensajesConversacion,
  eliminarConversacion,
  type ChatConversacion,
  type ChatMensaje,
} from "../services/chat_service";

export default function ResumenesGlobales() {
  const navigate = useNavigate();

  // Proyectos
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoActivoId, setProyectoActivoId] = useState<number | "">("");

  // Resúmenes
  const [resumenes, setResumenes] = useState<Resumen[]>([]);
  const [resumenSeleccionado, setResumenSeleccionado] = useState<Resumen | null>(null);
  const [cargandoResumenes, setCargandoResumenes] = useState(false);

  // Control de Pestañas
  const [activeTab, setActiveTab] = useState<"documento" | "chat">("documento");

  // Chat RAG
  const [conversaciones, setConversaciones] = useState<ChatConversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<ChatConversacion | null>(null);
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [pregunta, setPregunta] = useState("");
  const [cargandoChat, setCargandoChat] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    cargarProyectosYHistorial();
  }, []);

  // Carga inicial
  async function cargarProyectosYHistorial() {
    try {
      const dataProyectos = await listarProyectos();
      setProyectos(dataProyectos);
    } catch (err) {
      console.error("Error al cargar proyectos:", err);
    }
    cargarHistorialGlobal();
  }

  // Carga global de todos los resúmenes de todos los proyectos
  async function cargarHistorialGlobal() {
    try {
      setCargandoResumenes(true);
      setErrorMsg("");
      const data = await listarHistorialResumenesUsuario();
      setResumenes(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al cargar el historial global.");
    } finally {
      setCargandoResumenes(false);
    }
  }

  // Al seleccionar un proyecto específico
  async function handleSelectProyecto(pId: number | "") {
    setProyectoActivoId(pId);
    setConversacionActiva(null);
    setMensajes([]);
    
    if (pId === "") {
      // Cargar global
      cargarHistorialGlobal();
      setConversaciones([]);
    } else {
      // Cargar filtrado
      try {
        setCargandoResumenes(true);
        const dataResumenes = await listarResumenesProyecto(pId);
        setResumenes(dataResumenes);
        
        const dataConvs = await listarConversacionesProyecto(pId);
        setConversaciones(dataConvs);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || "Error al cargar datos del proyecto.");
      } finally {
        setCargandoResumenes(false);
      }
    }
  }

  // Seleccionar y ver detalle de resumen
  async function verDetalle(resumenId: number) {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const data = await obtenerResumenPorId(resumenId);
      setResumenSeleccionado(data);
      setActiveTab("documento");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al obtener detalle del resumen.");
    }
  }

  // Descargar resumen
  async function descargar(resumenId: number, formato: "txt" | "pdf" | "docx") {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await descargarResumen(resumenId, formato);
      setSuccessMsg(`Resumen descargado en formato ${formato.toUpperCase()}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al descargar resumen");
    }
  }

  // Enviar consulta en el chat RAG
  async function enviarPregunta(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!proyectoActivoId) {
      setErrorMsg("Por favor, selecciona un proyecto para chatear.");
      return;
    }
    if (!pregunta.trim()) return;

    try {
      setEnviando(true);
      setErrorMsg("");
      setSuccessMsg("");

      const data = await preguntarProyecto(
        Number(proyectoActivoId),
        pregunta,
        conversacionActiva?.id || null
      );

      setConversacionActiva(data.conversacion);
      setMensajes((prev) => [...prev, data.pregunta, data.respuesta]);
      setPregunta("");
      
      // Recargar conversaciones
      const dataConvs = await listarConversacionesProyecto(Number(proyectoActivoId));
      setConversaciones(dataConvs);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al chatear con el RAG.");
    } finally {
      setEnviando(false);
    }
  }

  // Dictado por micrófono nativo
  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Tu navegador no soporta entrada de voz por micrófono.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setPregunta((prev) => (prev ? prev + " " + text : text));
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  // Guardar un texto del chat como un resumen de estudio formal
  async function guardarComoResumen(texto: string) {
    const titulo = prompt(
      "Ingresa el título de tu nuevo resumen académico:",
      `Resumen de Chat - ${new Date().toLocaleDateString()}`
    );

    if (!titulo || !titulo.trim()) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      const nuevoResumen = await guardarResumenManual(titulo, texto, []);
      
      // Recargar resúmenes
      if (proyectoActivoId === "") {
        await cargarHistorialGlobal();
      } else {
        const dataResumenes = await listarResumenesProyecto(Number(proyectoActivoId));
        setResumenes(dataResumenes);
      }

      setResumenSeleccionado(nuevoResumen);
      setSuccessMsg("¡Resumen del chat guardado exitosamente en el historial!");
      setActiveTab("documento");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al guardar el resumen.");
    }
  }

  // Cargar mensajes de una conversación
  async function cargarMensajesChat(conv: ChatConversacion) {
    try {
      setCargandoChat(true);
      setErrorMsg("");
      setConversacionActiva(conv);
      const data = await listarMensajesConversacion(conv.id);
      setMensajes(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al cargar mensajes del chat.");
    } finally {
      setCargandoChat(false);
    }
  }

  // Eliminar conversación
  async function borrarConversacion(conversacionId: number) {
    if (!confirm("¿Seguro que deseas eliminar esta conversación?")) return;
    try {
      setErrorMsg("");
      await eliminarConversacion(conversacionId);
      if (conversacionActiva?.id === conversacionId) {
        setConversacionActiva(null);
        setMensajes([]);
      }
      setSuccessMsg("Conversación eliminada.");
      if (proyectoActivoId !== "") {
        const dataConvs = await listarConversacionesProyecto(Number(proyectoActivoId));
        setConversaciones(dataConvs);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al eliminar conversación.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <span className="text-[10px] font-black tracking-wider text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
              Consola Interactiva
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
              Resúmenes Globales y Chat RAG
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Consulta tu historial unificado de resúmenes de estudio o conversa con tus clases mediante Ollama.
            </p>
          </div>

          {/* Selector de Proyecto */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Proyecto:
            </label>
            <select
              value={proyectoActivoId}
              onChange={(e) => {
                const val = e.target.value;
                handleSelectProyecto(val === "" ? "" : Number(val));
              }}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#0284c7]"
            >
              <option value="">-- Todos los Proyectos --</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
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
          
          {/* Panel Izquierdo: Resúmenes */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl shadow-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span>📄</span>
                  <span>Historial de Resúmenes</span>
                </h2>
                <span className="text-[10px] bg-[#f0f9ff] text-[#0284c7] font-bold px-2 py-0.5 rounded-full">
                  {resumenes.length}
                </span>
              </div>

              {cargandoResumenes ? (
                <div className="text-slate-400 py-16 text-center text-xs font-bold animate-pulse">
                  Cargando documentos...
                </div>
              ) : resumenes.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-[#f0f9ff]/20 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <h3 className="text-xs font-bold text-slate-700">Sin Reportes</h3>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    No hay resúmenes generados para esta selección.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {resumenes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => verDetalle(item.id)}
                      className={`w-full text-left bg-slate-50 border rounded-xl p-3.5 transition-all hover:scale-[1.01] ${
                        resumenSeleccionado?.id === item.id
                          ? "border-[#0284c7] bg-[#f0f9ff] ring-2 ring-[#0284c7]/10"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {item.titulo || "Resumen generado"}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-[9px] text-slate-400 font-semibold">
                        <span>Tipo: {item.tipo_resumen}</span>
                        <span>{new Date(item.creado_en).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho: Pestañas */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Navegación de Pestañas */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 max-w-sm">
              <button
                onClick={() => setActiveTab("documento")}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "documento"
                    ? "bg-[#0284c7] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                📄 Resumen Académico
              </button>
              <button
                onClick={() => {
                  if (!proyectoActivoId) {
                    setErrorMsg("Para chatear, primero debes seleccionar un Proyecto específico arriba a la derecha.");
                    return;
                  }
                  setActiveTab("chat");
                }}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  !proyectoActivoId ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  activeTab === "chat"
                    ? "bg-[#0284c7] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                💬 Chat con Voz
              </button>
            </div>

            {/* Contenido de Pestañas */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100">
              
              {activeTab === "documento" ? (
                /* VISTA DE DOCUMENTO ACADÉMICO */
                !resumenSeleccionado ? (
                  <div className="border border-dashed border-slate-250 bg-slate-50/20 rounded-2xl py-28 px-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-[#e0f2fe] text-[#0284c7] rounded-3xl flex items-center justify-center text-3xl shadow-inner">
                      📄
                    </div>
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h3 className="text-base font-black text-slate-700">
                        Selecciona un resumen del historial
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Haz clic en cualquiera de los resúmenes guardados a la izquierda para cargarlo en la hoja física de papel y descargarlo en formato académico formal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Detalles superiores */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-slate-100 pb-4 gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-800">
                          {resumenSeleccionado.titulo || "Resumen generado"}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">
                            Profundidad: {resumenSeleccionado.tipo_resumen}
                          </span>
                          <span className="bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded text-[10px] font-bold">
                            Motor: {resumenSeleccionado.contenido?.modelo_usado || "Ollama"}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            Fecha: {new Date(resumenSeleccionado.creado_en).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setResumenSeleccionado(null)}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Cerrar reporte
                      </button>
                    </div>

                    {/* Hoja de papel académica */}
                    <div className="bg-[#fcfcfd] border border-slate-200/60 rounded-2xl p-8 shadow-inner max-h-[460px] overflow-y-auto font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-wrap select-text">
                      <div className="text-center font-sans border-b-2 border-slate-800/10 pb-6 mb-6">
                        <h4 className="text-md font-black uppercase tracking-wider text-slate-700">REPORTES ACADÉMICOS DE ESTUDIO</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">SISTEMA INTEGRADO RAG FASTAPI / OLLAMA</p>
                      </div>
                      {resumenSeleccionado.contenido?.texto || "Sin texto disponible."}
                    </div>

                    {/* Descargadores */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Opciones de Exportación Profesional
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => descargar(resumenSeleccionado.id, "pdf")}
                          className="px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 border border-red-100 transition-all flex items-center justify-center space-x-2"
                        >
                          <span>📄</span>
                          <span>Descargar PDF</span>
                        </button>
                        <button
                          onClick={() => descargar(resumenSeleccionado.id, "docx")}
                          className="px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-600 border border-blue-100 transition-all flex items-center justify-center space-x-2"
                        >
                          <span>📘</span>
                          <span>Descargar Word</span>
                        </button>
                        <button
                          onClick={() => descargar(resumenSeleccionado.id, "txt")}
                          className="px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200 transition-all flex items-center justify-center space-x-2"
                        >
                          <span>📝</span>
                          <span>Descargar TXT</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* CHAT CON VOZ INTEGRADO */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
                  
                  {/* Historial de chats del proyecto */}
                  <div className="md:col-span-3 border-r border-slate-100 pr-4 space-y-3">
                    <button
                      onClick={() => {
                        setConversacionActiva(null);
                        setMensajes([]);
                        setPregunta("");
                      }}
                      className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-1"
                    >
                      <span>➕</span>
                      <span>Nuevo Chat</span>
                    </button>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {conversaciones.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                            conversacionActiva?.id === conv.id
                              ? "bg-[#f0f9ff] border-[#0284c7]"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <div onClick={() => cargarMensajesChat(conv)}>
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {conv.titulo || "Conversación"}
                            </p>
                            <p className="text-[8px] text-slate-400 font-semibold mt-1">
                              {new Date(conv.creado_en).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => borrarConversacion(conv.id)}
                            className="text-[9px] text-red-500 font-bold hover:underline mt-1.5 block"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ventana de mensajes del chat */}
                  <div className="md:col-span-9 flex flex-col justify-between min-h-[480px]">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[380px] min-h-[300px]">
                      {cargandoChat ? (
                        <div className="text-slate-400 text-center py-20 text-xs font-bold animate-pulse">
                          Cargando mensajes del chat...
                        </div>
                      ) : mensajes.length === 0 ? (
                        <div className="border border-dashed border-[#e0f2fe] bg-[#f0f9ff]/30 rounded-2xl p-8 text-center mt-6">
                          <div className="text-4xl mb-3">💬</div>
                          <h3 className="text-sm font-bold text-slate-700">Chat inteligente de estudio</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                            Consulta la información de tus clases o pídele resúmenes a la IA directamente.
                          </p>
                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {[
                              "Resume el tema más importante",
                              "¿Qué dudas o decisiones surgieron?",
                              "Hazme un resumen corto",
                            ].map((sugerencia) => (
                              <button
                                key={sugerencia}
                                onClick={() => setPregunta(sugerencia)}
                                className="bg-white border border-[#e0f2fe] hover:border-[#0284c7]/50 rounded-lg px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition-all"
                              >
                                {sugerencia}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        mensajes.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.rol === "USUARIO" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                                msg.rol === "USUARIO"
                                  ? "bg-[#0284c7] text-white shadow-sm"
                                  : "bg-slate-50 border border-slate-200/60 text-slate-700"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1 font-bold text-[9px]">
                                <span className={msg.rol === "USUARIO" ? "text-sky-100" : "text-[#0284c7]"}>
                                  {msg.rol === "USUARIO" ? "Tú" : "IA / Ollama"}
                                </span>
                                
                                {msg.rol === "IA" && (
                                  <button
                                    onClick={() => guardarComoResumen(msg.contenido)}
                                    className="ml-4 bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-[#0284c7] font-bold flex items-center space-x-0.5 transition-all shadow-sm active:scale-95"
                                  >
                                    <span>💾</span>
                                    <span>Guardar Resumen</span>
                                  </button>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Formulario con envío e input por micrófono */}
                    <form onSubmit={enviarPregunta} className="border-t border-slate-100 pt-4 mt-2">
                      <div className="flex items-center space-x-2">
                        {/* Botón de micrófono */}
                        <button
                          type="button"
                          onClick={startListening}
                          className={`p-3 rounded-xl border text-base flex items-center justify-center transition-all ${
                            isListening
                              ? "bg-red-500 border-red-500 text-white animate-pulse"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                          }`}
                          title="Presiona para hablar (dictado por voz)"
                        >
                          {isListening ? "🔴" : "🎙️"}
                        </button>

                        <input
                          type="text"
                          value={pregunta}
                          onChange={(e) => setPregunta(e.target.value)}
                          placeholder={isListening ? "Escuchando tu voz..." : "Escribe una pregunta sobre tus audios..."}
                          disabled={enviando}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] transition-all"
                        />

                        <button
                          type="submit"
                          disabled={enviando || !pregunta.trim()}
                          className="bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-xs"
                        >
                          {enviando ? "Pensando..." : "Enviar"}
                        </button>
                      </div>
                    </form>

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
