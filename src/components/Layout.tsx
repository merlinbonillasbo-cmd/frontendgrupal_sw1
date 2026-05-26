import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-fondo-oscuro text-white">
      {/* Barra Lateral Fija */}
      <Sidebar />

      {/* Contenedor de las Vistas del Sistema */}
      <main className="flex-1 ml-64 p-8">
        {/* 🌟 Outlet renderizará automáticamente la vista de la ruta actual */}
        <Outlet />
      </main>
    </div>
  );
}