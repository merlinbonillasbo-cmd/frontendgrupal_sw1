import React, { useState } from "react";
import { registrarUsuario } from "../services/auth_service";
import AuthLayout from "../components/AuthLayout";

export default function Registro() {
  const [form, setForm] = useState({ nombre_completo: "", correo: "", contrasena: "" });
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_completo || !form.correo || !form.contrasena) {
      setMensaje("❌ Por favor completa todos los campos");
      return;
    }

    setCargando(true);
    setMensaje("");
    try {
      const usuario = await registrarUsuario(form.nombre_completo, form.correo, form.contrasena);
      setMensaje(`✅ Usuario registrado: ${usuario.nombre_completo}`);
      // Limpiar formulario al registrarse correctamente
      setForm({ nombre_completo: "", correo: "", contrasena: "" });
    } catch (err: any) {
      setMensaje(`❌ Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full p-8 bg-white border border-[#e0f2fe] rounded-2xl shadow-xl shadow-sky-100/50 backdrop-blur-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
          <p className="text-xs text-slate-500 mt-1">Regístrate para comenzar a usar la plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-600">Nombre completo</label>
            <input
              name="nombre_completo"
              type="text"
              placeholder="Juan Pérez"
              onChange={handleChange}
              value={form.nombre_completo}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] placeholder-slate-400 transition-all text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-600">Correo electrónico</label>
            <input
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              onChange={handleChange}
              value={form.correo}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] placeholder-slate-400 transition-all text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-600">Contraseña</label>
            <input
              name="contrasena"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              value={form.contrasena}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] placeholder-slate-400 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`mt-2 px-4 py-3 bg-[#0284c7] text-white font-semibold rounded-xl hover:bg-[#0369a1] transition-all shadow-lg shadow-sky-600/10 active:scale-[0.99] text-sm ${
              cargando ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {mensaje && (
          <p
            className={`mt-4 text-xs font-medium text-center p-3 rounded-lg ${
              mensaje.startsWith("✅")
                ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                : "text-red-700 bg-red-50 border border-red-100"
            }`}
          >
            {mensaje}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-[#0284c7] hover:underline font-bold transition-all">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}