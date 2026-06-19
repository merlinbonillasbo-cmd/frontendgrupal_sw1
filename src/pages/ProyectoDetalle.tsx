import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerProyectos, editarProyecto } from "../services/proyecto";
import { obtenerAudios, subirAudio, eliminarAudio } from "../services/audio";
import type { Proyecto } from "../services/proyecto";
import type { Audio } from "../services/audio";

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados principales
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados de edición del proyecto
  const [mostrarModalEdit, setMostrarModalEdit] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [guardandoProyecto, setGuardandoProyecto] = useState(false);
  
  // Estados de subida de audio
  const [mostrarModalSubir, setMostrarModalSubir] = useState(false);
  const [subirTitulo, setSubirTitulo] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [subiendoAudio, setSubiendoAudio] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");

  const cargarDatos = async () => {
    if (!id) return;
    try {
      setCargando(true);
      // Cargar info del proyecto
      const todos = await obtenerProyectos();
      const p = todos.find((item) => item.id === Number(id));
      if (p) {
        setProyecto(p);
        setEditNombre(p.nombre);
        setEditDescripcion(p.descripcion || "");
        
        // Cargar audios del proyecto
        const listaAudios = await obtenerAudios(p.id);
        setAudios(listaAudios);
      } else {
        navigate("/perfil");
      }
    } catch (err) {
      console.error("Error al cargar los datos del proyecto:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id, navigate]);

  const handleEditarProyectoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombre.trim() || !proyecto) return;
    setGuardandoProyecto(true);
    setErrorMsg("");
    try {
      const proyectoActualizado = await editarProyecto(proyecto.id, editNombre, editDescripcion);
      setProyecto(proyectoActualizado);
      setMostrarModalEdit(false);
      // Recargar la página/sidebar para que se refleje el nombre cambiado en el layout
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al actualizar la carpeta");
    } finally {
      setGuardandoProyecto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoSeleccionado(file);
      
      // Auto-prellenar título quitando la extensión
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setSubirTitulo(baseName);
      setMostrarModalSubir(true);
    }
  };

  const handleSubirAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoSeleccionado || !subirTitulo.trim() || !proyecto) return;
    setSubiendoAudio(true);
    setErrorMsg("");
    try {
      const nuevoAudio = await subirAudio(proyecto.id, subirTitulo, archivoSeleccionado);
      setAudios([nuevoAudio, ...audios]);
      setMostrarModalSubir(false);
      setArchivoSeleccionado(null);
      setSubirTitulo("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Error al subir el archivo de audio");
    } finally {
      setSubiendoAudio(false);
    }
  };

  const handleEliminarAudio = async (audioId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este audio?")) return;
    try {
      await eliminarAudio(audioId);
      setAudios(audios.filter((a) => a.id !== audioId));
    } catch (err) {
      console.error("Error al eliminar audio:", err);
      alert("No se pudo eliminar el archivo de audio.");
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-600 font-medium font-sans">
        <span className="inline-block animate-spin mr-2">⏳</span> Cargando carpeta...
      </div>
    );
  }

  if (!proyecto) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-800">
      
      {/* 📁 CABECERA DE LA CARPETA */}
      <div className="bg-white/80 border border-sky-100 p-6 rounded-2xl shadow-xl shadow-sky-900/5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-primario uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-md">
              Carpeta de Estudio
            </span>
            <span className="text-xs text-slate-400">
              Creado: {new Date(proyecto.creado_en).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mt-2 flex items-center">
            <span className="mr-2.5 text-4xl">📁</span> {proyecto.nombre}
          </h1>
          {proyecto.descripcion && (
            <p className="text-slate-500 mt-2 text-sm">{proyecto.descripcion}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMostrarModalEdit(true)}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
          >
            ✏️ Editar Carpeta
          </button>
          <button
            onClick={() => navigate("/perfil")}
            className="text-slate-400 hover:text-slate-700 font-semibold text-sm transition-colors"
          >
            Volver ←
          </button>
        </div>
      </div>

      {/* 🎙️ PANEL DE AUDIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado izquierdo: Zona de carga rápida */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/80 border border-sky-100 p-6 rounded-2xl shadow-xl shadow-sky-900/5 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Subir Notas o Grabaciones</h2>
            <p className="text-xs text-slate-500 mb-4">
              Agrega audios grabados en clase, dictados o explicaciones. Aceptamos archivos en formatos comunes como MP3, WAV y M4A.
            </p>
            
            {/* Input File Escondido */}
            <label className="w-full border-2 border-dashed border-sky-200 hover:border-primario bg-slate-50 hover:bg-sky-50/40 p-6 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center group">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</span>
              <span className="text-sm font-semibold text-slate-700">Seleccionar Audio</span>
              <span className="text-xs text-slate-400 mt-1">Límite 25MB por archivo</span>
            </label>
          </div>
        </div>

        {/* Lado derecho: Lista de audios subidos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/80 border border-sky-100 p-6 rounded-2xl shadow-xl shadow-sky-900/5 backdrop-blur-md min-h-[300px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Grabaciones en esta carpeta</span>
              <span className="bg-sky-100 text-primario text-xs font-bold px-2 py-0.5 rounded-full">
                {audios.length} {audios.length === 1 ? "audio" : "audios"}
              </span>
            </h2>

            {audios.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <span className="text-4xl text-slate-300">🎵</span>
                <h3 className="font-semibold text-slate-600">No hay grabaciones todavía</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Usa el panel de la izquierda para subir tu primer archivo de audio y comenzar a procesar tus notas de estudio.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {audios.map((audio) => (
                  <div key={audio.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">🎵</span>
                        <h4 className="font-bold text-slate-800 truncate text-sm" title={audio.titulo}>
                          {audio.titulo}
                        </h4>
                      </div>
                      
                      {/* Reproductor de Audio Nativo Slim */}
                      <div className="mt-2.5">
                        <audio
                          src={audio.url_audio}
                          controls
                          className="w-full max-w-md h-8 text-xs focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                        <span>Subido: {new Date(audio.creado_en).toLocaleString()}</span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          audio.estado_procesamiento === "COMPLETADO" ? "text-exito" : "text-amber-500"
                        }`}>
                          {audio.estado_procesamiento}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleEliminarAudio(audio.id)}
                        className="text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all"
                        title="Eliminar audio"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🌟 MODAL: EDITAR CARPETA */}
      {mostrarModalEdit && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Editar Carpeta</h3>
              <button
                onClick={() => setMostrarModalEdit(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditarProyectoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="editNombre">
                  Nombre de la materia / tema
                </label>
                <input
                  id="editNombre"
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-primario focus:ring-4 focus:ring-sky-100 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="editDesc">
                  Descripción (Opcional)
                </label>
                <textarea
                  id="editDesc"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
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
                  onClick={() => setMostrarModalEdit(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoProyecto}
                  className="px-4 py-2 text-sm font-bold bg-primario hover:bg-primario-hover text-white rounded-xl shadow-lg transition-all"
                >
                  {guardandoProyecto ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: NOMBRAR Y CONFIRMAR SUBIDA DE AUDIO */}
      {mostrarModalSubir && archivoSeleccionado && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Subir nueva grabación</h3>
              <button
                onClick={() => {
                  setMostrarModalSubir(false);
                  setArchivoSeleccionado(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubirAudioSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  <strong>Archivo detectado:</strong> {archivoSeleccionado.name} ({(archivoSeleccionado.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="subirTitulo">
                  Título del audio / tema de la clase
                </label>
                <input
                  id="subirTitulo"
                  type="text"
                  value={subirTitulo}
                  onChange={(e) => setSubirTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-primario focus:ring-4 focus:ring-sky-100 transition-all text-sm"
                  required
                  placeholder="Ej. Clase 1: Introducción a la arquitectura"
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
                  onClick={() => {
                    setMostrarModalSubir(false);
                    setArchivoSeleccionado(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendoAudio}
                  className="px-4 py-2 text-sm font-bold bg-primario hover:bg-primario-hover text-white rounded-xl shadow-lg transition-all"
                >
                  {subiendoAudio ? "Subiendo..." : "Subir Grabación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
