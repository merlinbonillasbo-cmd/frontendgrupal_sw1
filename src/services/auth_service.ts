import { API_URL } from "./api";

const AUTH_URL = `${API_URL}/auth`;

export interface Usuario {
  id: number;
  nombre_completo: string;
  correo: string;
  rol: string;
  estado: boolean;
}

export interface LoginResponse {
  mensaje: string;
  usuario: Usuario;
  access_token: string;
  token_type: string;
}

// REGISTRO
export async function registrarUsuario(
  nombre_completo: string,
  correo: string,
  contrasena: string
) {
  try {
    const res = await fetch(`${AUTH_URL}/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre_completo, correo, contrasena }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return (await res.json()) as Usuario;
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);

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

// LOGIN
export async function login(correo: string, contrasena: string) {
  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    const data = (await res.json()) as LoginResponse;

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    return data;
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);

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

// LOGOUT
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

// OBTENER TOKEN
export function getToken() {
  return localStorage.getItem("token");
}