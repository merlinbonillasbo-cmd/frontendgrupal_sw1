import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import Proyectos from "./pages/Proyectos";
import Layout from "./components/Layout";
import Audios from "./pages/Audios";
import Resumenes from "./pages/Resumenes";
import ChatProyecto from "./pages/ChatProyecto";
import GrafoProyecto from "./pages/GrafoProyecto";
import GrafosGlobales from "./pages/GrafosGlobales";
import Quizzes from "./pages/Quizzes";
import Presentaciones from "./pages/Presentaciones";
import PDFs from "./pages/PDFs";
import ResumenesGlobales from "./pages/ResumenesGlobales";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vistas públicas */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />

        {/* Vistas privadas con Layout y Sidebar */}
        <Route element={<Layout />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/editar" element={<EditarPerfil />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:proyectoId/audios" element={<Audios />} />
          <Route path="/proyectos/:proyectoId/resumenes" element={<Resumenes />} />
          <Route path="/proyectos/:proyectoId/chat" element={<ChatProyecto />} />
          <Route path="/proyectos/:proyectoId/grafo" element={<GrafoProyecto />} />
          <Route path="/grafos" element={<GrafosGlobales />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/presentaciones" element={<Presentaciones />} />
          <Route path="/pdfs" element={<PDFs />} />
          <Route path="/resumenes" element={<ResumenesGlobales />} />
        </Route>


      </Routes>
    </BrowserRouter>
  );
}

export default App;