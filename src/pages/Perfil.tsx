import React, { useEffect, useState } from "react";
import { verPerfil, type Usuario } from "../services/usuario_service";

export default function Perfil() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    verPerfil()
      .then(setPerfil)
      .catch((err) => setMensaje(`❌ Error: ${err.response?.data?.detail || err.message}`));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 font-sans">
      {/* Encabezado de la Sección */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
        <p className="text-slate-500 text-sm mt-1">Gestiona la información de tu cuenta personal.</p>
      </div>

      {perfil ? (
        /* Tarjeta Principal del Perfil */
        <div className="bg-white border border-[#e0f2fe] rounded-2xl shadow-xl shadow-sky-100/50 p-8 overflow-hidden relative">
          
          {/* Decoración visual de fondo (un sutil gradiente arriba a la derecha) */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#38bdf8]/10 to-[#0284c7]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Fila del Avatar y Datos Principales */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border-b border-[#e0f2fe] pb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-sky-600/20">
              👤
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{perfil.nombre_completo}</h2>
              <p className="text-slate-500 text-sm">{perfil.correo}</p>
            </div>
            
            {/* Badge de Estado Dinámico */}
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                perfil.estado 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${perfil.estado ? "bg-emerald-500" : "bg-red-500"}`} />
                {perfil.estado ? "Cuenta Activa" : "Inactiva"}
              </span>
            </div>
          </div>

          {/* Detalles Técnicos / Datos Informativos */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f0f9ff] border border-[#e0f2fe] p-4 rounded-xl">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase block">Nombre Completo</span>
              <span className="text-sm font-semibold text-slate-700 mt-1 block">{perfil.nombre_completo}</span>
            </div>

            <div className="bg-[#f0f9ff] border border-[#e0f2fe] p-4 rounded-xl">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase block">Dirección de Correo</span>
              <span className="text-sm font-semibold text-slate-700 mt-1 block">{perfil.correo}</span>
            </div>
          </div>

          {/* Acciones del Perfil */}
          <div className="mt-8 flex justify-end">
            <a 
              href="/perfil/editar" 
              className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-[#e0f2fe] text-slate-700 hover:text-[#0284c7] hover:bg-[#e0f2fe]/30 font-semibold rounded-xl transition-all text-sm shadow-sm"
            >
              ✏️ Editar Datos del Perfil
            </a>
          </div>

        </div>
      ) : (
        /* Estado de Carga o Mensaje de Error */
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-[#e0f2fe] rounded-2xl">
          {mensaje ? (
            <p className="text-red-600 font-medium text-center">{mensaje}</p>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              {/* Animación Sutil de Carga */}
              <div className="w-8 h-8 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm animate-pulse">Consultando información del servidor...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}