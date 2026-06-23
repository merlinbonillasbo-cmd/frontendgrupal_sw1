import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    eliminarAudio,
    listarAudios,
    subirAudio,
} from "../services/audio_service";
import {
    generarTranscripcion,
    obtenerTranscripcion,
} from "../services/transcripcion_service";

import type { Transcripcion } from "../services/transcripcion_service";
import type { Audio } from "../services/audio_service";

import {
    generarResumenAudio,
    generarResumenProyecto,
    obtenerResumenAudio,
    obtenerResumenProyecto,
} from "../services/resumen_service";

import type { Resumen, TipoResumen } from "../services/resumen_service";

export default function Audios() {
    const { proyectoId } = useParams();
    const navigate = useNavigate();

    const [audios, setAudios] = useState<Audio[]>([]);
    const [titulo, setTitulo] = useState("");
    const [archivo, setArchivo] = useState<File | null>(null);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const [transcripcionSeleccionada, setTranscripcionSeleccionada] =
        useState<Transcripcion | null>(null);

    const [procesandoAudioId, setProcesandoAudioId] = useState<number | null>(null);

    const [tipoResumen, setTipoResumen] = useState<TipoResumen>("MEDIO");
    const [resumenSeleccionado, setResumenSeleccionado] = useState<Resumen | null>(null);
    const [generandoResumen, setGenerandoResumen] = useState(false);

    const idProyecto = Number(proyectoId);

    async function cargarAudios() {
        try {
            setCargando(true);
            setError("");

            const data = await listarAudios(idProyecto);
            setAudios(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al cargar audios");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        if (!idProyecto) {
            navigate("/proyectos");
            return;
        }

        cargarAudios();
    }, [idProyecto]);

    async function guardarAudio(e: React.FormEvent) {
        e.preventDefault();

        if (!archivo) {
            setError("Debes seleccionar un archivo de audio");
            return;
        }

        try {
            setSubiendo(true);
            setError("");
            setMensaje("");

            await subirAudio(idProyecto, titulo, archivo);

            setTitulo("");
            setArchivo(null);
            setMensaje("Audio subido correctamente");

            const input = document.getElementById("audio-file") as HTMLInputElement;
            if (input) input.value = "";

            await cargarAudios();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al subir audio");
        } finally {
            setSubiendo(false);
        }
    }

    async function transcribir(audioId: number) {
        try {
            setProcesandoAudioId(audioId);
            setError("");
            setMensaje("");
            setTranscripcionSeleccionada(null);

            const data = await generarTranscripcion(audioId);

            setTranscripcionSeleccionada(data);
            setMensaje("Transcripción generada correctamente");

            await cargarAudios();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al generar transcripción");
            await cargarAudios();
        } finally {
            setProcesandoAudioId(null);
        }
    }

    async function verTranscripcion(audioId: number) {
        try {
            setError("");
            setMensaje("");

            const data = await obtenerTranscripcion(audioId);

            setTranscripcionSeleccionada(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "No existe transcripción para este audio");
        }
    }

    async function resumirAudio(audioId: number) {
        try {
            setGenerandoResumen(true);
            setError("");
            setMensaje("");
            setResumenSeleccionado(null);

            const data = await generarResumenAudio(audioId, tipoResumen);

            setResumenSeleccionado(data);
            setMensaje("Resumen del audio generado correctamente");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al generar resumen del audio");
        } finally {
            setGenerandoResumen(false);
        }
    }

    async function resumirProyecto() {
        try {
            setGenerandoResumen(true);
            setError("");
            setMensaje("");
            setResumenSeleccionado(null);

            const data = await generarResumenProyecto(idProyecto, tipoResumen);

            setResumenSeleccionado(data);
            setMensaje("Resumen del proyecto generado correctamente");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al generar resumen del proyecto");
        } finally {
            setGenerandoResumen(false);
        }
    }

    async function verResumenAudio(audioId: number) {
        try {
            setError("");
            setMensaje("");
            setResumenSeleccionado(null);

            const data = await obtenerResumenAudio(audioId);

            setResumenSeleccionado(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "No existe resumen para este audio");
        }
    }

    async function verResumenProyecto() {
        try {
            setError("");
            setMensaje("");
            setResumenSeleccionado(null);

            const data = await obtenerResumenProyecto(idProyecto);

            setResumenSeleccionado(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "No existe resumen para este proyecto");
        }
    }

    async function borrarAudio(id: number) {
        const confirmar = confirm("¿Seguro que deseas eliminar este audio?");
        if (!confirmar) return;

        try {
            setError("");
            setMensaje("");

            await eliminarAudio(id);
            setMensaje("Audio eliminado correctamente");
            await cargarAudios();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al eliminar audio");
        }
    }

    function estadoColor(estado: string) {
        if (estado === "COMPLETADO") return "text-emerald-700 bg-emerald-50 border-emerald-100";
        if (estado === "PROCESANDO") return "text-amber-700 bg-amber-50 border-amber-100";
        if (estado === "ERROR") return "text-red-700 bg-red-50 border-red-100";

        return "text-slate-600 bg-slate-100 border-slate-200";
    }

    return (
        <section className="min-h-screen text-slate-800 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/proyectos")}
                        className="mb-4 text-sm font-semibold text-slate-500 hover:text-[#0284c7] transition-all"
                    >
                        ← Volver a proyectos
                    </button>

                    <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wide">
                        Gestión de audios
                    </p>

                    <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Audios del proyecto</h1>
                    
                    <div className="mt-5 flex flex-wrap gap-3 items-center">
                        <select
                            value={tipoResumen}
                            onChange={(e) => setTipoResumen(e.target.value as TipoResumen)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all"
                        >
                            <option value="CORTO">Resumen corto</option>
                            <option value="MEDIO">Resumen medio</option>
                            <option value="DETALLADO">Resumen detallado</option>
                        </select>

                        <button
                            onClick={resumirProyecto}
                            disabled={generandoResumen}
                            className="bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-sky-600/10"
                        >
                            {generandoResumen ? "Generando..." : "Generar resumen del proyecto"}
                        </button>


                    </div>

                    <p className="text-slate-500 text-sm mt-3">
                        Sube, organiza y administra los archivos de audio asociados a este proyecto.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario de Carga */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-[#e0f2fe] rounded-2xl p-6 shadow-xl shadow-sky-100/50">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Subir audio</h2>

                            <form onSubmit={guardarAudio} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                                        Título del audio
                                    </label>

                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        required
                                        minLength={2}
                                        placeholder="Ej: Clase 1 - Introducción"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                                        Archivo de audio
                                    </label>

                                    <input
                                        id="audio-file"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284c7] file:text-white hover:file:bg-[#0369a1] file:cursor-pointer transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={subiendo}
                                    className="w-full bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-sky-600/10 text-sm"
                                >
                                    {subiendo ? "Subiendo..." : "Subir audio"}
                                </button>
                            </form>

                            {mensaje && (
                                <div className="mt-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-medium">
                                    {mensaje}
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lista de Audios */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-[#e0f2fe] rounded-2xl p-6 shadow-xl shadow-sky-100/50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Lista de audios</h2>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        Total: {audios.length}
                                    </p>
                                </div>

                                <button
                                    onClick={cargarAudios}
                                    className="px-4 py-2 rounded-xl bg-white border border-[#e0f2fe] hover:bg-[#e0f2fe]/30 text-xs font-bold text-slate-700 transition-all"
                                >
                                    Actualizar
                                </button>
                            </div>

                            {cargando ? (
                                <div className="text-slate-400 py-10 text-center text-sm animate-pulse">
                                    Cargando audios...
                                </div>
                            ) : audios.length === 0 ? (
                                <div className="border border-dashed border-[#e0f2fe] bg-[#f0f9ff]/50 rounded-2xl p-10 text-center">
                                    <div className="text-5xl mb-4">🎧</div>
                                    <h3 className="text-lg font-bold text-slate-700">
                                        No hay audios en este proyecto
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-2">
                                        Sube tu primer audio para iniciar el procesamiento.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {audios.map((audio) => (
                                        <div
                                            key={audio.id}
                                            className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-5 hover:border-[#0284c7]/50 transition-all hover:scale-[1.01]"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-slate-800">
                                                        {audio.titulo}
                                                    </h3>

                                                    <p className="text-[10px] font-semibold text-slate-400 mt-2">
                                                        Subido: {new Date(audio.creado_en).toLocaleString()}
                                                    </p>

                                                    <p className="text-[10px] text-slate-400 mt-1 break-all">
                                                        Ruta: {audio.url_audio}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full border font-semibold ${estadoColor(
                                                        audio.estado_procesamiento
                                                    )}`}
                                                >
                                                    {audio.estado_procesamiento}
                                                </span>
                                            </div>

                                            {audio.mensaje_error && (
                                                <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                                                    {audio.mensaje_error}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-5">
                                                <button
                                                    onClick={() => transcribir(audio.id)}
                                                    disabled={procesandoAudioId === audio.id}
                                                    className="flex-1 min-w-[90px] px-3 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 text-xs font-bold text-white transition-all shadow-md shadow-sky-600/10"
                                                >
                                                    {procesandoAudioId === audio.id ? "Transcribiendo..." : "Transcribir"}
                                                </button>

                                                <button
                                                    onClick={() => verTranscripcion(audio.id)}
                                                    className="flex-1 min-w-[90px] px-3 py-2 rounded-xl bg-white border border-[#e0f2fe] hover:bg-[#e0f2fe]/30 text-xs font-bold text-slate-700 transition-all"
                                                >
                                                    Ver texto
                                                </button>

                                                <button
                                                    onClick={() => resumirAudio(audio.id)}
                                                    disabled={generandoResumen || audio.estado_procesamiento !== "COMPLETADO"}
                                                    className="flex-1 min-w-[90px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/50 disabled:opacity-50 text-xs font-bold text-emerald-700 border border-emerald-100 transition-all"
                                                >
                                                    Resumen
                                                </button>

                                                <button
                                                    onClick={() => verResumenAudio(audio.id)}
                                                    className="flex-1 min-w-[90px] px-3 py-2 rounded-xl bg-white border border-[#e0f2fe] hover:bg-[#e0f2fe]/30 text-xs font-bold text-slate-700 transition-all"
                                                >
                                                    Ver resumen
                                                </button>

                                                <button
                                                    onClick={() => borrarAudio(audio.id)}
                                                    className="flex-1 min-w-[90px] px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100/50 text-xs font-bold text-red-600 border border-red-100 transition-all"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Mostrar Transcripción Seleccionada */}
                            {transcripcionSeleccionada && (
                                <div className="mt-6 bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-5 shadow-inner">
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e0f2fe]">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                Transcripción generada
                                            </h3>

                                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                                Modelo: {transcripcionSeleccionada.modelo_usado || "No especificado"} ·{" "}
                                                Palabras: {transcripcionSeleccionada.cantidad_palabras || 0}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setTranscripcionSeleccionada(null)}
                                            className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-white border border-[#e0f2fe] rounded-xl p-4">
                                        {transcripcionSeleccionada.texto_generado}
                                    </div>
                                </div>
                            )}

                            {/* Mostrar Resumen Seleccionado */}
                            {resumenSeleccionado && (
                                <div className="mt-6 bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-5 shadow-inner">
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e0f2fe]">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">
                                                {resumenSeleccionado.titulo || "Resumen generado"}
                                            </h3>

                                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                                Tipo: {resumenSeleccionado.tipo_resumen} ·{" "}
                                                Modelo: {resumenSeleccionado.contenido?.modelo_usado || "No especificado"}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setResumenSeleccionado(null)}
                                            className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-white border border-[#e0f2fe] rounded-xl p-4">
                                        {resumenSeleccionado.contenido?.texto}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}