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
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-primario font-semibold uppercase tracking-wide">
            Gestión de proyectos
          </p>
          <h1 className="text-3xl font-bold mt-2">Mis proyectos</h1>
          <p className="text-slate-400 mt-2">
            Organiza tus audios por materias, reuniones, entrevistas o temas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {editandoId ? "Editar proyecto" : "Nuevo proyecto"}
              </h2>

              <form onSubmit={guardarProyecto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre del proyecto
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Ej: Inteligencia Artificial"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primario focus:ring-1 focus:ring-primario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente el contenido del proyecto"
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primario focus:ring-1 focus:ring-primario resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primario hover:bg-primario/90 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {editandoId ? "Actualizar proyecto" : "Crear proyecto"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancelar edición
                  </button>
                )}
              </form>

              {mensaje && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                  {mensaje}
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Lista de proyectos</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Total: {proyectos.length}
                  </p>
                </div>

                <button
                  onClick={cargarProyectos}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                >
                  Actualizar
                </button>
              </div>

              {cargando ? (
                <div className="text-slate-400 py-10 text-center">
                  Cargando proyectos...
                </div>
              ) : proyectos.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
                  <div className="text-5xl mb-4">📁</div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    No tienes proyectos creados
                  </h3>
                  <p className="text-slate-400 mt-2">
                    Crea tu primer proyecto para empezar a organizar tus audios.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proyectos.map((proyecto) => (
                    <div
                      key={proyecto.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-primario/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {proyecto.nombre}
                          </h3>
                          <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                            {proyecto.descripcion || "Sin descripción"}
                          </p>
                        </div>

                        <span className="text-2xl">📂</span>
                      </div>

                      <p className="text-xs text-slate-500 mt-4">
                        Creado:{" "}
                        {new Date(proyecto.creado_en).toLocaleString()}
                      </p>

                      <div className="flex gap-2 mt-5">
                        <button
  onClick={() => navigate(`/proyectos/${proyecto.id}/audios`)}
  className="flex-1 px-3 py-2 rounded-lg bg-primario hover:bg-primario/90 text-sm text-white transition-colors"
>
  Ver audios
</button>
                        <button
                          onClick={() => cargarParaEditar(proyecto)}
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => borrarProyecto(proyecto.id)}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-colors"
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