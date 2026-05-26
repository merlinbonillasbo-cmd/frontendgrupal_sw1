const BASE_URL = "http://127.0.0.1:8000/api/usuario";

export interface Usuario {
  id: number;
  nombre_completo: string;
  correo: string;
  estado: string;
}

// 1. REGISTRO (No necesita Token)
export async function registrarUsuario(nombre_completo: string, correo: string, contrasena: string) {
  try {
    const res = await fetch(`${BASE_URL}/registro/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre_completo, correo, contrasena }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } }; // Estructura compatible con tus componentes
    }

    return await res.json() as Usuario;
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    // Si es un error de red plano (sin respuesta del servidor) estructuramos el fallback
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 2. LOGIN (No necesita Token, pero guarda el recibido)
export async function login(correo: string, contrasena: string) {
  try {
    const res = await fetch(`${BASE_URL}/login/`, { // Revisa si tu backend lleva '/' al final aquí
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

    const data = await res.json() as { access_token: string };
    localStorage.setItem("token", data.access_token);
    return data;
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 3. VER PERFIL (Sí necesita Token)
export async function verPerfil() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/perfil`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}), // Inyección manual limpia
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as Usuario;
  } catch (error: any) {
    console.error("Error al obtener perfil:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 4. EDITAR PERFIL (Sí necesita Token)
export async function editarPerfil(nombre_completo: string) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ nombre_completo }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as Usuario;
  } catch (error: any) {
    console.error("Error al editar perfil:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}