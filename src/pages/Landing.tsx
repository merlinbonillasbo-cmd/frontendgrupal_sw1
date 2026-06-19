import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 🌟 Barra de Navegación */}
      <nav className="w-full bg-white/80 border-b border-sky-100 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-primario text-white flex items-center justify-center rounded-xl font-black text-xl shadow-lg shadow-sky-600/20">
              A
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              AudioNotes <span className="text-primario">AI</span>
            </span>
          </div>

          {/* Botones de Inicio de Sesión y Registro */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-primario hover:bg-sky-50 rounded-xl transition-all"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/registro")}
              className="px-5 py-2.5 text-sm font-semibold bg-primario hover:bg-primario-hover text-white rounded-xl shadow-lg shadow-sky-600/10 hover:shadow-sky-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      {/* 🌟 Sección Hero Principal */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Lado Izquierdo: Mensaje de Presentación */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-sky-50 text-primario text-xs font-bold uppercase tracking-wider px-3  py-1.5 rounded-full">
            <span>✨ Estudia de Forma Inteligente</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-none">
            Convierte tus <span className="text-primario">audios</span> en apuntes y quizzes con IA
          </h1>
          
          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
            Sube grabaciones de tus clases, conferencias o notas de voz. Nuestra IA generará de inmediato transcripciones, cuestionarios prácticos, documentos listos en PDF/Word y mapas de conocimiento.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-4">
            <button
              onClick={() => navigate("/registro")}
              className="w-full sm:w-auto px-8 py-4 bg-primario hover:bg-primario-hover text-white font-bold rounded-2xl shadow-xl shadow-sky-600/25 hover:shadow-sky-600/35 hover:scale-[1.03] active:scale-[0.97] transition-all text-base"
            >
              Comenzar Gratis
            </button>
            <a
              href="#caracteristicas"
              className="w-full sm:w-auto text-center px-8 py-4 text-slate-700 hover:text-primario hover:bg-slate-100/80 rounded-2xl font-bold transition-all text-base"
            >
              Saber más
            </a>
          </div>
        </div>

        {/* Lado Derecho: Imagen de Referencia o Captura del Software */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg lg:max-w-none group">
            {/* Fondo decorativo con gradiente */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-35 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Contenedor de la Imagen */}
            <div className="relative bg-white border border-sky-100 p-3 rounded-3xl shadow-2xl shadow-sky-900/10">
              <img
                src="/layaot.jpg"
                alt="Vista del Software / Presentación Layout"
                className="w-full h-auto rounded-2xl object-cover"
                onError={(e) => {
                  // Fallback por si no han copiado la imagen todavía
                  e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";
                }}
              />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 text-white text-sm shadow-xl">
                <p className="font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping"></span>
                  Presentación del Layout
                </p>
                <p className="text-slate-300 text-xs mt-1">
                  Sube tus audios, organízalos por carpetas y genera tu material educativo al instante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 🌟 Sección Características */}
      <section id="caracteristicas" className="w-full bg-white py-16 border-t border-sky-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-slate-800 tracking-tight mb-12">
            Todo lo que puedes generar a partir de tus audios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-primario flex items-center justify-center rounded-xl text-xl font-bold">
                📝
              </div>
              <h3 className="text-lg font-bold text-slate-800">Quizzes y Cuestionarios</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Prueba tus conocimientos con cuestionarios generados automáticamente en base al tema del audio.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-primario flex items-center justify-center rounded-xl text-xl font-bold">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-800">Mapas de Conocimiento</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Visualiza tus apuntes en mapas conceptuales y grafos interactivos que vinculan las ideas clave.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-primario flex items-center justify-center rounded-xl text-xl font-bold">
                📄
              </div>
              <h3 className="text-lg font-bold text-slate-800">Exportación a PDF y Word</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Descarga de inmediato tus resúmenes e informes detallados estructurados profesionalmente.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-primario flex items-center justify-center rounded-xl text-xl font-bold">
                🗣️
              </div>
              <h3 className="text-lg font-bold text-slate-800">Transcripción Completa</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Obtén el texto completo palabra por palabra con detección automática de distintos hablantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 Footer */}
      <footer className="w-full bg-slate-50 border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AudioNotes AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
