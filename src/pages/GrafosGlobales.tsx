import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import { obtenerGrafoAudiosComparar } from "../services/grafo_service";
import type { NodoAudioGrafo, RelacionAudioGrafo } from "../services/grafo_service";
import { useNavigate } from "react-router-dom";
import { listarProyectos, type Proyecto } from "../services/proyecto_service";

// Colores del tema celeste claro y blanco
const AUDIO_NODE_STYLE = {
  border: "2px solid #0284c7", // Celeste principal (sky-600)
  background: "#ffffff",
  color: "#0f172a",
  borderRadius: "9999px", // Completamente circular ("bola")
  width: 130,
  height: 130,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15), 0 8px 10px -6px rgba(2, 132, 199, 0.15)",
  fontSize: 12,
  fontWeight: "bold",
  textAlign: "center" as const,
  padding: 8,
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

export default function GrafosGlobales() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<{ nodes: NodoAudioGrafo[]; edges: RelacionAudioGrafo[] }>({
    nodes: [],
    edges: [],
  });
  const [umbral, setUmbral] = useState(0.70); // Umbral de similitud por defecto: 70%
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [selectedProyectoId, setSelectedProyectoId] = useState<number | "">("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        setError("");
        const res = await obtenerGrafoAudiosComparar();
        setData(res);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Error al cargar el grafo de audios");
      } finally {
        setLoading(false);
      }
    }

    async function cargarProyectos() {
      try {
        const dataProyectos = await listarProyectos();
        setProyectos(dataProyectos);
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
      }
    }

    cargarDatos();
    cargarProyectos();
  }, []);

  // Calcular posiciones en círculo para las "bolas de audio"
  const reactFlowNodes = useMemo(() => {
    return data.nodes.map((node, index) => {
      const total = data.nodes.length;
      const radio = 220; // Radio del círculo
      const angulo = (2 * Math.PI * index) / Math.max(total, 1);
      
      const x = Math.cos(angulo) * radio + 350;
      const y = Math.sin(angulo) * radio + 250;

      return {
        id: node.id,
        position: { x, y },
        data: {
          label: (
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-xl">🎙️</span>
              <span className="line-clamp-2 px-1 text-slate-800 leading-tight">{node.label}</span>
              <span className="text-[9px] text-[#0284c7] font-semibold bg-[#e0f2fe] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                {node.proyecto}
              </span>
            </div>
          ),
        },
        style: AUDIO_NODE_STYLE,
      } as Node;
    });
  }, [data.nodes]);

  // Filtrar los bordes (relaciones) según el umbral de similitud
  const reactFlowEdges = useMemo(() => {
    return data.edges
      .filter((edge) => edge.similarity >= umbral)
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: `${Math.round(edge.similarity * 100)}%`,
        type: "straight",
        animated: true,
        style: {
          stroke: "#38bdf8", // Celeste secundario (sky-400)
          strokeWidth: 2 + (edge.similarity - umbral) * 6, // Más grueso si es más similar
        },
        labelStyle: {
          fill: "#0369a1",
          fontWeight: 700,
          fontSize: 10,
          background: "#ffffff",
        },
      })) as Edge[];
  }, [data.edges, umbral]);

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-[#f0f9ff]/40 p-4 font-sans gap-4">
      {/* Panel de Control Lateral */}
      <div className="w-80 bg-white rounded-3xl border border-[#e0f2fe] shadow-xl shadow-sky-600/5 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
              Relaciones Semánticas
            </span>
            <h1 className="text-2xl font-black text-slate-800 mt-2 leading-tight">
              Grafo de Audios
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Visualiza cómo se relacionan tus grabaciones de audio a través de su similitud semántica.
            </p>
          </div>

          {/* Slider de Filtro */}
          <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Umbral de Similitud</span>
              <span className="text-[#0284c7] bg-white px-2 py-0.5 rounded-lg border border-[#e0f2fe] font-mono">
                {Math.round(umbral * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={umbral}
              onChange={(e) => setUmbral(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#e0f2fe] rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
            />
            <p className="text-[10px] text-slate-400 leading-snug">
              Aumenta el porcentaje para mostrar solo relaciones muy fuertes. Reduce para ver más conexiones tentativas.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estadísticas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#e0f2fe] rounded-xl p-3 text-center">
                <span className="block text-xl font-bold text-slate-800">
                  {data.nodes.length}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Audios
                </span>
              </div>
              <div className="bg-white border border-[#e0f2fe] rounded-xl p-3 text-center">
                <span className="block text-xl font-bold text-[#0284c7]">
                  {reactFlowEdges.length}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Conexiones
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="border-t border-[#e0f2fe] pt-4 space-y-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Leyenda
          </h4>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="w-3.5 h-3.5 bg-white border-2 border-[#0284c7] rounded-full inline-block"></span>
            <span>Bola = Audio Subido</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="w-6 h-0.5 bg-[#38bdf8] inline-block"></span>
            <span>Línea = Similitud de Contenido</span>
          </div>
        </div>
      </div>

      {/* Canvas del Grafo */}
      <div className="flex-1 bg-white rounded-3xl border border-[#e0f2fe] shadow-xl shadow-sky-600/5 overflow-hidden relative">
        
        {/* Selector de Grafo de Conceptos por Proyecto */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-[#e0f2fe] shadow-lg flex items-center space-x-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Conceptos:
          </label>
          <select
            value={selectedProyectoId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedProyectoId(val === "" ? "" : Number(val));
            }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:border-[#0284c7]"
          >
            <option value="">-- Seleccionar Proyecto --</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <button
            disabled={!selectedProyectoId}
            onClick={() => navigate(`/proyectos/${selectedProyectoId}/grafo`)}
            className="bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1"
          >
            <span>🔍</span>
            <span>Ver Grafo de Conceptos</span>
          </button>
        </div>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
            <div className="w-12 h-12 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-600 mt-4">Calculando relaciones...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <span className="text-4xl mb-3">⚠️</span>
            <p className="text-sm font-bold text-red-600">{error}</p>
            <p className="text-xs text-slate-400 mt-1">Asegúrate de tener audios transcritos para compararlos.</p>
          </div>
        ) : data.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <span className="text-5xl mb-4">🎙️</span>
            <h3 className="text-lg font-black text-slate-800">Todavía no hay grafos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Sube y transcribe audios en tus proyectos para empezar a ver sus relaciones.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#cbd5e1" gap={16} size={1} />
            <Controls showInteractive={false} className="shadow-lg border border-[#e0f2fe] rounded-xl overflow-hidden" />
            <MiniMap 
              nodeColor={() => "#0284c7"} 
              maskColor="rgba(240, 249, 255, 0.4)" 
              className="border border-[#e0f2fe] rounded-xl overflow-hidden shadow-lg"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
