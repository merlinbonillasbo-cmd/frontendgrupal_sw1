import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  eliminarConversacion,
  listarConversacionesProyecto,
  listarMensajesConversacion,
  preguntarProyecto,
} from "../services/chat_service";

import type {
  ChatConversacion,
  ChatMensaje,
} from "../services/chat_service";

export default function ChatProyecto() {
  const { proyectoId } = useParams();
  const navigate = useNavigate();

  const idProyecto = Number(proyectoId);

  const [conversaciones, setConversaciones] = useState<ChatConversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] =
    useState<ChatConversacion | null>(null);

  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [pregunta, setPregunta] = useState("");

  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarConversaciones() {
    try {
      setError("");

      const data = await listarConversacionesProyecto(idProyecto);
      setConversaciones(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar conversaciones");
    }
  }

  async function cargarMensajes(conversacion: ChatConversacion) {
    try {
      setCargando(true);
      setError("");
      setConversacionActiva(conversacion);

      const data = await listarMensajesConversacion(conversacion.id);
      setMensajes(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar mensajes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!idProyecto) {
      navigate("/proyectos");
      return;
    }

    cargarConversaciones();
  }, [idProyecto]);

  async function enviarPregunta(e: React.FormEvent) {
    e.preventDefault();

    if (!pregunta.trim()) {
      setError("Escribe una pregunta para continuar");
      return;
    }

    try {
      setEnviando(true);
      setError("");
      setMensaje("");

      const data = await preguntarProyecto(
        idProyecto,
        pregunta,
        conversacionActiva?.id || null
      );

      setConversacionActiva(data.conversacion);

      setMensajes((prev) => [
        ...prev,
        data.pregunta,
        data.respuesta,
      ]);

      setPregunta("");
      await cargarConversaciones();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al enviar pregunta");
    } finally {
      setEnviando(false);
    }
  }

  function nuevaConversacion() {
    setConversacionActiva(null);
    setMensajes([]);
    setPregunta("");
    setError("");
    setMensaje("Nueva conversación iniciada");
  }

  async function borrarConversacion(conversacionId: number) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta conversación?");
    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      await eliminarConversacion(conversacionId);

      if (conversacionActiva?.id === conversacionId) {
        setConversacionActiva(null);
        setMensajes([]);
      }

      setMensaje("Conversación eliminada correctamente");
      await cargarConversaciones();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al eliminar conversación");
    }
  }

  return (
    <section className="min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/proyectos/${idProyecto}/audios`)}
            className="mb-4 text-sm font-semibold text-slate-500 hover:text-[#0284c7] transition-colors"
          >
            ← Volver a audios
          </button>

          <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wide">
            Chat inteligente
          </p>

          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Pregunta sobre tus audios
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Consulta el contenido transcrito del proyecto usando lenguaje natural.
          </p>
        </div>

        {mensaje && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-medium">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Barra Lateral Chat */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50">
              <button
                onClick={nuevaConversacion}
                className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-sky-600/10 text-sm"
              >
                Nueva conversación
              </button>

              <div className="mt-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">
                  Historial
                </h2>

                {conversaciones.length === 0 ? (
                  <div className="border border-dashed border-[#e0f2fe] bg-[#f0f9ff]/50 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-xs text-slate-500">
                      No hay conversaciones todavía.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[540px] overflow-y-auto">
                    {conversaciones.map((conv) => (
                      <div
                        key={conv.id}
                        className={`border rounded-xl p-3 bg-[#f0f9ff] transition-all hover:scale-[1.01] ${
                          conversacionActiva?.id === conv.id
                            ? "border-[#0284c7] ring-2 ring-[#0284c7]/20"
                            : "border-[#e0f2fe] hover:border-[#0284c7]/50"
                        }`}
                      >
                        <button
                          onClick={() => cargarMensajes(conv)}
                          className="w-full text-left outline-none"
                        >
                          <p className="text-sm font-bold text-slate-800 line-clamp-2">
                            {conv.titulo || "Conversación"}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-2 font-semibold">
                            {new Date(conv.creado_en).toLocaleString()}
                          </p>
                        </button>

                        <button
                          onClick={() => borrarConversacion(conv.id)}
                          className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Ventana de Chat */}
          <main className="lg:col-span-3">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl shadow-xl shadow-sky-100/50 flex flex-col min-h-[680px]">
              <div className="border-b border-[#e0f2fe] p-5">
                <h2 className="text-xl font-bold text-slate-800">
                  {conversacionActiva?.titulo || "Nueva consulta"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  El sistema responderá usando las transcripciones del proyecto.
                </p>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {cargando ? (
                  <div className="text-slate-400 text-center py-10 text-sm animate-pulse">
                    Cargando conversación...
                  </div>
                ) : mensajes.length === 0 ? (
                  <div className="border border-dashed border-[#e0f2fe] bg-[#f0f9ff]/50 rounded-2xl p-10 text-center">
                    <div className="text-5xl mb-4">🧠</div>

                    <h3 className="text-lg font-bold text-slate-700">
                      Haz una pregunta sobre el proyecto
                    </h3>

                    <p className="text-slate-500 text-xs mt-2">
                      Ejemplo: ¿Cuáles fueron los temas principales?
                    </p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      {[
                        "Resume las ideas principales del proyecto",
                        "¿Qué tareas o compromisos se mencionaron?",
                        "¿Qué decisiones importantes se tomaron?",
                        "Explícame el tema más importante de forma sencilla",
                      ].map((texto) => (
                        <button
                          key={texto}
                          onClick={() => setPregunta(texto)}
                          className="bg-white border border-[#e0f2fe] hover:border-[#0284c7]/50 rounded-xl p-4 text-xs font-semibold text-slate-700 transition-all hover:scale-[1.01]"
                        >
                          {texto}
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
                        className={`max-w-[82%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.rol === "USUARIO"
                            ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/10"
                            : "bg-[#f0f9ff] border border-[#e0f2fe] text-slate-700"
                        }`}
                      >
                        <p className={`text-[10px] font-bold mb-2 ${msg.rol === "USUARIO" ? "opacity-75" : "text-[#0284c7]"}`}>
                          {msg.rol === "USUARIO" ? "Tú" : "IA"}
                        </p>

                        {msg.contenido}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={enviarPregunta}
                className="border-t border-[#e0f2fe] p-5"
              >
                <div className="flex flex-col md:flex-row gap-3">
                  <textarea
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    placeholder="Escribe una pregunta sobre tus audios..."
                    rows={2}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all text-sm resize-none"
                  />

                  <button
                    type="submit"
                    disabled={enviando}
                    className="bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-sky-600/10 text-sm"
                  >
                    {enviando ? "Pensando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}