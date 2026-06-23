import { Link, useLocation } from "react-router-dom";
import loginImg from "../../../img/login.jpeg";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-12 bg-[#f0f9ff] text-slate-800 font-sans">
      
      {/* 🧭 Botones de Navegación en la esquina superior izquierda */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <Link
          to="/login"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            isLogin
              ? "bg-[#0284c7] text-white hover:bg-[#0369a1] shadow-md shadow-sky-600/20"
              : "bg-white text-[#0284c7] border border-[#e0f2fe] hover:bg-[#e0f2fe]/40"
          }`}
        >
          🔑 Iniciar Sesión
        </Link>
        <Link
          to="/registro"
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            !isLogin
              ? "bg-[#0284c7] text-white hover:bg-[#0369a1] shadow-md shadow-sky-600/20"
              : "bg-white text-[#0284c7] border border-[#e0f2fe] hover:bg-[#e0f2fe]/40"
          }`}
        >
          📝 Registrarse
        </Link>
      </div>

      {/* ℹ️ Columna Explicativa: Presentación del Software */}
      <div className="lg:col-span-7 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-white border-r border-[#e0f2fe] pt-24 lg:pt-16">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-[#0284c7] bg-[#e0f2fe] rounded-full uppercase tracking-wider">
            Software Inteligente v1.0
          </span>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            Procesamiento y Análisis Inteligente de <span className="text-[#0284c7] bg-clip-text">Audios</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Nuestra plataforma avanzada te ayuda a extraer el máximo valor de tus grabaciones y reuniones. Transcribe con precisión, genera resúmenes automáticos, chatea directamente con el conocimiento de tus archivos y visualiza las ideas principales en interactivos grafos semánticos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f0f9ff] text-[#0284c7] rounded-lg">🎙️</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Transcripción de Precisión</h4>
                <p className="text-xs text-slate-500">Conversión automatizada de voz a texto e identificación de hablantes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f0f9ff] text-[#0284c7] rounded-lg">📝</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Resúmenes con IA</h4>
                <p className="text-xs text-slate-500">Genera reportes de los puntos más relevantes de forma instantánea.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f0f9ff] text-[#0284c7] rounded-lg">💬</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Chat RAG Interactivo</h4>
                <p className="text-xs text-slate-500">Resuelve dudas y consulta el contexto de tus audios en tiempo real.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f0f9ff] text-[#0284c7] rounded-lg">🕸️</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Grafos del Proyecto</h4>
                <p className="text-xs text-slate-500">Visualiza conexiones entre ideas clave con mapas de conocimiento.</p>
              </div>
            </div>
          </div>

          {/* 🖼️ Imagen Ilustrativa */}
          <div className="pt-6 flex justify-center lg:justify-start">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#0284c7] opacity-20 blur-md transition duration-1000 group-hover:opacity-30"></div>
              <img
                src={loginImg}
                alt="Product Showcase"
                className="relative w-full max-w-md lg:max-w-lg rounded-2xl shadow-xl border border-slate-100 object-cover hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔓 Columna del Formulario */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 md:p-12 bg-[#f0f9ff] min-h-[500px] lg:min-h-screen">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    </div>
  );
}
