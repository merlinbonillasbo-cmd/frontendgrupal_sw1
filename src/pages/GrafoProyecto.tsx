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
  TEMA: "#22c55e",
  SUBTEMA: "#38bdf8",
  CONCEPTO: "#6366f1",
  PERSONA: "#f59e0b",
  TAREA: "#ec4899",
  DECISION: "#ef4444",
  RECURSO: "#14b8a6",
};

const tipoClase: Record<TipoNodoGrafo, string> = {
  TEMA: "border-green-400 text-green-300 bg-green-500/10",
  SUBTEMA: "border-sky-400 text-sky-300 bg-sky-500/10",
  CONCEPTO: "border-indigo-400 text-indigo-300 bg-indigo-500/10",
  PERSONA: "border-yellow-400 text-yellow-300 bg-yellow-500/10",
  TAREA: "border-pink-400 text-pink-300 bg-pink-500/10",
  DECISION: "border-red-400 text-red-300 bg-red-500/10",
  RECURSO: "border-teal-400 text-teal-300 bg-teal-500/10",
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
        border: `2px solid ${tipoColor[nodo.tipo] || "#64748b"}`,
        background: "#020617",
        color: "#f8fafc",
        borderRadius: 18,
        padding: 12,
        minWidth: 150,
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        fontSize: 13,
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
        strokeWidth: Math.max(1, rel.peso),
      },
      labelStyle: {
        fill: "#cbd5e1",
        fontSize: 11,
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
            Grafo de conocimiento
          </p>

          <h1 className="text-3xl font-bold mt-2">
            Mapa interactivo de conceptos
          </h1>

          <p className="text-slate-400 mt-2">
            Visualiza temas, conceptos, tareas, decisiones y relaciones detectadas en los audios del proyecto.
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

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <aside className="xl:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">
                Generación
              </h2>

              <label className="block text-sm text-slate-300 mb-2">
                Nivel de detalle
              </label>

              <select
                value={nivelDetalle}
                onChange={(e) => setNivelDetalle(e.target.value as NivelDetalleGrafo)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primario"
              >
                <option value="BASICO">Básico</option>
                <option value="MEDIO">Medio</option>
                <option value="AVANZADO">Avanzado</option>
              </select>

              <button
                onClick={generarGrafo}
                disabled={generando}
                className="w-full mt-4 bg-primario hover:bg-primario/90 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {generando ? "Generando grafo..." : "Generar grafo"}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">
                Filtros
              </h2>

              <select
                value={filtroTipo}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  setNodoSeleccionado(null);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primario"
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
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <p className="text-slate-500">Nodos</p>
                    <p className="text-xl font-bold">{grafo.contenido.nodos.length}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <p className="text-slate-500">Relaciones</p>
                    <p className="text-xl font-bold">{grafo.contenido.relaciones.length}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">
                Historial
              </h2>

              {historial.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Todavía no hay grafos guardados.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {historial.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-3 ${
                        grafo?.id === item.id
                          ? "border-primario bg-slate-950"
                          : "border-slate-800 bg-slate-950"
                      }`}
                    >
                      <button
                        onClick={() => abrirGrafo(item.id)}
                        className="w-full text-left"
                      >
                        <p className="text-sm font-medium line-clamp-1">
                          {item.titulo || "Grafo generado"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(item.creado_en).toLocaleString()}
                        </p>
                      </button>

                      <button
                        onClick={() => borrarGrafo(item.id)}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <main className="xl:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-slate-800 p-5">
                <h2 className="text-xl font-semibold">
                  {grafo?.titulo || "Grafo del proyecto"}
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  {grafo?.descripcion || "Genera un grafo para visualizar las relaciones de conocimiento."}
                </p>
              </div>

              <div className="h-[680px] bg-slate-950">
                {cargando ? (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Cargando grafo...
                  </div>
                ) : !grafo ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center max-w-md">
                      <div className="text-6xl mb-4">🕸️</div>

                      <h3 className="text-lg font-semibold">
                        Todavía no hay grafo
                      </h3>

                      <p className="text-slate-400 mt-2">
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
                    <Background />
                    <Controls />
                    <MiniMap
                      nodeColor={(node) => {
                        const data = node.data as { nodo?: NodoGrafo };
                        return data.nodo ? tipoColor[data.nodo.tipo] : "#64748b";
                      }}
                    />
                  </ReactFlow>
                )}
              </div>
            </div>
          </main>

          <aside className="xl:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg min-h-[240px]">
              <h2 className="text-lg font-semibold mb-4">
                Detalle del nodo
              </h2>

              {!nodoSeleccionado ? (
                <p className="text-sm text-slate-400">
                  Selecciona un nodo del grafo para ver su explicación, importancia y audio de origen.
                </p>
              ) : (
                <div>
                  <span
                    className={`inline-block border rounded-full px-3 py-1 text-xs font-semibold ${tipoClase[nodoSeleccionado.tipo]}`}
                  >
                    {nodoSeleccionado.tipo}
                  </span>

                  <h3 className="text-xl font-bold mt-4">
                    {nodoSeleccionado.label}
                  </h3>

                  <p className="text-sm text-slate-400 mt-3">
                    {nodoSeleccionado.descripcion || "Sin descripción"}
                  </p>

                  <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500">
                      Importancia
                    </p>

                    <p className="text-lg font-bold">
                      {nodoSeleccionado.importancia}/5
                    </p>
                  </div>

                  {nodoSeleccionado.audio_origen && (
                    <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-500">
                        Audio origen
                      </p>

                      <p className="text-sm">
                        {nodoSeleccionado.audio_origen}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {grafo && (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">
                    Insights
                  </h2>

                  {grafo.contenido.insights && grafo.contenido.insights.length > 0 ? (
                    <ul className="space-y-3 text-sm text-slate-300">
                      {grafo.contenido.insights.map((item, index) => (
                        <li
                          key={index}
                          className="bg-slate-950 border border-slate-800 rounded-lg p-3"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Sin insights detectados.
                    </p>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">
                    Recomendaciones
                  </h2>

                  {grafo.contenido.recomendaciones &&
                  grafo.contenido.recomendaciones.length > 0 ? (
                    <ul className="space-y-3 text-sm text-slate-300">
                      {grafo.contenido.recomendaciones.map((item, index) => (
                        <li
                          key={index}
                          className="bg-slate-950 border border-slate-800 rounded-lg p-3"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">
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