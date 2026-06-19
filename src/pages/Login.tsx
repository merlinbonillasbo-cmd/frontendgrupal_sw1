import React, { useState } from "react";
import { login } from "../services/usuario";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.correo || !form.contrasena) {
      setMensaje("⚠️ Por favor completa todos los campos.");
      return;
    }
    setCargando(true);
    setMensaje("");
    try {
      await login(form.correo, form.contrasena);
      setMensaje("✅ ¡Bienvenido! Redirigiendo...");
      setTimeout(() => {
        navigate("/perfil");
      }, 1000);
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Tarjeta de Login Premium - Blanca/Celeste con sombra difuminada */}
      <div className="w-full max-w-md p-8 bg-white/90 border border-sky-100 rounded-2xl shadow-2xl shadow-sky-900/10 backdrop-blur-md font-sans transition-all duration-300 hover:shadow-sky-900/15">
        
        {/* Cabecera con Icono */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 bg-sky-50 rounded-full mb-3 text-primario shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Iniciar Sesión</h2>
          <p className="text-slate-500 text-sm mt-1">Accede a tu cuenta personal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="correo">
              Correo Electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              placeholder="ejemplo@correo.com"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-primario focus:ring-4 focus:ring-sky-100 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="contrasena">
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-primario focus:ring-4 focus:ring-sky-100 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 px-4 mt-2 bg-primario text-white font-bold rounded-xl shadow-lg shadow-sky-600/10 hover:shadow-sky-600/20 active:scale-[0.98] transition-all text-sm ${
              cargando ? "opacity-75 cursor-not-allowed" : "hover:bg-primario-hover"
            }`}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {mensaje && (
          <div
            className={`mt-5 p-3 rounded-xl text-center text-sm font-medium border ${
              mensaje.startsWith("✅")
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : mensaje.startsWith("⚠️")
                ? "bg-amber-50 border-amber-100 text-amber-700"
                : "bg-rose-50 border-rose-100 text-rose-700"
            }`}
          >
            {mensaje}
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <p className="text-sm text-slate-500">
            ¿No tienes una cuenta aún?{" "}
            <a href="/registro" className="text-primario hover:text-primario-hover font-semibold transition-colors">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}