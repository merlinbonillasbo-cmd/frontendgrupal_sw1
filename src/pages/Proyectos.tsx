import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  crearProyecto,
  editarProyecto,
  eliminarProyecto,
  listarProyectos,
} from "../services/proyecto_service";

import type { Proyecto } from "../services/proyecto_service";

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function cargarProyectos() {
    try {
      setCargando(true);
      setError("");

      const data = await listarProyectos();
      setProyectos(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar proyectos");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProyectos();
  }, []);

  async function guardarProyecto(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");
      setMensaje("");

      if (editandoId) {
        await editarProyecto(editandoId, { nombre, descripcion });
        setMensaje("Proyecto actualizado correctamente");
      } else {
        await crearProyecto({ nombre, descripcion });
        setMensaje("Proyecto creado correctamente");
      }

      setNombre("");
      setDescripcion("");
      setEditandoId(null);
      await cargarProyectos();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al guardar proyecto");
    }
  }

  function cargarParaEditar(proyecto: Proyecto) {
    setEditandoId(proyecto.id);
    setNombre(proyecto.nombre);
    setDescripcion(proyecto.descripcion || "");
    setMensaje("");
    setError("");
  }

  async function borrarProyecto(id: number) {
    const confirmar = confirm("¿Seguro que deseas eliminar este proyecto?");
    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      await eliminarProyecto(id);
      setMensaje("Proyecto eliminado correctamente");
      await cargarProyectos();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al eliminar proyecto");
    }
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setMensaje("");
    setError("");
  }

  return (
    <section className="min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wide">
            Gestión de proyectos
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Mis proyectos</h1>
          <p className="text-slate-500 text-sm mt-2">
            Organiza tus audios por materias, reuniones, entrevistas o temas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-6 shadow-xl shadow-sky-100/50">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {editandoId ? "Editar proyecto" : "Nuevo proyecto"}
              </h2>

              <form onSubmit={guardarProyecto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Nombre del proyecto
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Ej: Inteligencia Artificial"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente el contenido"
                    rows={4}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-sky-600/10 text-sm"
                >
                  {editandoId ? "Actualizar proyecto" : "Crear proyecto"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    Cancelar edición
                  </button>
                )}
              </form>

              {mensaje && (
                <div className="mt-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-medium">
                  {mensaje}
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#e0f2fe] rounded-2xl p-6 shadow-xl shadow-sky-100/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Lista de proyectos</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Total: {proyectos.length}
                  </p>
                </div>

                <button
                  onClick={cargarProyectos}
                  className="px-4 py-2 rounded-xl bg-white border border-[#e0f2fe] hover:bg-[#e0f2fe]/30 text-xs font-bold text-slate-700 transition-all shadow-sm"
                >
                  Actualizar
                </button>
              </div>

              {cargando ? (
                <div className="text-slate-400 py-10 text-center text-sm animate-pulse">
                  Cargando proyectos...
                </div>
              ) : proyectos.length === 0 ? (
                <div className="border border-dashed border-[#e0f2fe] bg-[#f0f9ff]/50 rounded-2xl p-10 text-center">
                  <div className="text-5xl mb-4">📁</div>
                  <h3 className="text-lg font-bold text-slate-700">
                    No tienes proyectos creados
                  </h3>
                  <p className="text-slate-400 text-xs mt-2">
                    Crea tu primer proyecto para empezar a organizar tus audios.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proyectos.map((proyecto) => (
                    <div
                      key={proyecto.id}
                      className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-5 hover:border-[#0284c7]/50 transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                            {proyecto.nombre}
                          </h3>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                            {proyecto.descripcion || "Sin descripción"}
                          </p>
                        </div>

                        <span className="text-2xl select-none">📂</span>
                      </div>

                      <p className="text-[10px] font-semibold text-slate-400 mt-4">
                        Creado:{" "}
                        {new Date(proyecto.creado_en).toLocaleString()}
                      </p>

                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => navigate(`/proyectos/${proyecto.id}/audios`)}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-bold text-white transition-all shadow-md shadow-sky-600/10"
                        >
                          Ver audios
                        </button>
                        <button
                          onClick={() => cargarParaEditar(proyecto)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#e0f2fe] hover:bg-[#e0f2fe]/30 text-xs font-bold text-slate-700 transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => borrarProyecto(proyecto.id)}
                          className="flex-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100/50 text-xs font-bold text-red-600 border border-red-100 transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}