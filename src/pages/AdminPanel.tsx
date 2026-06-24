import { useEffect, useState } from "react";
import {
  getMetricas, getUsuariosAdmin, activarUsuario, desactivarUsuario,
  getAdminPlanes, crearPlan, editarPlan, activarPlan, desactivarPlan,
  getSuscripcionesActivas,
  type MetricasData, type UsuarioAdmin, type Plan, type Suscripcion, type PlanCreate,
} from "../services/suscripcion_service";

type Tab = "metricas" | "usuarios" | "planes" | "suscripciones";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("metricas");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  return (
    <section className="min-h-screen font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wide">Panel Administrativo</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Administración del Sistema</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona usuarios, planes, suscripciones y monitorea las métricas de uso.</p>
        </div>

        {mensaje && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm">
            ✅ {mensaje}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 gap-1 max-w-2xl">
          {([
            { id: "metricas", label: "📊 Métricas" },
            { id: "usuarios", label: "👥 Usuarios" },
            { id: "planes", label: "📦 Planes" },
            { id: "suscripciones", label: "🔗 Suscripciones" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(""); setMensaje(""); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                tab === t.id ? "bg-[#0284c7] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "metricas" && <TabMetricas setError={setError} />}
        {tab === "usuarios" && <TabUsuarios setError={setError} setMensaje={setMensaje} />}
        {tab === "planes" && <TabPlanes setError={setError} setMensaje={setMensaje} />}
        {tab === "suscripciones" && <TabSuscripciones setError={setError} />}
      </div>
    </section>
  );
}

// ─── Tab Métricas ─────────────────────────────────────────────────────────────
function TabMetricas({ setError }: { setError: (e: string) => void }) {
  const [metricas, setMetricas] = useState<MetricasData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  async function cargar() {
    try {
      setCargando(true);
      setError("");
      const data = await getMetricas(fechaInicio || undefined, fechaFin || undefined);
      setMetricas(data);
    } catch (err: any) {
      setError(err?.detail || "Error al cargar métricas");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
    </div>
  );

  if (!metricas) return null;

  const statCards = [
    { label: "Usuarios Totales", val: metricas.usuarios.total, icon: "👥", color: "text-sky-600" },
    { label: "Usuarios Activos", val: metricas.usuarios.activos, icon: "✅", color: "text-emerald-600" },
    { label: "Proyectos", val: metricas.proyectos, icon: "📁", color: "text-violet-600" },
    { label: "Audios Totales", val: metricas.audios.total, icon: "🎙️", color: "text-orange-600" },
    { label: "Transcritos", val: metricas.audios.completados, icon: "📄", color: "text-teal-600" },
    { label: "Transcripciones", val: metricas.transcripciones, icon: "🗒️", color: "text-slate-700" },
    { label: "Resúmenes IA", val: metricas.contenido_ia.resumenes, icon: "🤖", color: "text-pink-600" },
    { label: "Quizzes", val: metricas.contenido_ia.quizzes, icon: "📝", color: "text-yellow-600" },
    { label: "Presentaciones", val: metricas.contenido_ia.presentaciones, icon: "🎭", color: "text-indigo-600" },
    { label: "Grafos", val: metricas.contenido_ia.grafos, icon: "📊", color: "text-blue-600" },
    { label: "Conversaciones", val: metricas.chat.conversaciones, icon: "💬", color: "text-rose-600" },
    { label: "Suscripciones Activas", val: metricas.suscripciones_activas, icon: "🔗", color: "text-[#0284c7]" },
  ];

  return (
    <div className="space-y-6">
      {/* Filtro de fechas */}
      <div className="bg-white border border-[#e0f2fe] rounded-2xl p-4 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Desde</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0284c7]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Hasta</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0284c7]" />
        </div>
        <button onClick={cargar}
          className="px-6 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm rounded-xl shadow-md transition-all">
          Filtrar
        </button>
        {(fechaInicio || fechaFin) && (
          <button onClick={() => { setFechaInicio(""); setFechaFin(""); setTimeout(cargar, 50); }}
            className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all hover:bg-slate-50">
            Limpiar
          </button>
        )}
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-[#e0f2fe] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl">{s.icon}</span>
            <p className={`text-3xl font-black mt-2 ${s.color}`}>{s.val}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Distribución por plan */}
      {metricas.distribucion_planes.length > 0 && (
        <div className="bg-white border border-[#e0f2fe] rounded-3xl p-6 shadow-xl shadow-sky-600/5">
          <h3 className="text-base font-black text-slate-800 mb-4">Distribución por Plan</h3>
          <div className="space-y-3">
            {metricas.distribucion_planes.map((d) => {
              const pct = metricas.usuarios.total > 0 ? Math.round((d.usuarios / metricas.usuarios.total) * 100) : 0;
              return (
                <div key={d.plan} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{d.plan}</span>
                    <span>{d.usuarios} usuarios ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#f0f9ff] h-2.5 rounded-full">
                    <div className="bg-[#0284c7] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab Usuarios (HU-08) ─────────────────────────────────────────────────────
function TabUsuarios({ setError, setMensaje }: { setError: (e: string) => void; setMensaje: (m: string) => void }) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  async function cargar(term = "") {
    try {
      setCargando(true);
      setError("");
      const data = await getUsuariosAdmin(term || undefined);
      setUsuarios(data);
    } catch (err: any) {
      setError(err?.detail || "Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function toggleEstado(u: UsuarioAdmin) {
    const accion = u.estado ? "desactivar" : "activar";
    if (!confirm(`¿Deseas ${accion} la cuenta de "${u.nombre_completo}"?`)) return;
    try {
      setProcesando(u.id);
      setError("");
      if (u.estado) await desactivarUsuario(u.id);
      else await activarUsuario(u.id);
      setMensaje(`Usuario "${u.nombre_completo}" ${u.estado ? "desactivado" : "activado"} correctamente.`);
      await cargar(busqueda);
    } catch (err: any) {
      setError(err?.detail || "Error al cambiar el estado del usuario");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cargar(busqueda)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0284c7] bg-white"
        />
        <button onClick={() => cargar(busqueda)}
          className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm rounded-xl shadow-md transition-all">
          🔍 Buscar
        </button>
        {busqueda && (
          <button onClick={() => { setBusqueda(""); cargar(""); }}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all">
            ✕
          </button>
        )}
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-[#e0f2fe] rounded-3xl shadow-xl shadow-sky-600/5 overflow-hidden">
          <div className="p-5 border-b border-[#e0f2fe] flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800">Usuarios Registrados</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{usuarios.length} usuarios</span>
          </div>
          {usuarios.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <span className="text-4xl block mb-3">👥</span>
              <p className="text-sm font-bold">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f9ff]">
              {usuarios.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#f0f9ff]/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${
                      u.rol === "ADMIN" ? "bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white" : "bg-[#f0f9ff] text-[#0284c7]"
                    }`}>
                      {u.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{u.nombre_completo}</p>
                      <p className="text-xs text-slate-400">{u.correo}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.rol === "ADMIN" ? "bg-[#e0f2fe] text-[#0284c7]" : "bg-slate-100 text-slate-500"
                    }`}>{u.rol}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.estado ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                    }`}>{u.estado ? "Activo" : "Inactivo"}</span>
                    <button
                      onClick={() => toggleEstado(u)}
                      disabled={procesando === u.id}
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 ${
                        u.estado
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {procesando === u.id ? "..." : u.estado ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab Planes (HU-09 parcial) ───────────────────────────────────────────────
const PLAN_VACIO: PlanCreate = { nombre: "", descripcion: "", precio: 0, max_audios: null, max_proyectos: null, max_transcripciones: null, max_resumenes: null };

function TabPlanes({ setError, setMensaje }: { setError: (e: string) => void; setMensaje: (m: string) => void }) {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanCreate & { activo?: boolean }>(PLAN_VACIO);
  const [mostrarForm, setMostrarForm] = useState(false);

  async function cargar() {
    try {
      setCargando(true);
      setError("");
      const data = await getAdminPlanes(false);
      setPlanes(data);
    } catch (err: any) {
      setError(err?.detail || "Error al cargar planes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() { setEditandoId(null); setForm(PLAN_VACIO); setMostrarForm(true); }

  function abrirEditar(p: Plan) {
    setEditandoId(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || "", precio: parseFloat(p.precio),
      max_audios: p.max_audios ?? null, max_proyectos: p.max_proyectos ?? null,
      max_transcripciones: p.max_transcripciones ?? null, max_resumenes: p.max_resumenes ?? null, activo: p.activo });
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    try {
      setProcesando(editandoId || -1);
      setError("");
      if (editandoId) {
        await editarPlan(editandoId, form);
        setMensaje("Plan actualizado correctamente.");
      } else {
        await crearPlan(form);
        setMensaje("Plan creado correctamente.");
      }
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err?.detail || "Error al guardar el plan");
    } finally {
      setProcesando(null);
    }
  }

  async function toggleActivo(p: Plan) {
    try {
      setProcesando(p.id);
      setError("");
      if (p.activo) await desactivarPlan(p.id);
      else await activarPlan(p.id);
      setMensaje(`Plan "${p.nombre}" ${p.activo ? "desactivado" : "activado"}.`);
      await cargar();
    } catch (err: any) {
      setError(err?.detail || "Error al cambiar estado del plan");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={abrirNuevo}
          className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2">
          <span>＋</span><span>Nuevo Plan</span>
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white border border-[#e0f2fe] rounded-3xl p-6 shadow-xl shadow-sky-600/5">
          <h3 className="text-base font-black text-slate-800 mb-5">{editandoId ? "Editar Plan" : "Crear Nuevo Plan"}</h3>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "nombre", label: "Nombre del Plan", type: "text", req: true },
              { id: "precio", label: "Precio ($/mes)", type: "number", req: true },
              { id: "max_audios", label: "Máx. Audios (vacío=ilimitado)", type: "number", req: false },
              { id: "max_proyectos", label: "Máx. Proyectos", type: "number", req: false },
              { id: "max_transcripciones", label: "Máx. Transcripciones", type: "number", req: false },
              { id: "max_resumenes", label: "Máx. Resúmenes", type: "number", req: false },
            ].map((f) => (
              <div key={f.id} className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{f.label}</label>
                <input type={f.type} required={f.req} min={0}
                  value={(form as any)[f.id] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.id]: e.target.value === "" ? null : (f.type === "number" ? Number(e.target.value) : e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0284c7] bg-white" />
              </div>
            ))}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Descripción</label>
              <textarea value={form.descripcion || ""} rows={2}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0284c7] bg-white resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setMostrarForm(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={procesando !== null}
                className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50">
                {procesando !== null ? "Guardando..." : "Guardar Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {planes.map((p) => (
            <div key={p.id} className={`bg-white rounded-3xl border p-5 shadow-lg ${p.activo ? "border-[#e0f2fe]" : "border-red-100 opacity-70"}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-black text-slate-800">{p.nombre}</h3>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${p.activo ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{p.descripcion || "Sin descripción"}</p>
              <p className="text-xl font-black text-slate-800 mb-3">${parseFloat(p.precio).toFixed(2)}<span className="text-xs font-semibold text-slate-400">/mes</span></p>
              <div className="space-y-1 text-xs text-slate-500 mb-4">
                <div className="flex justify-between"><span>Audios</span><span className="font-bold">{p.max_audios ?? "∞"}</span></div>
                <div className="flex justify-between"><span>Proyectos</span><span className="font-bold">{p.max_proyectos ?? "∞"}</span></div>
                <div className="flex justify-between"><span>Transcripciones</span><span className="font-bold">{p.max_transcripciones ?? "∞"}</span></div>
                <div className="flex justify-between"><span>Resúmenes</span><span className="font-bold">{p.max_resumenes ?? "∞"}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEditar(p)} className="flex-1 py-2 text-xs font-bold rounded-xl border border-[#e0f2fe] text-[#0284c7] hover:bg-[#f0f9ff] transition-all">
                  ✏️ Editar
                </button>
                <button onClick={() => toggleActivo(p)} disabled={procesando === p.id}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all disabled:opacity-50 ${p.activo ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                  {procesando === p.id ? "..." : p.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab Suscripciones (HU-09) ────────────────────────────────────────────────
function TabSuscripciones({ setError }: { setError: (e: string) => void }) {
  const [subs, setSubs] = useState<Suscripcion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getSuscripcionesActivas()
      .then(setSubs)
      .catch((err: any) => setError(err?.detail || "Error al cargar suscripciones"))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white border border-[#e0f2fe] rounded-3xl shadow-xl shadow-sky-600/5 overflow-hidden">
      <div className="p-5 border-b border-[#e0f2fe] flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800">Suscripciones Activas</h2>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{subs.length} activas</span>
      </div>
      {subs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-4xl block mb-3">🔗</span>
          <p className="text-sm font-bold">No hay suscripciones activas</p>
        </div>
      ) : (
        <div className="divide-y divide-[#f0f9ff]">
          {subs.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#f0f9ff]/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-800">
                  Usuario #{s.id_usuario} · <span className="text-[#0284c7]">{s.plan?.nombre || `Plan #${s.id_plan}`}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Desde {new Date(s.fecha_inicio).toLocaleDateString()}
                  {s.plan && ` · $${parseFloat(s.plan.precio).toFixed(2)}/mes`}
                </p>
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                {s.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
