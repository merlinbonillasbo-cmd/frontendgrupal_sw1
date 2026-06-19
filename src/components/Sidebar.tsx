import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { obtenerProyectos, crearProyecto, eliminarProyecto } from "../services/proyecto";
import type { Proyecto } from "../services/proyecto";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Cargar proyectos al montar el sidebar
  const cargarProyectos = async () => {
    try {
      const datos = await obtenerProyectos();
      setProyectos(datos);
    } catch (err) {
      console.error("Error al cargar proyectos en el sidebar", err);
    }
  };

  useEffect(() => {
    // Solo cargamos si hay un token guardado (sesión activa)
    if (localStorage.getItem("token")) {
      cargarProyectos();
    }
  }, [location.pathname]); // Recargar si cambia la ruta o se navega

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCrearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      setErrorMsg("El nombre de la carpeta es requerido.");
      return;
    }
    setCargando(true);
    setErrorMsg("");
    try {
      const nuevo = await crearProyecto(nuevoNombre, nuevaDescripcion);
      setProyectos([...proyectos, nuevo]);
      setNuevoNombre("");
      setNuevaDescripcion("");
      setMostrarModal(false);
      navigate(`/proyecto/${nuevo.id}`); // Redirigir al nuevo proyecto de inmediato
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al crear la carpeta");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarProyecto = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita redirigir al proyecto al hacer clic en borrar
    if (!confirm("¿Estás seguro de que deseas eliminar esta carpeta y todo su contenido?")) {
      return;
    }
    try {
      await eliminarProyecto(id);
      setProyectos(proyectos.filter((p) => p.id !== id));
      if (location.pathname === `/proyecto/${id}`) {
        navigate("/perfil"); // Redirigir si estábamos viendo el proyecto eliminado
      }
    } catch (err) {
      console.error("Error al eliminar proyecto:", err);
      alert("No se pudo eliminar la carpeta");
    }
  };

  const linkActivo = (path: string) =>
    location.pathname === path
      ? "bg-primario text-white shadow-lg shadow-sky-600/25"
      : "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <>
      <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between font-sans fixed left-0 top-0 z-40">
        {/* Sección Superior: Logo y Rutas Básicas */}
        <div className="p-5 flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center space-x-2.5 mb-6 cursor-pointer" onClick={() => navigate("/perfil")}>
            <div className="w-9 h-9 bg-primario text-white flex items-center justify-center rounded-xl font-black text-lg shadow-lg shadow-sky-600/25">
              A
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              AudioNotes <span className="text-secundario">AI</span>
            </span>
          </div>

          <nav className="space-y-1.5 mb-6">
            <Link
              to="/perfil"
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${linkActivo(
                "/perfil"
              )}`}
            >
              <span className="mr-3 text-base">👤</span> Mi Perfil
            </Link>
            <Link
              to="/perfil/editar"
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${linkActivo(
                "/perfil/editar"
              )}`}
            >
              <span className="mr-3 text-base">⚙️</span> Editar Perfil
            </Link>
          </nav>

          {/* Sección de Carpetas / Proyectos */}
          <div className="flex-1 flex flex-col overflow-hidden border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mis Carpetas</span>
              <button
                onClick={() => setMostrarModal(true)}
                className="w-6 h-6 bg-slate-800 hover:bg-primario text-slate-300 hover:text-white flex items-center justify-center rounded-md font-bold text-sm transition-all active:scale-90"
                title="Nueva Carpeta"
              >
                +
              </button>
            </div>

            {/* Lista Scrollable de Carpetas */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {proyectos.length === 0 ? (
                <p className="text-xs text-slate-500 px-2 py-4 italic">No tienes carpetas creadas.</p>
              ) : (
                proyectos.map((p) => {
                  const rutaProyecto = `/proyecto/${p.id}`;
                  const activo = location.pathname === rutaProyecto;
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(rutaProyecto)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
                        activo
                          ? "bg-primario text-white shadow-md shadow-sky-600/10"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center truncate">
                        <span className="mr-2.5 text-base">📁</span>
                        <span className="truncate">{p.nombre}</span>
                      </span>
                      <button
                        onClick={(e) => handleEliminarProyecto(p.id, e)}
                        className={`text-slate-500 hover:text-rose-400 p-1 rounded transition-colors lg:opacity-0 group-hover:opacity-100 ${
                          activo ? "text-sky-200 hover:text-white" : ""
                        }`}
                        title="Eliminar carpeta"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sección Inferior: Botón Cerrar Sesión */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 rounded-xl transition-all"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 🌟 Modal de Nueva Carpeta */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-sky-100 font-sans animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Nueva Carpeta de Estudio</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearProyecto} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="modalNombre">
                  Nombre de la materia / tema
                </label>
                <input
                  id="modalNombre"
                  type="text"
                  placeholder="Ej. Software 1, Inglés, Redes"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-primario focus:ring-4 focus:ring-sky-100 transition-all text-sm"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="modalDesc">
                  Descripción (Opcional)
                </label>
                <textarea
                  id="modalDesc"
                  placeholder="Añade un resumen breve o notas del tema"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-primario focus:ring-4 focus:ring-sky-100 transition-all text-sm h-20 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="text-rose-600 bg-rose-50 border border-rose-100 text-xs p-2.5 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-4 py-2 text-sm font-bold bg-primario hover:bg-primario-hover text-white rounded-xl shadow-lg shadow-sky-600/10 hover:shadow-sky-600/25 transition-all"
                >
                  {cargando ? "Creando..." : "Crear Carpeta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}