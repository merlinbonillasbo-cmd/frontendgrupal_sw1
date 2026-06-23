import React, { useEffect, useState } from "react";
import {
  listarAudiosDisponibles,
  crearPresentacion,
  obtenerPresentacion,
  guardarPresentacion,
  listarHistorialPresentaciones,
  type AudioDisponible,
  type Presentacion,
  type Diapositiva,
  type DisenoPresentacion,
} from "../services/presentacion_service";

// Declarar variable global de window para TypeScript
declare global {
  interface Window {
    PptxGenJS?: any;
  }
}

export default function Presentaciones() {
  // Estados generales
  const [audios, setAudios] = useState<AudioDisponible[]>([]);
  const [historial, setHistorial] = useState<Presentacion[]>([]);
  const [loadingAudios, setLoadingAudios] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [pptxLoaded, setPptxLoaded] = useState(false);

  // Estado para la creación
  const [titulo, setTitulo] = useState("");
  const [selectedAudios, setSelectedAudios] = useState<number[]>([]);
  const [generando, setGenerando] = useState(false);
  const [creacionError, setCreacionError] = useState("");

  // Estado para la Presentación Activa (Editor Canva-like)
  const [presActiva, setPresActiva] = useState<Presentacion | null>(null);
  const [cargandoPres, setCargandoPres] = useState(false);
  const [indiceDiapositiva, setIndiceDiapositiva] = useState(0);
  
  // Estado para la personalización de diseño
  const [tema, setTema] = useState<"sky" | "dark" | "sand" | "minimal" | "forest" | "plum">("sky");
  const [fuente, setFuente] = useState("Inter");
  const [colorFondo, setColorFondo] = useState("#e0f2fe");
  const [colorTitulo, setColorTitulo] = useState("#0369a1");
  const [colorTexto, setColorTexto] = useState("#334155");

  // Estado de guardado
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  // Pestaña lateral izquierda en el editor: "slides" o "design"
  const [pestanaLateral, setPestanaLateral] = useState<"slides" | "design">("slides");

  // Cargar biblioteca PPTXGenJS de forma dinámica desde CDN
  useEffect(() => {
    if (window.PptxGenJS) {
      setPptxLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgenjs.bundle.js";
    script.async = true;
    script.onload = () => {
      setPptxLoaded(true);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  async function cargarDatosIniciales() {
    try {
      setLoadingAudios(true);
      const dataAudios = await listarAudiosDisponibles();
      setAudios(dataAudios);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAudios(false);
    }

    try {
      setLoadingHistorial(true);
      const dataHistorial = await listarHistorialPresentaciones();
      setHistorial(dataHistorial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  }

  // Pre-configuraciones de temas Canva
  const cambiarTemaPreset = (presetName: "sky" | "dark" | "sand" | "minimal" | "forest" | "plum") => {
    setTema(presetName);
    if (presetName === "sky") {
      setColorFondo("#e0f2fe");
      setColorTitulo("#0369a1");
      setColorTexto("#334155");
    } else if (presetName === "dark") {
      setColorFondo("#0f172a");
      setColorTitulo("#38bdf8");
      setColorTexto("#cbd5e1");
    } else if (presetName === "sand") {
      setColorFondo("#fef3c7");
      setColorTitulo("#78350f");
      setColorTexto("#451a03");
    } else if (presetName === "minimal") {
      setColorFondo("#ffffff");
      setColorTitulo("#0284c7");
      setColorTexto("#475569");
    } else if (presetName === "forest") {
      setColorFondo("#f0fdf4");
      setColorTitulo("#166534");
      setColorTexto("#374151");
    } else if (presetName === "plum") {
      setColorFondo("#faf5ff");
      setColorTitulo("#6b21a8");
      setColorTexto("#3b0764");
    }
  };

  // Manejar checkboxes
  const toggleAudioSelection = (audioId: number) => {
    setSelectedAudios((prev) =>
      prev.includes(audioId) ? prev.filter((id) => id !== audioId) : [...prev, audioId]
    );
  };

  // Iniciar generación con RAG
  const handleCrearPresentacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAudios.length === 0) {
      setCreacionError("Debes seleccionar al menos un audio.");
      return;
    }
    setCreacionError("");
    setGenerando(true);

    try {
      const presTitle = titulo.trim() || `Diapositivas de Estudio (${new Date().toLocaleDateString()})`;
      const nuevaPres = await crearPresentacion(presTitle, selectedAudios);
      
      // Abrir editor directamente
      cargarDetallePresentacion(nuevaPres.id);
      
      // Limpiar formulario
      setTitulo("");
      setSelectedAudios([]);
    } catch (err: any) {
      setCreacionError(err.message || "Error al generar la presentación.");
    } finally {
      setGenerando(false);
    }
  };

  // Cargar detalles de una presentación del historial
  const cargarDetallePresentacion = async (presId: number) => {
    try {
      setCargandoPres(true);
      const pres = await obtenerPresentacion(presId);
      setPresActiva(pres);
      setIndiceDiapositiva(0);
      
      // Cargar configuraciones de diseño guardadas
      if (pres.diseno) {
        setTema(pres.diseno.tema || "sky");
        setFuente(pres.diseno.fuente || "Inter");
        setColorFondo(pres.diseno.colorFondo || "#e0f2fe");
        setColorTitulo(pres.diseno.colorTitulo || "#0369a1");
        setColorTexto(pres.diseno.colorTexto || "#334155");
      }
    } catch (err) {
      alert("Error al cargar la presentación.");
    } finally {
      setCargandoPres(false);
    }
  };

  // Modificar elementos de la diapositiva activa (edición directa tipo Canva)
  const actualizarDiapositivaActiva = (camposModificados: Partial<Diapositiva>) => {
    if (!presActiva) return;
    
    const nuevoContenido = [...presActiva.contenido];
    nuevoContenido[indiceDiapositiva] = {
      ...nuevoContenido[indiceDiapositiva],
      ...camposModificados,
    };

    setPresActiva({
      ...presActiva,
      contenido: nuevoContenido,
    });
  };

  // Agregar nueva diapositiva
  const agregarNuevaDiapositiva = () => {
    if (!presActiva) return;
    
    const nuevaSlide: Diapositiva = {
      tipo: "contenido",
      titulo: "Nueva Diapositiva",
      puntos: ["Nuevo punto clave"],
      notas_orador: "Notas para el expositor...",
    };

    const nuevoContenido = [...presActiva.contenido];
    // Insertar justo después de la seleccionada
    nuevoContenido.splice(indiceDiapositiva + 1, 0, nuevaSlide);

    setPresActiva({
      ...presActiva,
      contenido: nuevoContenido,
    });
    setIndiceDiapositiva(indiceDiapositiva + 1);
  };

  // Eliminar diapositiva activa
  const eliminarDiapositivaActiva = () => {
    if (!presActiva || presActiva.contenido.length <= 1) return;
    
    const nuevoContenido = presActiva.contenido.filter((_, idx) => idx !== indiceDiapositiva);
    setPresActiva({
      ...presActiva,
      contenido: nuevoContenido,
    });
    setIndiceDiapositiva(Math.max(0, indiceDiapositiva - 1));
  };

  // Guardar en la base de datos
  const handleGuardarCambios = async () => {
    if (!presActiva) return;
    setGuardando(true);
    setGuardadoOk(false);

    const disenoActual: DisenoPresentacion = {
      tema,
      fuente,
      colorFondo,
      colorTitulo,
      colorTexto,
    };

    try {
      await guardarPresentacion(
        presActiva.id,
        presActiva.titulo,
        presActiva.contenido,
        disenoActual
      );
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
      
      // Recargar historial en segundo plano
      const dataHistorial = await listarHistorialPresentaciones();
      setHistorial(dataHistorial);
    } catch (err) {
      alert("Error al guardar la presentación.");
    } finally {
      setGuardando(false);
    }
  };

  // Exportar y descargar como PPTX real en el cliente
  const exportarPowerPoint = () => {
    if (!presActiva || !pptxLoaded || !window.PptxGenJS) {
      alert("El exportador de PowerPoint aún no está listo o no hay datos para exportar.");
      return;
    }

    try {
      const pptx = new window.PptxGenJS();
      
      // Configurar tamaño general de diapositiva Widescreen (16:9)
      pptx.layout = "LAYOUT_16x9";

      presActiva.contenido.forEach((slideData) => {
        const slide = pptx.addSlide();
        
        // Asignar color de fondo (quitar el '#' de hexadecimal)
        const hexFondo = colorFondo.replace("#", "");
        slide.background = { fill: hexFondo };

        // Añadir notas de orador
        if (slideData.notas_orador) {
          slide.addNotes(slideData.notas_orador);
        }

        const fontFace = fuente;
        const hexTitulo = colorTitulo.replace("#", "");
        const hexTexto = colorTexto.replace("#", "");

        if (slideData.tipo === "titulo") {
          // Layout de Diapositiva de Título
          slide.addText(slideData.titulo, {
            x: 1.0,
            y: 2.2,
            w: 11.3,
            h: 1.5,
            fontSize: 40,
            bold: true,
            color: hexTitulo,
            fontFace: fontFace,
            align: "center"
          });

          if (slideData.subtitulo) {
            slide.addText(slideData.subtitulo, {
              x: 1.0,
              y: 3.8,
              w: 11.3,
              h: 1.0,
              fontSize: 20,
              color: hexTexto,
              fontFace: fontFace,
              align: "center"
            });
          }
        } else if (slideData.tipo === "two-columns") {
          // Layout Dos Columnas
          slide.addText(slideData.titulo, {
            x: 0.8,
            y: 0.6,
            w: 11.7,
            h: 0.8,
            fontSize: 28,
            bold: true,
            color: hexTitulo,
            fontFace: fontFace
          });

          // Columna izquierda
          slide.addText(slideData.columna_izquierda || "", {
            x: 0.8,
            y: 1.6,
            w: 5.5,
            h: 4.8,
            fontSize: 15,
            color: hexTexto,
            fontFace: fontFace,
            align: "left"
          });

          // Columna derecha
          slide.addText(slideData.columna_derecha || "", {
            x: 7.0,
            y: 1.6,
            w: 5.5,
            h: 4.8,
            fontSize: 15,
            color: hexTexto,
            fontFace: fontFace,
            align: "left"
          });
        } else if (slideData.tipo === "quote") {
          // Layout Cita Destacada
          // Dibujar una línea vertical izquierda de color acento usando un cuadro de texto relleno
          slide.addText("", {
            x: 1.2,
            y: 1.8,
            w: 0.08,
            h: 3.5,
            fill: { color: hexTitulo }
          });

          // Texto de la cita
          slide.addText(slideData.titulo || "", {
            x: 1.5,
            y: 1.8,
            w: 10.5,
            h: 3.5,
            fontSize: 22,
            italic: true,
            color: hexTexto,
            fontFace: fontFace,
            align: "left",
            valign: "middle"
          });
        } else {
          // Layout de Diapositiva de Contenido
          slide.addText(slideData.titulo, {
            x: 0.8,
            y: 0.6,
            w: 11.7,
            h: 0.8,
            fontSize: 28,
            bold: true,
            color: hexTitulo,
            fontFace: fontFace
          });

          // Puntos clave / viñetas
          if (slideData.puntos && slideData.puntos.length > 0) {
            const viñetasObj = slideData.puntos.map((pt) => ({
              text: pt,
              options: { bullet: true, fontSize: 16, color: hexTexto, fontFace: fontFace, lineSpacing: 24 }
            }));

            slide.addText(viñetasObj, {
              x: 0.8,
              y: 1.6,
              w: 11.7,
              h: 4.8,
              align: "left"
            });
          }
        }
      });

      // Guardar y descargar archivo
      const sanitizedName = presActiva.titulo.replace(/[^a-zA-Z0-9]/g, "_");
      pptx.writeFile({ fileName: `${sanitizedName}.pptx` });
    } catch (err: any) {
      alert(`Error al generar el PowerPoint: ${err.message}`);
    }
  };

  const salirDelEditor = () => {
    setPresActiva(null);
    cargarDatosIniciales();
  };

  // PANTALLA CARGA EDITOR
  if (cargandoPres) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#f0f9ff]/40">
        <div className="w-12 h-12 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 mt-4 animate-pulse">Cargando diapositivas en Canva...</p>
      </div>
    );
  }

  // PANTALLA MODO EDITOR "CANVA-LIKE"
  if (presActiva) {
    const slideActual = presActiva.contenido[indiceDiapositiva] || {
      tipo: "contenido",
      titulo: "",
      puntos: [],
      notas_orador: "",
    };

    return (
      <div className="flex flex-col h-[calc(100vh-2rem)] bg-[#f8fafc] font-sans">
        {/* Barra superior de control */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={salirDelEditor}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Volver"
            >
              ⬅️
            </button>
            <div>
              <input
                type="text"
                value={presActiva.titulo}
                onChange={(e) => setPresActiva({ ...presActiva, titulo: e.target.value })}
                className="text-base font-bold text-slate-800 focus:outline-none focus:border-b focus:border-slate-300 px-1 bg-transparent w-72"
              />
              <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase">
                {presActiva.cantidad_diapositivas} Diapositivas generadas con RAG
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {guardadoOk && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-150 animate-pulse">
                ✓ Cambios guardados
              </span>
            )}

            <button
              onClick={handleGuardarCambios}
              disabled={guardando}
              className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-bold transition-all bg-white shadow-sm flex items-center space-x-1.5"
            >
              {guardando ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>💾</span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>

            <button
              onClick={exportarPowerPoint}
              disabled={!pptxLoaded}
              className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/10 transition-all flex items-center space-x-1.5"
            >
              <span>📊</span>
              <span>{pptxLoaded ? "Descargar PowerPoint" : "Cargando exportador..."}</span>
            </button>
          </div>
        </div>

        {/* Workspace Principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Panel Lateral Izquierdo (Miniaturas o Diseño Canva) */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            {/* Tabs del Panel Lateral */}
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setPestanaLateral("slides")}
                className={`flex-1 py-3 text-center transition-colors ${
                  pestanaLateral === "slides"
                    ? "border-b-2 border-[#0284c7] text-[#0284c7]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                🗂️ Diapositivas
              </button>
              <button
                onClick={() => setPestanaLateral("design")}
                className={`flex-1 py-3 text-center transition-colors ${
                  pestanaLateral === "design"
                    ? "border-b-2 border-[#0284c7] text-[#0284c7]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                🎨 Diseño Canva
              </button>
            </div>

            {/* Contenido del Panel Lateral */}
            <div className="flex-1 overflow-y-auto p-4">
              {pestanaLateral === "slides" ? (
                /* VISTA DIAPOSITIVAS (Miniaturas) */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Orden del diapositivo
                    </span>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={agregarNuevaDiapositiva}
                        className="bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe] w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                        title="Agregar diapositiva"
                      >
                        +
                      </button>
                      <button
                        onClick={eliminarDiapositivaActiva}
                        disabled={presActiva.contenido.length <= 1}
                        className="bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                        title="Eliminar diapositiva seleccionada"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {presActiva.contenido.map((slide, idx) => {
                      const esActiva = idx === indiceDiapositiva;
                      return (
                        <div
                          key={idx}
                          onClick={() => setIndiceDiapositiva(idx)}
                          className={`flex items-start space-x-3 p-3 rounded-xl cursor-pointer border text-left transition-all ${
                            esActiva
                              ? "border-[#0284c7] bg-[#f0f9ff] shadow-sm"
                              : "border-slate-100 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span className="w-5 h-5 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {slide.titulo || "(Sin título)"}
                            </p>
                            <span className="text-[9px] font-bold text-slate-400 capitalize">
                              {slide.tipo === "titulo" ? "Portada" : "Resumen Clave"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* PESTAÑA DISEÑO CANVA */
                <div className="space-y-6">
                  {/* Preset de Temas */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Temas Preestablecidos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => cambiarTemaPreset("sky")}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                          tema === "sky" ? "border-[#0284c7] bg-[#f0f9ff]" : "border-slate-200 bg-white"
                        }`}
                      >
                        🔵 Sleek Sky
                      </button>
                      <button
                        onClick={() => cambiarTemaPreset("dark")}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                          tema === "dark" ? "border-slate-800 bg-[#0f172a] text-white" : "border-slate-200 bg-white"
                        }`}
                      >
                        ⚫ Dark Knight
                      </button>
                      <button
                        onClick={() => cambiarTemaPreset("sand")}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                          tema === "sand" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 bg-white"
                        }`}
                      >
                        🟡 Warm Sand
                      </button>
                      <button
                        onClick={() => cambiarTemaPreset("minimal")}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                          tema === "minimal" ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        ⚪ Minimalist
                      </button>
                      <button
                        onClick={() => cambiarTemaPreset("forest")}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                          tema === "forest" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white"
                        }`}
                      >
                        🟢 Forest Green
                      </button>
                      <button
                        onClick={() => cambiarTemaPreset("plum")}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                          tema === "plum" ? "border-purple-500 bg-purple-50 text-purple-800" : "border-slate-200 bg-white"
                        }`}
                      >
                        🟣 Plum Royal
                      </button>
                    </div>
                  </div>

                  {/* Selector de Tipografías */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Familia de Fuente
                    </label>
                    <select
                      value={fuente}
                      onChange={(e) => setFuente(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="Inter">Inter (Sans-serif)</option>
                      <option value="Georgia">Georgia (Classic Serif)</option>
                      <option value="Playfair Display">Playfair (Elegant Serif)</option>
                      <option value="Courier New">Courier (Monospace)</option>
                    </select>
                  </div>

                  {/* Personalizador de Colores */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Paleta Personalizada
                    </label>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Fondo diapositiva</span>
                      <input
                        type="color"
                        value={colorFondo}
                        onChange={(e) => setColorFondo(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Color del Título</span>
                      <input
                        type="color"
                        value={colorTitulo}
                        onChange={(e) => setColorTitulo(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Color del Texto</span>
                      <input
                        type="color"
                        value={colorTexto}
                        onChange={(e) => setColorTexto(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                      />
                    </div>
                  </div>

                  {/* Layout selector para la slide activa */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Estructura (Layout) Diapositiva
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-center text-slate-600">
                      <button
                        onClick={() => actualizarDiapositivaActiva({ tipo: "titulo" })}
                        className={`p-2 rounded-xl border text-[10px] font-bold ${
                          slideActual.tipo === "titulo"
                            ? "border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        📰 Portada
                      </button>
                      <button
                        onClick={() => actualizarDiapositivaActiva({ tipo: "contenido" })}
                        className={`p-2 rounded-xl border text-[10px] font-bold ${
                          slideActual.tipo === "contenido"
                            ? "border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        📝 Resumen
                      </button>
                      <button
                        onClick={() => actualizarDiapositivaActiva({ tipo: "two-columns" })}
                        className={`p-2 rounded-xl border text-[10px] font-bold ${
                          slideActual.tipo === "two-columns"
                            ? "border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        👥 Dos Columnas
                      </button>
                      <button
                        onClick={() => actualizarDiapositivaActiva({ tipo: "quote" })}
                        className={`p-2 rounded-xl border text-[10px] font-bold ${
                          slideActual.tipo === "quote"
                            ? "border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        💬 Cita Destacada
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Area Central (Canva Interactive Preview) */}
          <div className="flex-1 p-6 flex flex-col items-center justify-between overflow-y-auto space-y-6">
            {/* Contenedor Slide Widescreen (Relación 16:9) */}
            <div
              className="w-full max-w-4xl aspect-[16/9] rounded-2xl shadow-xl p-10 flex flex-col justify-between transition-all duration-300 relative border border-slate-200"
              style={{
                backgroundColor: colorFondo,
                fontFamily: fuente,
                color: colorTexto,
              }}
            >
              {slideActual.tipo === "titulo" ? (
                /* VISTA DIAPOSITIVA TÍTULO */
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                  <input
                    type="text"
                    value={slideActual.titulo}
                    onChange={(e) => actualizarDiapositivaActiva({ titulo: e.target.value })}
                    style={{ color: colorTitulo }}
                    className="w-full text-center bg-transparent border-none text-4xl font-extrabold focus:outline-none focus:bg-[#f0f9ff]/30 rounded-xl p-2.5 placeholder-slate-400 font-sans"
                    placeholder="Título principal"
                  />
                  <input
                    type="text"
                    value={slideActual.subtitulo || ""}
                    onChange={(e) => actualizarDiapositivaActiva({ subtitulo: e.target.value })}
                    className="w-full text-center bg-transparent border-none text-lg focus:outline-none focus:bg-[#f0f9ff]/30 rounded-xl p-2.5 placeholder-slate-400"
                    placeholder="Subtítulo o descripción corta"
                  />
                </div>
              ) : slideActual.tipo === "two-columns" ? (
                /* VISTA DIAPOSITIVA DOS COLUMNAS */
                <div className="flex-1 flex flex-col justify-between">
                  <input
                    type="text"
                    value={slideActual.titulo}
                    onChange={(e) => actualizarDiapositivaActiva({ titulo: e.target.value })}
                    style={{ color: colorTitulo }}
                    className="w-full bg-transparent border-none text-2xl font-bold focus:outline-none focus:bg-[#f0f9ff]/30 rounded-xl p-1.5 placeholder-slate-400 mb-4"
                    placeholder="Título del Subtema"
                  />
                  <div className="flex-1 grid grid-cols-2 gap-6 items-stretch">
                    <textarea
                      value={slideActual.columna_izquierda || ""}
                      onChange={(e) => actualizarDiapositivaActiva({ columna_izquierda: e.target.value })}
                      placeholder="Contenido columna izquierda..."
                      style={{ color: colorTexto }}
                      className="w-full bg-black/5 border border-slate-300/10 rounded-xl p-3 focus:outline-none focus:bg-white/20 text-sm leading-relaxed resize-none font-medium"
                    />
                    <textarea
                      value={slideActual.columna_derecha || ""}
                      onChange={(e) => actualizarDiapositivaActiva({ columna_derecha: e.target.value })}
                      placeholder="Contenido columna derecha..."
                      style={{ color: colorTexto }}
                      className="w-full bg-black/5 border border-slate-300/10 rounded-xl p-3 focus:outline-none focus:bg-white/20 text-sm leading-relaxed resize-none font-medium"
                    />
                  </div>
                </div>
              ) : slideActual.tipo === "quote" ? (
                /* VISTA DIAPOSITIVA CITA */
                <div className="flex-1 flex flex-col justify-center items-stretch px-8">
                  <div className="border-l-4 pl-6 py-2" style={{ borderColor: colorTitulo }}>
                    <textarea
                      value={slideActual.titulo}
                      onChange={(e) => actualizarDiapositivaActiva({ titulo: e.target.value })}
                      rows={4}
                      style={{ color: colorTexto }}
                      className="w-full bg-transparent border-none text-xl font-medium italic focus:outline-none focus:bg-[#f0f9ff]/30 rounded-xl p-2.5 resize-none leading-relaxed placeholder-slate-400"
                      placeholder="Escribe la frase o idea clave destacada aquí..."
                    />
                  </div>
                </div>
              ) : (
                /* VISTA DIAPOSITIVA CONTENIDO (Viñetas) */
                <div className="flex-1 flex flex-col justify-between">
                  {/* Título de la diapositiva */}
                  <input
                    type="text"
                    value={slideActual.titulo}
                    onChange={(e) => actualizarDiapositivaActiva({ titulo: e.target.value })}
                    style={{ color: colorTitulo }}
                    className="w-full bg-transparent border-none text-2xl font-bold focus:outline-none focus:bg-[#f0f9ff]/30 rounded-xl p-1.5 placeholder-slate-400 mb-6"
                    placeholder="Título del Subtema"
                  />

                  {/* Viñetas / Puntos */}
                  <div className="flex-1 space-y-3.5 flex flex-col justify-start">
                    {(slideActual.puntos || []).map((punto, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2.5 group">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colorTitulo }}></span>
                        <input
                          type="text"
                          value={punto}
                          onChange={(e) => {
                            const nuevosPuntos = [...(slideActual.puntos || [])];
                            nuevosPuntos[pIdx] = e.target.value;
                            actualizarDiapositivaActiva({ puntos: nuevosPuntos });
                          }}
                          className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:bg-[#f0f9ff]/30 rounded-lg px-2 py-1"
                        />
                        <button
                          onClick={() => {
                            const nuevosPuntos = (slideActual.puntos || []).filter((_, idx) => idx !== pIdx);
                            actualizarDiapositivaActiva({ puntos: nuevosPuntos });
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs font-bold px-1 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const nuevosPuntos = [...(slideActual.puntos || []), "Nuevo punto de resumen"];
                        actualizarDiapositivaActiva({ puntos: nuevosPuntos });
                      }}
                      className="text-left text-xs font-bold opacity-60 hover:opacity-100 mt-2 flex items-center space-x-1"
                      style={{ color: colorTitulo }}
                    >
                      <span>➕ Agregar viñeta</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Marca de agua / Página */}
              <div className="flex justify-between items-center text-[10px] opacity-40 border-t border-slate-200/20 pt-2">
                <span>Plataforma inteligente de audio</span>
                <span>Diapositiva {indiceDiapositiva + 1}</span>
              </div>
            </div>

            {/* Sección inferior: Notas del Orador */}
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  🎙️ Notas del Orador (Guión de apoyo para estudiar)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Se exportan como notas del presentador en el archivo .pptx
                </span>
              </div>
              <textarea
                value={slideActual.notas_orador || ""}
                onChange={(e) => actualizarDiapositivaActiva({ notas_orador: e.target.value })}
                rows={3}
                placeholder="Escribe el discurso o notas de estudio para esta diapositiva..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:bg-white focus:border-[#0284c7] text-xs font-medium text-slate-600 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL: CREADOR Y HISTORIAL
  return (
    <div className="flex h-[calc(100vh-2rem)] bg-[#f0f9ff]/40 p-4 font-sans gap-4">
      {/* Creador de Presentaciones (Izquierda) */}
      <div className="w-96 bg-white rounded-3xl border border-[#e0f2fe] shadow-xl p-6 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleCrearPresentacion} className="space-y-6 flex-1">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
              RAG & Presentaciones
            </span>
            <h1 className="text-2xl font-black text-slate-800 mt-2 leading-tight">
              Diseño de Diapositivas
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Genera resúmenes visuales interactivos y expórtalos a PowerPoint a partir de tus audios grabados.
            </p>
          </div>

          {/* Nombre de la Presentación */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Título de la Exposición
            </label>
            <input
              type="text"
              placeholder="Ej. Arquitectura de Computadores"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e0f2fe] focus:outline-none focus:border-[#0284c7] text-sm text-slate-700 bg-[#f0f9ff]/20 placeholder-slate-400 font-semibold"
            />
          </div>

          {/* Selección de Audios */}
          <div className="space-y-2.5 flex-1 flex flex-col">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Seleccionar Audios
            </label>

            {loadingAudios ? (
              <div className="flex items-center justify-center p-6 flex-1">
                <div className="w-6 h-6 border-2 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
              </div>
            ) : audios.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-[#e0f2fe] rounded-2xl flex-1 flex flex-col justify-center items-center">
                <span className="text-2xl">🎙️</span>
                <p className="text-xs font-bold text-slate-400 mt-2">No hay audios listos</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                  Sube y transcribe audios en tus proyectos primero.
                </p>
              </div>
            ) : (
              <div className="border border-[#e0f2fe] rounded-2xl overflow-y-auto max-h-[220px] p-3 space-y-2 divide-y divide-[#f0f9ff]">
                {audios.map((audio) => {
                  const isChecked = selectedAudios.includes(audio.id);
                  return (
                    <div
                      key={audio.id}
                      onClick={() => toggleAudioSelection(audio.id)}
                      className={`flex items-start space-x-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isChecked ? "bg-[#f0f9ff]" : "hover:bg-[#f0f9ff]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Manejado por onClick del contenedor
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{audio.titulo}</p>
                        <span className="text-[9px] text-[#0284c7] bg-[#e0f2fe] font-bold px-1.5 py-0.5 rounded-full uppercase">
                          {audio.proyecto}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {creacionError && (
            <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">
              ⚠️ {creacionError}
            </p>
          )}

          <button
            type="submit"
            disabled={generando || selectedAudios.length === 0}
            className={`w-full py-4 bg-[#0284c7] text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/10 hover:bg-[#0369a1] transition-all flex items-center justify-center space-x-2 ${
              generando || selectedAudios.length === 0 ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {generando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando Diapositivas...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generar Exposición</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historial de Presentaciones (Derecha) */}
      <div className="flex-1 bg-white rounded-3xl border border-[#e0f2fe] shadow-xl p-6 flex flex-col overflow-hidden">
        <div className="border-b border-[#e0f2fe] pb-4 mb-4">
          <h2 className="text-lg font-black text-slate-800">Tus Diseños y Diapositivas</h2>
          <p className="text-xs text-slate-400 mt-1">
            Revisa, edita o exporta a PowerPoint presentaciones que hayas creado anteriormente.
          </p>
        </div>

        {loadingHistorial ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-3 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
            <span className="text-4xl mb-3">🎭</span>
            <h3 className="text-sm font-bold text-slate-800">No hay diapositivas creadas aún</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Usa el panel de la izquierda para seleccionar audios y crear tu primera presentación interactiva.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {historial.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-[#e0f2fe] rounded-2xl p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-700 leading-snug">{item.titulo}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold">
                    <span>📅 {item.creado_en ? new Date(item.creado_en).toLocaleDateString() : ""}</span>
                    <span>•</span>
                    <span>🖼️ {item.cantidad_diapositivas} Diapositivas</span>
                    <span>•</span>
                    <span className="capitalize">🎨 Tema: {item.diseno?.tema || "sky"}</span>
                  </div>
                </div>

                <button
                  onClick={() => cargarDetallePresentacion(item.id)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[#0284c7] text-[#0284c7] hover:bg-[#f0f9ff]/40 transition-colors"
                >
                  Diseñar / Ver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
