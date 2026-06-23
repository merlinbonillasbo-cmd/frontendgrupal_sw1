import { API_URL } from "./api";
import { getToken } from "./auth_service";

const PRESENTACION_URL = `${API_URL}/presentaciones`;

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AudioDisponible {
  id: number;
  titulo: string;
  proyecto: string;
  creado_en: string | null;
}

export interface Diapositiva {
  tipo: "titulo" | "contenido";
  titulo: string;
  subtitulo?: string;
  puntos?: string[];
  notas_orador?: string;
}

export interface DisenoPresentacion {
  tema: "sky" | "dark" | "sand" | "minimal";
  fuente: string;
  colorFondo: string;
  colorTitulo: string;
  colorTexto: string;
  layout?: "standard" | "two-columns" | "quote"; // layouts personalizados de diapositiva
}

export interface Presentacion {
  id: number;
  titulo: string;
  diseno: DisenoPresentacion;
  contenido: Diapositiva[];
  cantidad_diapositivas: number;
  creado_en: string | null;
}

export async function listarAudiosDisponibles(): Promise<AudioDisponible[]> {
  const res = await fetch(`${PRESENTACION_URL}/audios`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al obtener audios disponibles");
  }
  return res.json();
}

export async function crearPresentacion(titulo: string, audioIds: number[]): Promise<Presentacion> {
  const res = await fetch(PRESENTACION_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, audio_ids: audioIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al generar la presentación");
  }
  return res.json();
}

export async function obtenerPresentacion(presId: number): Promise<Presentacion> {
  const res = await fetch(`${PRESENTACION_URL}/${presId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al obtener la presentación");
  }
  return res.json();
}

export async function guardarPresentacion(
  presId: number,
  titulo: string,
  contenido: Diapositiva[],
  diseno: DisenoPresentacion
): Promise<Presentacion> {
  const res = await fetch(`${PRESENTACION_URL}/${presId}/guardar`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, contenido, diseno }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al guardar los cambios");
  }
  return res.json();
}

export async function listarHistorialPresentaciones(): Promise<Presentacion[]> {
  const res = await fetch(`${PRESENTACION_URL}/historial/lista`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al obtener historial de presentaciones");
  }
  return res.json();
}
