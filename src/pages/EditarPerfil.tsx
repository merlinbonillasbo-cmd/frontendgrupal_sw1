import React, { useState } from "react";
import { editarPerfil } from "../services/usuario";
import { Link } from "react-router-dom";

export default function EditarPerfil() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMensaje("⚠️ El nombre no puede estar vacío");
      return;
    }
    
    setCargando(true);
    setMensaje("");
    
    try {
      const usuario = await editarPerfil(nombre);
      setMensaje(`✅ Perfil actualizado: ${usuario.nombre_completo}`);
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 font-sans">
      {/* Encabezado con botón para volver atrás */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Editar Perfil</h1>
          <p className="text-slate-400 text-sm mt-1">Actualiza tus datos públicos de identidad en el sistema.</p>
        </div>
        <div>
          <Link
            to="/perfil"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            ← Volver a mi Perfil
          </Link>
        </div>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm p-8 relative overflow-hidden">
        
        {/* Decoración sutil de fondo */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secundario/10 to-primario/10 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Bloque del Input */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="nombre" className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Nombre Completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 text-sm">
                👤
              </span>
              <input
                id="nombre"
                type="text"
                placeholder="Escribe tu nuevo nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={cargando}
                className="w-full bg-slate-800/40 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primario focus:ring-2 focus:ring-primario/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Estado de Respuesta / Mensajes */}
          {mensaje && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${
              mensaje.startsWith("✅") 
                ? "bg-exito/10 text-exito border-exito/20" 
                : "bg-error/10 text-error border-error/20"
            }`}>
              {mensaje}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800/60">
            <Link
              to="/perfil"
              className="px-4 py-2.5 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 font-medium rounded-xl transition-colors text-sm"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-2.5 bg-gradient-to-r from-primario to-secundario text-white font-medium rounded-xl hover:opacity-90 active:scale-98 transition-all text-sm shadow-md shadow-primario/10 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:scale-100"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}