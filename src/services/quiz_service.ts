import { API_URL } from "./api";
import { getToken } from "./auth_service";

const QUIZ_URL = `${API_URL}/quizzes`;

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AudioDisponible {
  id: number;
  titulo: string;
  proyecto: string;
  creado_en: string | null;
}

export interface PreguntaQuiz {
  id: number;
  indice: number;
  pregunta: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
}

export interface ResultadoQuiz {
  completado: boolean;
  bien?: number;
  mal?: number;
  respuestas_usuario?: string[];
  fecha_resolucion?: string;
}

export interface Quiz {
  id: number;
  titulo: string;
  total_preguntas: number;
  creado_en: string | null;
  resultado: ResultadoQuiz;
  preguntas?: PreguntaQuiz[];
}

export async function listarAudiosDisponibles(): Promise<AudioDisponible[]> {
  const res = await fetch(`${QUIZ_URL}/audios`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al obtener audios disponibles");
  }
  return res.json();
}

export async function crearQuiz(titulo: string, audioIds: number[]): Promise<Quiz> {
  const res = await fetch(QUIZ_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, audio_ids: audioIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al generar el Quiz");
  }
  return res.json();
}

export async function obtenerQuiz(quizId: number): Promise<Quiz> {
  const res = await fetch(`${QUIZ_URL}/${quizId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al obtener el Quiz");
  }
  return res.json();
}

export async function responderQuiz(
  quizId: number,
  bien: number,
  mal: number,
  respuestasUsuario: string[]
): Promise<ResultadoQuiz> {
  const res = await fetch(`${QUIZ_URL}/${quizId}/responder`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bien, mal, respuestas_usuario: respuestasUsuario }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al guardar los resultados");
  }
  return res.json();
}

export async function listarHistorialQuizzes(): Promise<Quiz[]> {
  const res = await fetch(`${QUIZ_URL}/historial/lista`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al obtener historial de quizzes");
  }
  return res.json();
}
