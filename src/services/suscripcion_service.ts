import { API_URL } from "./api";
import { getToken } from "./auth_service";

const SUBS_URL = `${API_URL}/suscripciones`;
const ADMIN_URL = `${API_URL}/admin`;

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: string;
  max_audios?: number | null;
  max_proyectos?: number | null;
  max_transcripciones?: number | null;
  max_resumenes?: number | null;
  activo: boolean;
  creado_en: string;
}

export interface Suscripcion {
  id: number;
  id_usuario: number;
  id_plan: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  creado_en: string;
  plan?: Plan | null;
}

export interface PlanCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  max_audios?: number | null;
  max_proyectos?: number | null;
  max_transcripciones?: number | null;
  max_resumenes?: number | null;
}

export interface PlanUpdate extends Partial<PlanCreate> {
  activo?: boolean;
}

export interface UsuarioAdmin {
  id: number;
  nombre_completo: string;
  correo: string;
  rol: string;
  estado: boolean;
}

export interface MetricasData {
  usuarios: { total: number; activos: number; inactivos: number };
  proyectos: number;
  audios: { total: number; completados: number; pendientes: number };
  transcripciones: number;
  contenido_ia: { resumenes: number; quizzes: number; presentaciones: number; grafos: number };
  chat: { conversaciones: number; mensajes: number };
  suscripciones_activas: number;
  distribucion_planes: { plan: string; usuarios: number }[];
}

export interface PagoRequest {
  id_plan: number;
  numero_tarjeta: string;
  nombre_titular: string;
  mes_expiracion: string;
  anio_expiracion: string;
  cvv: string;
}

export interface PagoResultado {
  aprobado: boolean;
  pago: {
    id: number;
    referencia: string;
    monto: number;
    moneda: string;
    ultimos_digitos: string;
    tipo_tarjeta: string;
    estado: string;
    mensaje_respuesta: string;
    creado_en: string;
  };
  plan: {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    max_audios?: number | null;
    max_proyectos?: number | null;
    max_transcripciones?: number | null;
    max_resumenes?: number | null;
  };
  suscripcion?: {
    id: number;
    id_plan: number;
    estado: string;
    fecha_inicio: string;
  } | null;
}

export interface PagoHistorial {
  id: number;
  referencia: string;
  monto: number;
  moneda: string;
  ultimos_digitos?: string;
  tipo_tarjeta?: string;
  estado: string;
  mensaje_respuesta?: string;
  creado_en: string;
  plan?: { id: number; nombre: string; precio: number } | null;
}

// ── Usuario: Pago simulado ────────────────────────────────────────────────────

export async function procesarPago(data: PagoRequest): Promise<PagoResultado> {
  const res = await fetch(`${SUBS_URL}/pagar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getHistorialPagos(): Promise<PagoHistorial[]> {
  const res = await fetch(`${SUBS_URL}/pagos`, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getPlanesList(): Promise<Plan[]> {
  const res = await fetch(`${SUBS_URL}/planes`, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getMiSuscripcion(): Promise<Suscripcion> {
  const res = await fetch(`${SUBS_URL}/mi-suscripcion`, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function cambiarPlan(planId: number): Promise<Suscripcion> {
  const res = await fetch(`${SUBS_URL}/cambiar-plan`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id_plan: planId }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function cancelarSuscripcion(): Promise<Suscripcion> {
  const res = await fetch(`${SUBS_URL}/cancelar`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getHistorialSuscripciones(): Promise<Suscripcion[]> {
  const res = await fetch(`${SUBS_URL}/historial`, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ── Admin: Planes ─────────────────────────────────────────────────────────────

export async function getAdminPlanes(soloActivos = false): Promise<Plan[]> {
  const res = await fetch(`${ADMIN_URL}/planes?solo_activos=${soloActivos}`, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function crearPlan(data: PlanCreate): Promise<Plan> {
  const res = await fetch(`${ADMIN_URL}/planes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function editarPlan(planId: number, data: PlanUpdate): Promise<Plan> {
  const res = await fetch(`${ADMIN_URL}/planes/${planId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function activarPlan(planId: number): Promise<Plan> {
  const res = await fetch(`${ADMIN_URL}/planes/${planId}/activar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function desactivarPlan(planId: number): Promise<Plan> {
  const res = await fetch(`${ADMIN_URL}/planes/${planId}/desactivar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ── Admin: Suscripciones ──────────────────────────────────────────────────────

export async function getSuscripcionesActivas(): Promise<Suscripcion[]> {
  const res = await fetch(`${ADMIN_URL}/suscripciones`, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ── Admin: Usuarios ───────────────────────────────────────────────────────────

export async function getUsuariosAdmin(busqueda?: string): Promise<UsuarioAdmin[]> {
  const url = busqueda
    ? `${ADMIN_URL}/usuarios?busqueda=${encodeURIComponent(busqueda)}`
    : `${ADMIN_URL}/usuarios`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function activarUsuario(userId: number): Promise<UsuarioAdmin> {
  const res = await fetch(`${ADMIN_URL}/usuarios/${userId}/activar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function desactivarUsuario(userId: number): Promise<UsuarioAdmin> {
  const res = await fetch(`${ADMIN_URL}/usuarios/${userId}/desactivar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ── Admin: Métricas ───────────────────────────────────────────────────────────

export async function getMetricas(fechaInicio?: string, fechaFin?: string): Promise<MetricasData> {
  let url = `${ADMIN_URL}/metricas`;
  const params: string[] = [];
  if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
  if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
  if (params.length) url += `?${params.join("&")}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw await res.json();
  return res.json();
}
