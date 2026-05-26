import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Vistas Públicas (Totalmente libres del Layout) */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />

        {/* 🔒 Vistas Privadas (Todas protegidas globalmente por el Layout) */}
        <Route element={<Layout />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/editar" element={<EditarPerfil />} />
          {/* 💡 Cualquier nueva vista que agregues aquí ya tendrá el Sidebar */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;