import { API_URL } from "./api";
import { getToken } from "./auth_service";

const RESUMEN_URL = `${API_URL}/resumenes`;

export type TipoResumen = "CORTO" | "MEDIO" | "DETALLADO";

export interface Resumen {
  id: number;
  id_solicitud: number;
  titulo?: string | null;
  tipo_resumen: TipoResumen;
  contenido?: {
    texto?: string;
    audios_usados?: number[];
    modelo_usado?: string;
  };
  creado_en: string;
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function generarResumenAudio(
  audioId: number,
  tipoResumen: TipoResumen
) {
  try {
    const res = await fetch(`${RESUMEN_URL}/audio/${audioId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ tipo_resumen: tipoResumen }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al generar resumen del audio:", error);

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

export async function generarResumenProyecto(
  proyectoId: number,
  tipoResumen: TipoResumen
) {
  try {
    const res = await fetch(`${RESUMEN_URL}/proyecto/${proyectoId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ tipo_resumen: tipoResumen }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al generar resumen del proyecto:", error);

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

export async function obtenerResumenAudio(audioId: number) {
  try {
    const res = await fetch(`${RESUMEN_URL}/audio/${audioId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al obtener resumen del audio:", error);

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


export async function obtenerResumenProyecto(proyectoId: number) {
  try {
    const res = await fetch(`${RESUMEN_URL}/proyecto/${proyectoId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al obtener resumen del proyecto:", error);

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

export async function listarResumenesProyecto(proyectoId: number) {
  try {
    const res = await fetch(`${RESUMEN_URL}/proyecto/${proyectoId}/historial`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen[];
  } catch (error: any) {
    console.error("Error al listar resúmenes del proyecto:", error);

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


export async function listarResumenesAudio(audioId: number) {
  try {
    const res = await fetch(`${RESUMEN_URL}/audio/${audioId}/historial`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen[];
  } catch (error: any) {
    console.error("Error al listar resúmenes del audio:", error);

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


export async function obtenerResumenPorId(resumenId: number) {
  try {
    const res = await fetch(`${RESUMEN_URL}/${resumenId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al obtener resumen:", error);

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


export async function descargarResumen(
  resumenId: number,
  formato: "txt" | "pdf" | "docx"
) {
  try {
    const token = getToken();

    const res = await fetch(
      `${RESUMEN_URL}/${resumenId}/descargar?formato=${formato}`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `resumen_${resumenId}.${formato}`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Error al descargar resumen:", error);

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

export async function generarResumenSeleccion(
  titulo: string,
  audioIds: number[],
  tipoResumen: TipoResumen
) {
  try {
    const res = await fetch(`${RESUMEN_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        titulo,
        audio_ids: audioIds,
        tipo_resumen: tipoResumen,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al generar resumen de selección:", error);

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

export async function listarHistorialResumenesUsuario(): Promise<Resumen[]> {
  try {
    const res = await fetch(RESUMEN_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen[];
  } catch (error: any) {
    console.error("Error al obtener historial de resúmenes del usuario:", error);

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

export async function guardarResumenManual(
  titulo: string,
  texto: string,
  audioIds?: number[]
): Promise<Resumen> {
  try {
    const res = await fetch(`${RESUMEN_URL}/manual`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        titulo,
        texto,
        tipo_resumen: "MEDIO",
        audio_ids: audioIds || [],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Resumen;
  } catch (error: any) {
    console.error("Error al guardar resumen manual:", error);

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