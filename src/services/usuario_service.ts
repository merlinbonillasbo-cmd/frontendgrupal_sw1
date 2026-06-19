import { API_URL } from "./api";
import { getToken } from "./auth_service";

const USUARIO_URL = `${API_URL}/usuario`;

export interface Usuario {
  id: number;
  nombre_completo: string;
  correo: string;
  rol: string;
  estado: boolean;
}

// VER PERFIL
export async function verPerfil() {
  try {
    const token = getToken();

    const res = await fetch(`${USUARIO_URL}/perfil`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Usuario;
  } catch (error: any) {
    console.error("Error al obtener perfil:", error);

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

// EDITAR PERFIL
export async function editarPerfil(nombre_completo: string) {
  try {
    const token = getToken();

    const res = await fetch(`${USUARIO_URL}/perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ nombre_completo }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Usuario;
  } catch (error: any) {
    console.error("Error al editar perfil:", error);

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