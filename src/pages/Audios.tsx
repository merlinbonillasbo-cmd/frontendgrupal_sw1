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
        if (estado === "COMPLETADO") return "text-green-400 bg-green-500/10 border-green-500/30";
        if (estado === "PROCESANDO") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
        if (estado === "ERROR") return "text-red-400 bg-red-500/10 border-red-500/30";

        return "text-slate-300 bg-slate-800 border-slate-700";
    }

    return (
        <section className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/proyectos")}
                        className="mb-4 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        ← Volver a proyectos
                    </button>

                    <p className="text-sm text-primario font-semibold uppercase tracking-wide">
                        Gestión de audios
                    </p>

                    <h1 className="text-3xl font-bold mt-2">Audios del proyecto</h1>
                    <div className="mt-5 flex flex-col md:flex-row gap-3 md:items-center">
                        <select
                            value={tipoResumen}
                            onChange={(e) => setTipoResumen(e.target.value as TipoResumen)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-primario"
                        >
                            <option value="CORTO">Resumen corto</option>
                            <option value="MEDIO">Resumen medio</option>
                            <option value="DETALLADO">Resumen detallado</option>
                        </select>

                        <button
                            onClick={resumirProyecto}
                            disabled={generandoResumen}
                            className="bg-primario hover:bg-primario/90 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                            {generandoResumen ? "Generando..." : "Generar resumen del proyecto"}
                        </button>
                        <button
                            onClick={verResumenProyecto}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                            Ver resumen del proyecto
                        </button>

                        <button
                            onClick={() => navigate(`/proyectos/${idProyecto}/resumenes`)}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                            Ver historial de resúmenes
                        </button>

                        <button
                            onClick={() => navigate(`/proyectos/${idProyecto}/chat`)}
                            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                            Chat con audios
                        </button>

                        <button
                            onClick={() => navigate(`/proyectos/${idProyecto}/grafo`)}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold px-5 py-3 rounded-lg transition-colors"
                        >
                            Grafo de conceptos
                        </button>
                    </div>

                    <p className="text-slate-400 mt-2">
                        Sube, organiza y administra los archivos de audio asociados a este proyecto.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Subir audio</h2>

                            <form onSubmit={guardarAudio} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Título del audio
                                    </label>

                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        required
                                        minLength={2}
                                        placeholder="Ej: Clase 1 - Introducción"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primario focus:ring-1 focus:ring-primario"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Archivo de audio
                                    </label>

                                    <input
                                        id="audio-file"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primario file:text-white hover:file:bg-primario/90"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={subiendo}
                                    className="w-full bg-primario hover:bg-primario/90 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    {subiendo ? "Subiendo..." : "Subir audio"}
                                </button>
                            </form>

                            {mensaje && (
                                <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                                    {mensaje}
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Lista de audios</h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Total: {audios.length}
                                    </p>
                                </div>

                                <button
                                    onClick={cargarAudios}
                                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                                >
                                    Actualizar
                                </button>
                            </div>

                            {cargando ? (
                                <div className="text-slate-400 py-10 text-center">
                                    Cargando audios...
                                </div>
                            ) : audios.length === 0 ? (
                                <div className="border border-dashed border-slate-700 rounded-xl p-10 text-center">
                                    <div className="text-5xl mb-4">🎧</div>
                                    <h3 className="text-lg font-semibold text-slate-200">
                                        No hay audios en este proyecto
                                    </h3>
                                    <p className="text-slate-400 mt-2">
                                        Sube tu primer audio para iniciar el procesamiento.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {audios.map((audio) => (
                                        <div
                                            key={audio.id}
                                            className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-primario/60 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {audio.titulo}
                                                    </h3>

                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Subido: {new Date(audio.creado_en).toLocaleString()}
                                                    </p>

                                                    <p className="text-xs text-slate-500 mt-1 break-all">
                                                        Ruta: {audio.url_audio}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full border ${estadoColor(
                                                        audio.estado_procesamiento
                                                    )}`}
                                                >
                                                    {audio.estado_procesamiento}
                                                </span>
                                            </div>

                                            {audio.mensaje_error && (
                                                <p className="mt-3 text-sm text-red-400">
                                                    {audio.mensaje_error}
                                                </p>
                                            )}

                                            <div className="flex gap-2 mt-5">
                                                <button
                                                    onClick={() => transcribir(audio.id)}
                                                    disabled={procesandoAudioId === audio.id}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-primario hover:bg-primario/90 disabled:opacity-60 text-sm text-white transition-colors"
                                                >
                                                    {procesandoAudioId === audio.id ? "Transcribiendo..." : "Transcribir"}
                                                </button>

                                                <button
                                                    onClick={() => verTranscripcion(audio.id)}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                                                >
                                                    Ver texto
                                                </button>

                                                <button
                                                    onClick={() => resumirAudio(audio.id)}
                                                    disabled={generandoResumen || audio.estado_procesamiento !== "COMPLETADO"}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50 text-sm text-green-400 transition-colors"
                                                >
                                                    Resumen
                                                </button>

                                                <button
                                                    onClick={() => verResumenAudio(audio.id)}
                                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                                                >
                                                    Ver resumen
                                                </button>

                                                <button
                                                    onClick={() => borrarAudio(audio.id)}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {transcripcionSeleccionada && (
                                <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                Transcripción generada
                                            </h3>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Modelo: {transcripcionSeleccionada.modelo_usado || "No especificado"} ·{" "}
                                                Palabras: {transcripcionSeleccionada.cantidad_palabras || 0}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setTranscripcionSeleccionada(null)}
                                            className="text-sm text-slate-400 hover:text-white"
                                        >
                                            Cerrar
                                        </button>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                                        {transcripcionSeleccionada.texto_generado}
                                    </div>
                                </div>
                            )}
                            {resumenSeleccionado && (
                                <div className="mt-6 bg-slate-950 border border-green-500/30 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {resumenSeleccionado.titulo || "Resumen generado"}
                                            </h3>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Tipo: {resumenSeleccionado.tipo_resumen} ·{" "}
                                                Modelo: {resumenSeleccionado.contenido?.modelo_usado || "No especificado"}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setResumenSeleccionado(null)}
                                            className="text-sm text-slate-400 hover:text-white"
                                        >
                                            Cerrar
                                        </button>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
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