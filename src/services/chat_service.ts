import { API_URL } from "./api";
import { getToken } from "./auth_service";

const CHAT_URL = `${API_URL}/chat`;

export interface ChatConversacion {
  id: number;
  id_usuario: number;
  id_proyecto?: number | null;
  titulo?: string | null;
  creado_en: string;
}

export interface ChatMensaje {
  id: number;
  id_conversacion: number;
  rol: "USUARIO" | "IA";
  contenido: string;
  creado_en: string;
}

export interface ChatRespuesta {
  conversacion: ChatConversacion;
  pregunta: ChatMensaje;
  respuesta: ChatMensaje;
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


export async function preguntarProyecto(
  proyectoId: number,
  pregunta: string,
  idConversacion?: number | null
) {
  try {
    const res = await fetch(`${CHAT_URL}/proyecto/${proyectoId}/preguntar`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        pregunta,
        id_conversacion: idConversacion || null,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as ChatRespuesta;
  } catch (error: any) {
    console.error("Error al preguntar sobre el proyecto:", error);

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


export async function listarConversacionesProyecto(proyectoId: number) {
  try {
    const res = await fetch(`${CHAT_URL}/proyecto/${proyectoId}/conversaciones`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as ChatConversacion[];
  } catch (error: any) {
    console.error("Error al listar conversaciones:", error);

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


export async function listarMensajesConversacion(conversacionId: number) {
  try {
    const res = await fetch(`${CHAT_URL}/conversacion/${conversacionId}/mensajes`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as ChatMensaje[];
  } catch (error: any) {
    console.error("Error al listar mensajes:", error);

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


export async function eliminarConversacion(conversacionId: number) {
  try {
    const res = await fetch(`${CHAT_URL}/conversacion/${conversacionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error al eliminar conversación:", error);

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