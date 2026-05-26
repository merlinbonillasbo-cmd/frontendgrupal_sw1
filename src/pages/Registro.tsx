import React, { useState } from "react";
import { registrarUsuario } from "../services/usuario";

export default function Registro() {
  const [form, setForm] = useState({ nombre_completo: "", correo: "", contrasena: "" });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usuario = await registrarUsuario(form.nombre_completo, form.correo, form.contrasena);
      setMensaje(`✅ Usuario registrado: ${usuario.nombre_completo}`);
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    /* Contenedor padre: Centrado absoluto en toda la pantalla */
    <div className="flex min-h-screen items-center justify-center p-4">
      
      {/* Tarjeta de Registro con los mismos estilos visuales que el Login */}
      <div className="w-full max-w-md p-6 bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-sm font-sans">
        <h2 className="text-2xl font-bold text-center text-primario mb-6">Registro</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            name="nombre_completo"
            type="text"
            placeholder="Nombre completo"
            onChange={handleChange}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-secundario placeholder-slate-400"
          />
          <input
            name="correo"
            type="email"
            placeholder="Correo"
            onChange={handleChange}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-secundario placeholder-slate-400"
          />
          <input
            name="contrasena"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-secundario placeholder-slate-400"
          />
          
          <button
            type="submit"
            className="px-3 py-2 bg-primario text-white font-semibold rounded hover:bg-primario-hover transition-colors shadow-lg shadow-primario/20"
          >
            Registrarse
          </button>
        </form>
        
        <p
          className={`mt-4 text-sm text-center ${
            mensaje.startsWith("✅") ? "text-exito" : "text-error"
          }`}
        >
          {mensaje}
        </p>
        
        <p className="mt-4 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-secundario hover:underline font-medium">
            Inicia sesión aquí
          </a>
        </p>
      </div>

    </div>
  );
}