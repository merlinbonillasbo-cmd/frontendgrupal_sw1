import React, { useState } from "react";
import { login } from "../services/usuario";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.correo, form.contrasena);
      setMensaje("✅ Login exitoso");
      navigate("/perfil");
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    /* 🌟 Contenedor padre: Ocupa todo el alto visible, centra horizontal/verticalmente y da un pequeño padding en móviles */
    <div className="flex min-h-screen items-center justify-center p-4">
      
      {/* 🌟 Tarjeta de Login: Cambiada a un fondo oscuro sutil (slate-800/900) para no romper con el fondo global */}
      <div className="w-full max-w-md p-6 bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-sm font-sans">
        <h2 className="text-2xl font-bold text-center text-primario mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            name="correo"
            type="email"
            placeholder="Correo"
            onChange={handleChange}
            /* Agregamos estilos oscuros para el input: bg-slate-800 y texto blanco */
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-secundario placeholder-slate-400"
          />
          <input
            name="contrasena"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
            /* Agregamos estilos oscuros para el input: bg-slate-800 y texto blanco */
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-secundario placeholder-slate-400"
          />
          
          <button
            type="submit"
            className="px-3 py-2 bg-primario text-white font-semibold rounded hover:bg-primario-hover transition-colors shadow-lg shadow-primario/20"
          >
            Ingresar
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
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-secundario hover:underline font-medium">
            Regístrate aquí
          </a>
        </p>
      </div>

    </div>
  );
}