import { API_URL } from "./api";
import { getToken } from "./auth_service";

const AUDIO_URL = `${API_URL}/audios`;

export interface Audio {
  id: number;
  id_proyecto: number;
  titulo: string;
  url_audio: string;
  estado_procesamiento: string;
  mensaje_error?: string | null;
  creado_en: string;
}

function getAuthHeaders() {
  const token = getToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function subirAudio(
  proyectoId: number,
  titulo: string,
  file: File
) {
  try {
    const formData = new FormData();

    formData.append("titulo", titulo);
    formData.append("file", file);

    const res = await fetch(`${AUDIO_URL}/proyecto/${proyectoId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Audio;
  } catch (error: any) {
    console.error("Error al subir audio:", error);

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

export async function listarAudios(proyectoId: number) {
  try {
    const res = await fetch(`${AUDIO_URL}/proyecto/${proyectoId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Audio[];
  } catch (error: any) {
    console.error("Error al listar audios:", error);

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

export async function eliminarAudio(audioId: number) {
  try {
    const res = await fetch(`${AUDIO_URL}/${audioId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error al eliminar audio:", error);

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