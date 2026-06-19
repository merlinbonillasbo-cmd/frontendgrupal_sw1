const BASE_URL = "http://127.0.0.1:8000/api";

export interface Audio {
  id: number;
  id_proyecto: number;
  titulo: string;
  url_audio: string;
  estado_procesamiento: string;
  mensaje_error?: string;
  creado_en: string;
}

// 1. OBTENER AUDIOS DE UN PROYECTO
export async function obtenerAudios(proyectoId: number) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/proyecto/${proyectoId}/audio/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as Audio[];
  } catch (error: any) {
    console.error("Error al obtener audios:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 2. SUBIR AUDIO A UN PROYECTO
export async function subirAudio(proyectoId: number, titulo: string, archivo: File) {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("file", archivo);

    const res = await fetch(`${BASE_URL}/proyecto/${proyectoId}/audio/`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as Audio;
  } catch (error: any) {
    console.error("Error al subir audio:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 3. ELIMINAR AUDIO
export async function eliminarAudio(audioId: number) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/audio/${audioId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as { mensaje: string };
  } catch (error: any) {
    console.error("Error al eliminar audio:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}
