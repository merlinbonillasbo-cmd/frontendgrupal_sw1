import React, { useEffect, useState } from "react";
import {
  listarAudiosDisponibles,
  crearQuiz,
  obtenerQuiz,
  responderQuiz,
  listarHistorialQuizzes,
  type AudioDisponible,
  type Quiz,
  type PreguntaQuiz,
} from "../services/quiz_service";

export default function Quizzes() {
  // Estados generales
  const [audios, setAudios] = useState<AudioDisponible[]>([]);
  const [historial, setHistorial] = useState<Quiz[]>([]);
  const [loadingAudios, setLoadingAudios] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  
  // Estado para la creación
  const [titulo, setTitulo] = useState("");
  const [selectedAudios, setSelectedAudios] = useState<number[]>([]);
  const [generando, setGenerando] = useState(false);
  const [creacionError, setCreacionError] = useState("");

  // Estado para el Quiz Activo (Tomándolo o viendo resultados)
  const [quizActivo, setQuizActivo] = useState<Quiz | null>(null);
  const [cargandoQuiz, setCargandoQuiz] = useState(false);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestasUsuario, setRespuestasUsuario] = useState<string[]>([]);
  const [quizFinalizado, setQuizFinalizado] = useState(false);
  const [resultadoActual, setResultadoActual] = useState<{ bien: number; mal: number } | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  async function cargarDatosIniciales() {
    try {
      setLoadingAudios(true);
      const dataAudios = await listarAudiosDisponibles();
      setAudios(dataAudios);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAudios(false);
    }

    try {
      setLoadingHistorial(true);
      const dataHistorial = await listarHistorialQuizzes();
      setHistorial(dataHistorial);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  }

  // Manejar selección de checkbox de audios
  const toggleAudioSelection = (audioId: number) => {
    setSelectedAudios((prev) =>
      prev.includes(audioId) ? prev.filter((id) => id !== audioId) : [...prev, audioId]
    );
  };

  // Crear nuevo Quiz con RAG
  const handleCrearQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAudios.length === 0) {
      setCreacionError("Debes seleccionar al menos un audio.");
      return;
    }
    setCreacionError("");
    setGenerando(true);

    try {
      const quizName = titulo.trim() || `Quiz de Estudio (${new Date().toLocaleDateString()})`;
      const nuevoQuiz = await crearQuiz(quizName, selectedAudios);
      
      // Cargar el quiz con preguntas inmediatamente
      setCargandoQuiz(true);
      const quizCompleto = await obtenerQuiz(nuevoQuiz.id);
      
      // Inicializar respuestas en blanco
      setQuizActivo(quizCompleto);
      setRespuestasUsuario(Array(quizCompleto.preguntas?.length || 0).fill(""));
      setIndicePregunta(0);
      setQuizFinalizado(false);
      setResultadoActual(null);
      
      // Limpiar formulario de creación
      setTitulo("");
      setSelectedAudios([]);
    } catch (err: any) {
      setCreacionError(err.message || "Error al generar el Quiz. Inténtalo de nuevo.");
    } finally {
      setGenerando(false);
      setCargandoQuiz(false);
    }
  };

  // Iniciar un quiz del historial
  const iniciarQuizHistorial = async (quizId: number) => {
    try {
      setCargandoQuiz(true);
      const quizCompleto = await obtenerQuiz(quizId);
      setQuizActivo(quizCompleto);
      
      if (quizCompleto.resultado.completado) {
        // Si ya está completado, mostrar pantalla de resultados directamente
        setQuizFinalizado(true);
        setResultadoActual({
          bien: quizCompleto.resultado.bien || 0,
          mal: quizCompleto.resultado.mal || 0,
        });
        setRespuestasUsuario(quizCompleto.resultado.respuestas_usuario || []);
      } else {
        // Si no está completado, empezar a responder
        setRespuestasUsuario(Array(quizCompleto.preguntas?.length || 0).fill(""));
        setIndicePregunta(0);
        setQuizFinalizado(false);
        setResultadoActual(null);
      }
    } catch (err: any) {
      alert("Error al cargar el quiz.");
    } finally {
      setCargandoQuiz(false);
    }
  };

  // Guardar respuesta seleccionada para la pregunta actual
  const seleccionarOpcion = (opcionLetra: string) => {
    const copia = [...respuestasUsuario];
    copia[indicePregunta] = opcionLetra;
    setRespuestasUsuario(copia);
  };

  // Avanzar a la siguiente pregunta o finalizar
  const siguientePregunta = async () => {
    if (!quizActivo || !quizActivo.preguntas) return;

    if (indicePregunta < quizActivo.preguntas.length - 1) {
      setIndicePregunta((prev) => prev + 1);
    } else {
      // Finalizar y calcular puntaje
      let correctas = 0;
      let incorrectas = 0;

      quizActivo.preguntas.forEach((preg, idx) => {
        const respuestaCorrecta = preg.correcta.trim().toUpperCase();
        const respuestaDada = respuestasUsuario[idx].trim().toUpperCase();
        if (respuestaDada === respuestaCorrecta) {
          correctas++;
        } else {
          incorrectas++;
        }
      });

      try {
        // Enviar resultados al backend
        await responderQuiz(quizActivo.id, correctas, incorrectas, respuestasUsuario);
        setResultadoActual({ bien: correctas, mal: incorrectas });
        setQuizFinalizado(true);
        
        // Recargar historial en segundo plano
        const dataHistorial = await listarHistorialQuizzes();
        setHistorial(dataHistorial);
      } catch (err) {
        alert("Error al guardar las respuestas del quiz.");
      }
    }
  };

  const salirDelQuiz = () => {
    setQuizActivo(null);
    setQuizFinalizado(false);
    setResultadoActual(null);
    cargarDatosIniciales();
  };

  // Renderizador de pantalla de carga del Quiz
  if (cargandoQuiz) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#f0f9ff]/40">
        <div className="w-12 h-12 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 mt-4 animate-pulse">Cargando cuestionario...</p>
      </div>
    );
  }

  // Renderizador de Quiz Activo (Tomar el examen o ver resultados)
  if (quizActivo && quizActivo.preguntas) {
    const preguntas = quizActivo.preguntas;

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f0f9ff]/40 p-6 flex flex-col items-center justify-center">
        {!quizFinalizado ? (
          /* PANTALLA DE RESOLUCIÓN */
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#e0f2fe] shadow-xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#e0f2fe] pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
                  Evaluación Activa
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-1">{quizActivo.titulo}</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Pregunta {indicePregunta + 1} de {preguntas.length}
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-[#f0f9ff] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0284c7] h-full transition-all duration-300"
                style={{ width: `${((indicePregunta + 1) / preguntas.length) * 100}%` }}
              ></div>
            </div>

            {/* Pregunta */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700">
                {preguntas[indicePregunta].pregunta}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {preguntas[indicePregunta].opciones.map((opcion, idx) => {
                  const letra = ["A", "B", "C", "D"][idx];
                  const esSeleccionado = respuestasUsuario[indicePregunta] === letra;

                  return (
                    <button
                      key={idx}
                      onClick={() => seleccionarOpcion(letra)}
                      className={`flex items-center space-x-4 p-4 rounded-2xl border text-left font-semibold transition-all ${
                        esSeleccionado
                          ? "border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] shadow-md shadow-sky-600/5"
                          : "border-[#e0f2fe] bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          esSeleccionado
                            ? "bg-[#0284c7] text-white"
                            : "bg-[#f0f9ff] text-slate-500"
                        }`}
                      >
                        {letra}
                      </span>
                      <span className="flex-1 text-sm">{opcion}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#e0f2fe]">
              <button
                onClick={salirDelQuiz}
                className="px-6 py-3 border border-[#e0f2fe] text-slate-500 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors"
              >
                Salir del Quiz
              </button>
              <button
                onClick={siguientePregunta}
                disabled={!respuestasUsuario[indicePregunta]}
                className={`px-8 py-3 bg-[#0284c7] text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/10 hover:bg-[#0369a1] transition-all ${
                  !respuestasUsuario[indicePregunta] ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {indicePregunta < preguntas.length - 1 ? "Siguiente Pregunta" : "Finalizar y Calificar"}
              </button>
            </div>
          </div>
        ) : (
          /* PANTALLA DE RESULTADOS */
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#e0f2fe] shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-5xl">🏆</span>
              <h2 className="text-2xl font-black text-slate-800">¡Quiz Completado!</h2>
              <p className="text-slate-400 text-sm">Resultados finales para: {quizActivo.titulo}</p>
            </div>

            {/* Marcador de Puntaje */}
            {resultadoActual && (
              <div className="grid grid-cols-2 gap-4 bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-6 text-center">
                <div>
                  <span className="block text-3xl font-extrabold text-green-600">
                    {resultadoActual.bien}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Correctas</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-red-500">
                    {resultadoActual.mal}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Incorrectas</span>
                </div>
              </div>
            )}

            {/* Detalle de Preguntas */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Revisión de Preguntas
              </h3>

              {preguntas.map((preg, idx) => {
                const respDada = respuestasUsuario[idx];
                const respCorr = preg.correcta;
                const esCorrecto = respDada === respCorr;

                return (
                  <div key={preg.id} className="border border-[#e0f2fe] rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-700 leading-snug">
                        {preg.indice}. {preg.pregunta}
                      </h4>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          esCorrecto ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {esCorrecto ? "Correcta" : "Incorrecta"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pl-4">
                      {preg.opciones.map((opc, oIdx) => {
                        const letra = ["A", "B", "C", "D"][oIdx];
                        const esRespDada = respDada === letra;
                        const esRespCorr = respCorr === letra;

                        let claseBoton = "border-[#e0f2fe] text-slate-500 bg-white";
                        if (esRespCorr) {
                          claseBoton = "border-green-500 bg-green-50 text-green-700";
                        } else if (esRespDada && !esCorrecto) {
                          claseBoton = "border-red-400 bg-red-50 text-red-600";
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs font-semibold ${claseBoton}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
                                esRespCorr
                                  ? "bg-green-500 text-white"
                                  : esRespDada
                                  ? "bg-red-500 text-white"
                                  : "bg-[#f0f9ff] text-slate-400"
                              }`}
                            >
                              {letra}
                            </span>
                            <span className="flex-1">{opc}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explicación RAG */}
                    <div className="bg-[#f0f9ff] border-l-4 border-[#0284c7] p-3 rounded-r-xl text-[11px] text-slate-600 leading-relaxed">
                      <strong>Explicación:</strong> {preg.explicacion}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={salirDelQuiz}
              className="w-full bg-[#0284c7] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg hover:bg-[#0369a1] transition-colors"
            >
              Volver a Quizzes
            </button>
          </div>
        )}
      </div>
    );
  }

  // PANTALLA PRINCIPAL: HISTORIAL Y CREADOR
  return (
    <div className="flex h-[calc(100vh-2rem)] bg-[#f0f9ff]/40 p-4 font-sans gap-4">
      {/* Creador de Quiz (Izquierda) */}
      <div className="w-96 bg-white rounded-3xl border border-[#e0f2fe] shadow-xl p-6 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleCrearQuiz} className="space-y-6 flex-1">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
              RAG & Evaluación
            </span>
            <h1 className="text-2xl font-black text-slate-800 mt-2 leading-tight">
              Generador de Quizzes
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Crea exámenes personalizados seleccionando temas y audios específicos de tus proyectos.
            </p>
          </div>

          {/* Nombre del Quiz */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Nombre del Quiz
            </label>
            <input
              type="text"
              placeholder="Ej. Redes y Servidores"
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
                <span>Creando con RAG...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generar Quiz de Estudio</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historial de Quizzes (Derecha) */}
      <div className="flex-1 bg-white rounded-3xl border border-[#e0f2fe] shadow-xl p-6 flex flex-col overflow-hidden">
        <div className="border-b border-[#e0f2fe] pb-4 mb-4">
          <h2 className="text-lg font-black text-slate-800">Historial de Evaluaciones</h2>
          <p className="text-xs text-slate-400 mt-1">
            Consulta los exámenes que has generado anteriormente y revisa tus calificaciones.
          </p>
        </div>

        {loadingHistorial ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-3 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
            <span className="text-4xl mb-3">📝</span>
            <h3 className="text-sm font-bold text-slate-800">No has generado quizzes aún</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Usa el panel de la izquierda para seleccionar audios y crear tu primera evaluación interactiva.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {historial.map((item) => {
              const compl = item.resultado.completado;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border border-[#e0f2fe] rounded-2xl p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-700 leading-snug">{item.titulo}</h3>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold">
                      <span>📅 {item.creado_en ? new Date(item.creado_en).toLocaleDateString() : ""}</span>
                      <span>•</span>
                      <span>❓ {item.total_preguntas} Preguntas</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {compl ? (
                      <div className="text-right">
                        <span className="block text-sm font-black text-green-600">
                          {item.resultado.bien} / {item.total_preguntas}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Aciertos</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
                        Pendiente
                      </span>
                    )}

                    <button
                      onClick={() => iniciarQuizHistorial(item.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                        compl
                          ? "border-[#e0f2fe] text-[#0284c7] hover:bg-[#f0f9ff]/40"
                          : "border-[#0284c7] bg-[#0284c7] text-white shadow-md hover:bg-[#0369a1]"
                      }`}
                    >
                      {compl ? "Revisar" : "Responder"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
