import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerProyectos } from "../services/proyecto";
import type { Proyecto } from "../services/proyecto";

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const todos = await obtenerProyectos();
        const p = todos.find((item) => item.id === Number(id));
        if (p) {
          setProyecto(p);
        } else {
          // Si no existe el proyecto, redirigir al perfil
          navigate("/perfil");
        }
      } catch (err) {
        console.error("Error al cargar detalle del proyecto:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id, navigate]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-600 font-medium font-sans">
        <span className="inline-block animate-spin mr-2">⏳</span> Cargando carpeta...
      </div>
    );
  }

  if (!proyecto) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-800">
      {/* Cabecera del Proyecto/Carpeta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-sky-100">
        <div>
          <span className="text-xs font-bold text-primario uppercase tracking-wider">Carpeta de Estudio</span>
          <h1 className="text-3xl font-black text-slate-800 mt-1 flex items-center">
            <span className="mr-3 text-4xl">📁</span> {proyecto.nombre}
          </h1>
          {proyecto.descripcion && (
            <p className="text-slate-500 mt-2 text-sm">{proyecto.descripcion}</p>
          )}
        </div>
        
        <button
          onClick={() => navigate("/perfil")}
          className="mt-4 md:mt-0 text-slate-500 hover:text-slate-800 font-semibold text-sm flex items-center space-x-1"
        >
          <span>← Volver al Perfil</span>
        </button>
      </div>

      {/* Tarjeta de Subida de Audio (Placeholder para la siguiente HU) */}
      <div className="bg-white/80 border border-sky-100 p-8 rounded-2xl shadow-xl shadow-sky-900/5 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center text-primario shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Aún no hay audios en esta carpeta</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            Sube archivos de audio (MP3, WAV, M4A) de tus clases o notas de voz para generar cuestionarios, resúmenes en PDF y mapas de conocimiento.
          </p>
        </div>
        
        {/* Simulación de zona de soltar archivos */}
        <div className="w-full max-w-lg border-2 border-dashed border-sky-200 hover:border-primario bg-slate-50 hover:bg-sky-50/50 p-8 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group">
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</span>
          <p className="text-sm font-semibold text-slate-700">Arrastra tus audios aquí o haz clic para buscar</p>
          <p className="text-xs text-slate-400 mt-1">Soporta formatos MP3, WAV, M4A hasta 25MB</p>
        </div>
      </div>
    </div>
  );
}
