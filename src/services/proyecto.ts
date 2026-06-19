const BASE_URL = "http://127.0.0.1:8000/api/proyecto";

export interface Proyecto {
  id: number;
  id_usuario: number;
  nombre: string;
  descripcion?: string;
  creado_en: string;
}

// 1. OBTENER PROYECTOS (Requiere Token)
export async function obtenerProyectos() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/`, {
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

    return await res.json() as Proyecto[];
  } catch (error: any) {
    console.error("Error al obtener proyectos:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 2. CREAR PROYECTO (Requiere Token)
export async function crearProyecto(nombre: string, descripcion?: string) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ nombre, descripcion }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as Proyecto;
  } catch (error: any) {
    console.error("Error al crear proyecto:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 3. ELIMINAR PROYECTO (Requiere Token)
export async function eliminarProyecto(id: number) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${id}`, {
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
    console.error("Error al eliminar proyecto:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}

// 4. EDITAR PROYECTO (Requiere Token)
export async function editarProyecto(id: number, nombre: string, descripcion?: string) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ nombre, descripcion }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }

    return await res.json() as Proyecto;
  } catch (error: any) {
    console.error("Error al editar proyecto:", error);
    if (!error.response) {
      throw { response: { data: { detail: error.message || "Error de conexión" } } };
    }
    throw error;
  }
}
