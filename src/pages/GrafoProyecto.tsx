import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import {
  eliminarGrafo,
  generarGrafoProyecto,
  listarGrafosProyecto,
  obtenerGrafoPorId,
  obtenerUltimoGrafoProyecto,
} from "../services/grafo_service";

import type {
  Grafo,
  NivelDetalleGrafo,
  NodoGrafo,
  TipoNodoGrafo,
} from "../services/grafo_service";

const tipoColor: Record<TipoNodoGrafo, string> = {
  TEMA: "#16a34a",      // green-600
  SUBTEMA: "#0284c7",   // sky-600
  CONCEPTO: "#4f46e5",  // indigo-600
  PERSONA: "#ca8a04",   // yellow-600
  TAREA: "#db2777",     // pink-600
  DECISION: "#dc2626",  // red-600
  RECURSO: "#0d9488",   // teal-600
};

const tipoClase: Record<TipoNodoGrafo, string> = {
  TEMA: "border-green-200 text-green-700 bg-green-50",
  SUBTEMA: "border-sky-200 text-sky-700 bg-sky-50",
  CONCEPTO: "border-indigo-200 text-indigo-700 bg-indigo-50",
  PERSONA: "border-yellow-200 text-yellow-700 bg-yellow-50",
  TAREA: "border-pink-200 text-pink-700 bg-pink-50",
  DECISION: "border-red-200 text-red-700 bg-red-50",
  RECURSO: "border-teal-200 text-teal-700 bg-teal-50",
};

function calcularPosicion(index: number, total: number, importancia: number) {
  const radioBase = 180;
  const radio = radioBase + (5 - importancia) * 45;
  const angulo = (2 * Math.PI * index) / Math.max(total, 1);

  return {
    x: Math.cos(angulo) * radio + 380,
    y: Math.sin(angulo) * radio + 280,
  };
}

function convertirAGrafoReactFlow(grafo: Grafo, filtroTipo: string) {
  const nodosFuente = grafo.contenido?.nodos || [];
  const relacionesFuente = grafo.contenido?.relaciones || [];

  const nodosFiltrados =
    filtroTipo === "TODOS"
      ? nodosFuente
      : nodosFuente.filter((nodo) => nodo.tipo === filtroTipo);

  const idsVisibles = new Set(nodosFiltrados.map((nodo) => nodo.id));

  const nodes: Node[] = nodosFiltrados.map((nodo, index) => {
    const posicion = calcularPosicion(index, nodosFiltrados.length, nodo.importancia);

    return {
      id: nodo.id,
      position: posicion,
      data: {
        label: `${nodo.label}`,
        nodo,
      },
      style: {
        border: `2px solid ${tipoColor[nodo.tipo] || "#94a3b8"}`,
        background: "#ffffff",
        color: "#0f172a",
        borderRadius: 18,
        padding: 12,
        minWidth: 150,
        boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.1), 0 8px 10px -6px rgba(2, 132, 199, 0.1)",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
      },
    };
  });

  const edges: Edge[] = relacionesFuente
    .filter((rel) => idsVisibles.has(rel.source) && idsVisibles.has(rel.target))
    .map((rel) => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      label: rel.label,
      animated: rel.peso >= 4,
      style: {
        strokeWidth: Math.max(1.5, rel.peso * 0.8),
        stroke: "#bae6fd",
      },
      labelStyle: {
        fill: "#0369a1",
        fontSize: 11,
        fontWeight: "600",
        background: "#ffffff",
      },
    }));

  return { nodes, edges };
}

export default function GrafoProyecto() {
  const { proyectoId } = useParams();
  const navigate = useNavigate();

  const idProyecto = Number(proyectoId);

  const [grafo, setGrafo] = useState<Grafo | null>(null);
  const [historial, setHistorial] = useState<Grafo[]>([]);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<NodoGrafo | null>(null);

  const [nivelDetalle, setNivelDetalle] = useState<NivelDetalleGrafo>("MEDIO");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  const [cargando, setCargando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarHistorial() {
    try {
      const data = await listarGrafosProyecto(idProyecto);
      setHistorial(data);
    } catch {
      setHistorial([]);
    }
  }

  async function cargarUltimoGrafo() {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerUltimoGrafoProyecto(idProyecto);

      if (data) {
        setGrafo(data);
      } else {
        setGrafo(null);
      }
    } catch (err: any) {
      setGrafo(null);
      setError(err.response?.data?.detail || "Error al cargar el grafo");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!idProyecto) {
      navigate("/proyectos");
      return;
    }

    cargarUltimoGrafo();
    cargarHistorial();
  }, [idProyecto]);

  async function generarGrafo() {
    try {
      setGenerando(true);
      setError("");
      setMensaje("");
      setNodoSeleccionado(null);

      const data = await generarGrafoProyecto(idProyecto, nivelDetalle);

      setGrafo(data);
      setMensaje("Grafo generado correctamente");

      await cargarHistorial();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al generar grafo");
    } finally {
      setGenerando(false);
    }
  }

  async function abrirGrafo(grafoId: number) {
    try {
      setError("");
      setMensaje("");
      setNodoSeleccionado(null);

      const data = await obtenerGrafoPorId(grafoId);
      setGrafo(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al abrir grafo");
    }
  }

  async function borrarGrafo(grafoId: number) {
    const confirmar = confirm("¿Seguro que deseas eliminar este grafo?");
    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      await eliminarGrafo(grafoId);

      if (grafo?.id === grafoId) {
        setGrafo(null);
        setNodoSeleccionado(null);
      }

      setMensaje("Grafo eliminado correctamente");
      await cargarHistorial();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al eliminar grafo");
    }
  }

  const { nodes, edges } = useMemo(() => {
    if (!grafo) {
      return { nodes: [], edges: [] };
    }

    return convertirAGrafoReactFlow(grafo, filtroTipo);
  }, [grafo, filtroTipo]);

  const tiposDisponibles = useMemo(() => {
    if (!grafo) return [];

    const tipos = new Set(grafo.contenido.nodos.map((nodo) => nodo.tipo));
    return Array.from(tipos);
  }, [grafo]);

  return (
    <section className="min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/proyectos/${idProyecto}/audios`)}
            className="mb-4 text-sm font-semibold text-slate-500 hover:text-[#0284c7] transition-all"
          >
            ← Volver a audios
          </button>

          <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wide">
            Grafo de conocimiento
          </p>

          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Mapa interactivo de conceptos
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Visualiza temas, conceptos, tareas, decisiones y relaciones detectadas en los audios del proyecto.
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

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Panel Lateral Izquierdo */}
          <aside className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Generación
              </h2>

              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Nivel de detalle
              </label>

              <select
                value={nivelDetalle}
                onChange={(e) => setNivelDetalle(e.target.value as NivelDetalleGrafo)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all"
              >
                <option value="BASICO">Básico</option>
                <option value="MEDIO">Medio</option>
                <option value="AVANZADO">Avanzado</option>
              </select>

              <button
                onClick={generarGrafo}
                disabled={generando}
                className="w-full mt-4 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-sky-600/10 text-sm"
              >
                {generando ? "Generando grafo..." : "Generar grafo"}
              </button>
            </div>

            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Filtros
              </h2>

              <select
                value={filtroTipo}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  setNodoSeleccionado(null);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all"
              >
                <option value="TODOS">Todos los nodos</option>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>

              {grafo && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-3">
                    <p className="text-slate-400 font-semibold">Nodos</p>
                    <p className="text-xl font-bold text-slate-800">{grafo.contenido.nodos.length}</p>
                  </div>

                  <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-3">
                    <p className="text-slate-400 font-semibold">Relaciones</p>
                    <p className="text-xl font-bold text-slate-800">{grafo.contenido.relaciones.length}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Historial
              </h2>

              {historial.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium">
                  Todavía no hay grafos guardados.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {historial.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-3 bg-[#f0f9ff] transition-all hover:scale-[1.01] ${
                        grafo?.id === item.id
                          ? "border-[#0284c7] ring-2 ring-[#0284c7]/20"
                          : "border-[#e0f2fe]"
                      }`}
                    >
                      <button
                        onClick={() => abrirGrafo(item.id)}
                        className="w-full text-left outline-none"
                      >
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">
                          {item.titulo || "Grafo generado"}
                        </p>

                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          {new Date(item.creado_en).toLocaleString()}
                        </p>
                      </button>

                      <button
                        onClick={() => borrarGrafo(item.id)}
                        className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Canvas de ReactFlow */}
          <main className="xl:col-span-3">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl shadow-xl shadow-sky-100/50 overflow-hidden">
              <div className="border-b border-[#e0f2fe] p-5">
                <h2 className="text-xl font-bold text-slate-800">
                  {grafo?.titulo || "Grafo del proyecto"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {grafo?.descripcion || "Genera un grafo para visualizar las relaciones de conocimiento."}
                </p>
              </div>

              <div className="h-[680px] bg-[#f8fafc] relative">
                {cargando ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">
                    Cargando grafo...
                  </div>
                ) : !grafo ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="border border-dashed border-[#e0f2fe] bg-[#f0f9ff]/50 rounded-2xl p-10 text-center max-w-md">
                      <div className="text-6xl mb-4 select-none">🕸️</div>

                      <h3 className="text-lg font-bold text-slate-700">
                        Todavía no hay grafo
                      </h3>

                      <p className="text-slate-400 text-xs mt-2">
                        Genera un grafo a partir de las transcripciones del proyecto.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    onNodeClick={(_, node) => {
                      const data = node.data as { nodo: NodoGrafo };
                      setNodoSeleccionado(data.nodo);
                    }}
                  >
                    <Background color="#0284c7" opacity={0.08} />
                    <Controls />
                    <MiniMap
                      nodeColor={(node) => {
                        const data = node.data as { nodo?: NodoGrafo };
                        return data.nodo ? tipoColor[data.nodo.tipo] : "#94a3b8";
                      }}
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e0f2fe",
                        borderRadius: "12px",
                      }}
                    />
                  </ReactFlow>
                )}
              </div>
            </div>
          </main>

          {/* Panel Lateral Derecho */}
          <aside className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50 min-h-[240px]">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Detalle del nodo
              </h2>

              {!nodoSeleccionado ? (
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Selecciona un nodo del grafo para ver su explicación, importancia y audio de origen.
                </p>
              ) : (
                <div>
                  <span
                    className={`inline-block border rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tipoClase[nodoSeleccionado.tipo]}`}
                  >
                    {nodoSeleccionado.tipo}
                  </span>

                  <h3 className="text-xl font-extrabold text-slate-800 mt-4 leading-tight">
                    {nodoSeleccionado.label}
                  </h3>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    {nodoSeleccionado.descripcion || "Sin descripción"}
                  </p>

                  <div className="mt-4 bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">
                      Importancia
                    </p>

                    <p className="text-lg font-bold text-slate-800">
                      {nodoSeleccionado.importancia}/5
                    </p>
                  </div>

                  {nodoSeleccionado.audio_origen && (
                    <div className="mt-3 bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">
                        Audio origen
                      </p>

                      <p className="text-xs text-slate-700 font-medium truncate mt-1">
                        {nodoSeleccionado.audio_origen}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {grafo && (
              <>
                <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Insights
                  </h2>

                  {grafo.contenido.insights && grafo.contenido.insights.length > 0 ? (
                    <ul className="space-y-3 text-xs">
                      {grafo.contenido.insights.map((item, index) => (
                        <li
                          key={index}
                          className="bg-[#f0f9ff] border border-[#e0f2fe] text-slate-700 rounded-xl p-3 leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold">
                      Sin insights detectados.
                    </p>
                  )}
                </div>

                <div className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-xl shadow-sky-100/50">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Recomendaciones
                  </h2>

                  {grafo.contenido.recomendaciones &&
                  grafo.contenido.recomendaciones.length > 0 ? (
                    <ul className="space-y-3 text-xs">
                      {grafo.contenido.recomendaciones.map((item, index) => (
                        <li
                          key={index}
                          className="bg-[#f0f9ff] border border-[#e0f2fe] text-slate-700 rounded-xl p-3 leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold">
                      Sin recomendaciones detectadas.
                    </p>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}