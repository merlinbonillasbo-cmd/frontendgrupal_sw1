import { API_URL } from "./api";
import { getToken } from "./auth_service";

const TRANSCRIPCION_URL = `${API_URL}/transcripciones`;

export interface Transcripcion {
  id: number;
  id_audio: number;
  modelo_usado?: string | null;
  cantidad_palabras?: number | null;
  texto_generado?: string | null;
  fecha_creado: string;
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generarTranscripcion(audioId: number) {
  try {
    const res = await fetch(`${TRANSCRIPCION_URL}/audio/${audioId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Transcripcion;
  } catch (error: any) {
    console.error("Error al generar transcripción:", error);

    if (!error.response) {
      throw {
        response: {
          data: {
            detail: error.message || "Error de conexión",
          },
        },
      };
    }

    throw error;
  }
}

export async function obtenerTranscripcion(audioId: number) {
  try {
    const res = await fetch(`${TRANSCRIPCION_URL}/audio/${audioId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Transcripcion;
  } catch (error: any) {
    console.error("Error al obtener transcripción:", error);

    if (!error.response) {
      throw {
        response: {
          data: {
            detail: error.message || "Error de conexión",
          },
        },
      };
    }

    throw error;
  }
}