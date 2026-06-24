import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Leer el rol desde localStorage para mostrar enlace admin
  const usuarioGuardado = localStorage.getItem("usuario");
  const rolUsuario = usuarioGuardado ? JSON.parse(usuarioGuardado).rol : "USUARIO";
  const esAdmin = rolUsuario === "ADMIN";

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const linkActivo = (path: string) =>
    location.pathname === path
      ? "bg-[#0284c7] text-white shadow-md shadow-sky-600/10"
      : "text-slate-600 hover:bg-[#e0f2fe]/50 hover:text-[#0284c7]";

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#e0f2fe] flex flex-col justify-between font-sans fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] to-[#38bdf8] tracking-tight">
          Panel de Control
        </h2>

        <nav className="mt-8 space-y-2">
          <Link
            to="/perfil"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/perfil")}`}
          >
            👤 Mi Perfil
          </Link>

          <Link
            to="/perfil/editar"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/perfil/editar")}`}
          >
            ⚙️ Editar Perfil
          </Link>

          <Link
            to="/proyectos"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/proyectos")}`}
          >
            📁 Mis Proyectos
          </Link>

          <Link
            to="/grafos"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/grafos")}`}
          >
            📊 Grafos de Audios
          </Link>

          <Link
            to="/quizzes"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/quizzes")}`}
          >
            📝 Quizzes
          </Link>

          <Link
            to="/presentaciones"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/presentaciones")}`}
          >
            🎭 Presentaciones
          </Link>

          <Link
            to="/pdfs"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/pdfs")}`}
          >
            📄 PDFs
          </Link>

          <Link
            to="/resumenes"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/resumenes")}`}
          >
            📝 Resúmenes
          </Link>

          <Link
            to="/suscripcion"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/suscripcion")}`}
          >
            💳 Mi Suscripción
          </Link>

          {esAdmin && (
            <Link
              to="/admin"
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${linkActivo("/admin")}`}
            >
              🛡️ Administración
            </Link>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-[#e0f2fe]">
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}