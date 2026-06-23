import { API_URL } from "./api";
import { getToken } from "./auth_service";

const GRAFO_URL = `${API_URL}/grafos`;

export type NivelDetalleGrafo = "BASICO" | "MEDIO" | "AVANZADO";

export type TipoNodoGrafo =
  | "TEMA"
  | "SUBTEMA"
  | "CONCEPTO"
  | "PERSONA"
  | "TAREA"
  | "DECISION"
  | "RECURSO";

export interface NodoGrafo {
  id: string;
  label: string;
  tipo: TipoNodoGrafo;
  importancia: number;
  descripcion?: string;
  audio_origen?: string;
}

export interface RelacionGrafo {
  id: string;
  source: string;
  target: string;
  label: string;
  tipo: string;
  peso: number;
}

export interface ContenidoGrafo {
  titulo: string;
  descripcion?: string;
  nodos: NodoGrafo[];
  relaciones: RelacionGrafo[];
  insights?: string[];
  recomendaciones?: string[];
}

export interface Grafo {
  id: number;
  id_proyecto: number;
  id_usuario: number;
  id_solicitud?: number | null;

  titulo?: string | null;
  descripcion?: string | null;

  contenido: ContenidoGrafo;
  modelo_usado?: string | null;

  cantidad_nodos: number;
  cantidad_relaciones: number;

  creado_en: string;
}
function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generarGrafoProyecto(
  proyectoId: number,
  nivelDetalle: NivelDetalleGrafo
) {
  try {
    const res = await fetch(`${GRAFO_URL}/proyecto/${proyectoId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        nivel_detalle: nivelDetalle,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Grafo;
  } catch (error: any) {
    console.error("Error al generar grafo:", error);

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

export async function obtenerUltimoGrafoProyecto(proyectoId: number) {
  try {
    const res = await fetch(`${GRAFO_URL}/proyecto/${proyectoId}/ultimo`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Grafo;
  } catch (error: any) {
    console.error("Error al obtener último grafo:", error);

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

export async function listarGrafosProyecto(proyectoId: number) {
  try {
    const res = await fetch(`${GRAFO_URL}/proyecto/${proyectoId}/historial`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Grafo[];
  } catch (error: any) {
    console.error("Error al listar grafos:", error);

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

export async function obtenerGrafoPorId(grafoId: number) {
  try {
    const res = await fetch(`${GRAFO_URL}/${grafoId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Grafo;
  } catch (error: any) {
    console.error("Error al obtener grafo:", error);

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

export async function eliminarGrafo(grafoId: number) {
  try {
    const res = await fetch(`${GRAFO_URL}/${grafoId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error al eliminar grafo:", error);

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

export interface NodoAudioGrafo {
  id: string;
  label: string;
  proyecto: string;
}

export interface RelacionAudioGrafo {
  id: string;
  source: string;
  target: string;
  similarity: number;
}

export interface GrafoAudiosData {
  nodes: NodoAudioGrafo[];
  edges: RelacionAudioGrafo[];
}

export async function obtenerGrafoAudiosComparar(): Promise<GrafoAudiosData> {
  try {
    const res = await fetch(`${GRAFO_URL}/audios/comparar`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as GrafoAudiosData;
  } catch (error: any) {
    console.error("Error al obtener comparación de audios:", error);
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