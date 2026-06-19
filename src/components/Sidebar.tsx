import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const linkActivo = (path: string) =>
    location.pathname === path
      ? "bg-primario text-white"
      : "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between font-sans fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primario to-secundario">
          Panel de Control
        </h2>

        <nav className="mt-8 space-y-2">
          <Link
            to="/perfil"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${linkActivo("/perfil")}`}
          >
            👤 Mi Perfil
          </Link>

          <Link
            to="/perfil/editar"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${linkActivo("/perfil/editar")}`}
          >
            ⚙️ Editar Perfil
          </Link>

          <Link
            to="/proyectos"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${linkActivo("/proyectos")}`}
          >
            📁 Mis Proyectos
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}