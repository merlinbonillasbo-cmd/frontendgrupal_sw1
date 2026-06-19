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
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/proyectos/${idProyecto}/audios`)}
            className="mb-4 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Volver a audios
          </button>

          <p className="text-sm text-primario font-semibold uppercase tracking-wide">
            Chat inteligente
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Pregunta sobre tus audios
          </h1>

          <p className="text-slate-400 mt-2">
            Consulta el contenido transcrito del proyecto usando lenguaje natural.
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <button
                onClick={nuevaConversacion}
                className="w-full bg-primario hover:bg-primario/90 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Nueva conversación
              </button>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">
                  Historial
                </h2>

                {conversaciones.length === 0 ? (
                  <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm text-slate-400">
                      No hay conversaciones todavía.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[540px] overflow-y-auto">
                    {conversaciones.map((conv) => (
                      <div
                        key={conv.id}
                        className={`border rounded-xl p-3 ${
                          conversacionActiva?.id === conv.id
                            ? "border-primario bg-slate-950"
                            : "border-slate-800 bg-slate-950 hover:border-primario/60"
                        }`}
                      >
                        <button
                          onClick={() => cargarMensajes(conv)}
                          className="w-full text-left"
                        >
                          <p className="text-sm font-medium text-white line-clamp-2">
                            {conv.titulo || "Conversación"}
                          </p>

                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(conv.creado_en).toLocaleString()}
                          </p>
                        </button>

                        <button
                          onClick={() => borrarConversacion(conv.id)}
                          className="mt-2 text-xs text-red-400 hover:text-red-300"
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

          <main className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col min-h-[680px]">
              <div className="border-b border-slate-800 p-5">
                <h2 className="text-xl font-semibold">
                  {conversacionActiva?.titulo || "Nueva consulta"}
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  El sistema responderá usando las transcripciones del proyecto.
                </p>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {cargando ? (
                  <div className="text-slate-400 text-center py-10">
                    Cargando conversación...
                  </div>
                ) : mensajes.length === 0 ? (
                  <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
                    <div className="text-5xl mb-4">🧠</div>

                    <h3 className="text-lg font-semibold text-slate-200">
                      Haz una pregunta sobre el proyecto
                    </h3>

                    <p className="text-slate-400 mt-2">
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
                          className="bg-slate-950 border border-slate-800 hover:border-primario/60 rounded-xl p-4 text-sm text-slate-300 transition-colors"
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
                            ? "bg-primario text-white"
                            : "bg-slate-950 border border-slate-800 text-slate-300"
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-2">
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
                className="border-t border-slate-800 p-5"
              >
                <div className="flex flex-col md:flex-row gap-3">
                  <textarea
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    placeholder="Escribe una pregunta sobre tus audios..."
                    rows={2}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primario focus:ring-1 focus:ring-primario resize-none"
                  />

                  <button
                    type="submit"
                    disabled={enviando}
                    className="bg-primario hover:bg-primario/90 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
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