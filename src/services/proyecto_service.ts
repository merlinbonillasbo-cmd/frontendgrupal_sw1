import { API_URL } from "./api";
import { getToken } from "./auth_service";

const PROYECTO_URL = `${API_URL}/proyectos`;

export interface Proyecto {
  id: number;
  id_usuario: number;
  nombre: string;
  descripcion?: string | null;
  creado_en: string;
}

export interface ProyectoCreate {
  nombre: string;
  descripcion?: string;
}

export interface ProyectoUpdate {
  nombre?: string;
  descripcion?: string;
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function crearProyecto(data: ProyectoCreate) {
  try {
    const res = await fetch(`${PROYECTO_URL}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Proyecto;
  } catch (error: any) {
    console.error("Error al crear proyecto:", error);

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

export async function listarProyectos() {
  try {
    const res = await fetch(`${PROYECTO_URL}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Proyecto[];
  } catch (error: any) {
    console.error("Error al listar proyectos:", error);

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

export async function obtenerProyecto(id: number) {
  try {
    const res = await fetch(`${PROYECTO_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Proyecto;
  } catch (error: any) {
    console.error("Error al obtener proyecto:", error);

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

export async function editarProyecto(id: number, data: ProyectoUpdate) {
  try {
    const res = await fetch(`${PROYECTO_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Proyecto;
  } catch (error: any) {
    console.error("Error al editar proyecto:", error);

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

export async function eliminarProyecto(id: number) {
  try {
    const res = await fetch(`${PROYECTO_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error al eliminar proyecto:", error);

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