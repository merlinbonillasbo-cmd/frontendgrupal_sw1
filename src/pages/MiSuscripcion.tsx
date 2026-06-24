import { useEffect, useState } from "react";
import {
  getMiSuscripcion,
  getPlanesList,
  getHistorialSuscripciones,
  getHistorialPagos,
  cancelarSuscripcion,
  procesarPago,
  type Plan,
  type Suscripcion,
  type PagoHistorial,
  type PagoRequest,
} from "../services/suscripcion_service";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ICONOS_PLAN: Record<string, string> = {
  gratuito: "🆓", básico: "⭐", basico: "⭐",
  estándar: "💎", estandar: "💎", profesional: "🚀", premium: "👑",
};
function getPlanIcon(nombre: string) {
  const lc = nombre.toLowerCase();
  for (const [k, v] of Object.entries(ICONOS_PLAN)) if (lc.includes(k)) return v;
  return "📦";
}
function formatLimite(v?: number | null) {
  return v === null || v === undefined ? "Ilimitado" : String(v);
}
function detectarTarjeta(n: string) {
  const s = n.replace(/\D/g, "");
  if (s.startsWith("4")) return { icon: "💳", label: "VISA" };
  if (["51","52","53","54","55"].includes(s.slice(0,2))) return { icon: "💳", label: "Mastercard" };
  if (["34","37"].includes(s.slice(0,2))) return { icon: "💳", label: "Amex" };
  return { icon: "💳", label: "Tarjeta" };
}
function formatCardInput(val: string) {
  return val.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
}

// ── Modal de Pago ─────────────────────────────────────────────────────────────
type ModalStage = "form" | "processing" | "success" | "error";

interface ModalPagoProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalPago({ plan, onClose, onSuccess }: ModalPagoProps) {
  const [stage, setStage] = useState<ModalStage>("form");
  const [numero, setNumero] = useState("");
  const [titular, setTitular] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [cvv, setCvv] = useState("");
  const [resultado, setResultado] = useState<{ mensaje: string; referencia?: string } | null>(null);
  const esGratuito = parseFloat(plan.precio) === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStage("processing");

    // Simular delay de red para realismo
    await new Promise(r => setTimeout(r, 2200));

    try {
      const payload: PagoRequest = {
        id_plan: plan.id,
        numero_tarjeta: esGratuito ? "4111111111111111" : numero.replace(/\s/g, ""),
        nombre_titular: esGratuito ? "Plan Gratuito" : titular,
        mes_expiracion: esGratuito ? "12" : mes,
        anio_expiracion: esGratuito ? "30" : anio,
        cvv: esGratuito ? "123" : cvv,
      };

      const res = await procesarPago(payload);

      if (res.aprobado) {
        setResultado({ mensaje: res.pago.mensaje_respuesta, referencia: res.pago.referencia });
        setStage("success");
      } else {
        setResultado({ mensaje: res.pago.mensaje_respuesta });
        setStage("error");
      }
    } catch (err: any) {
      setResultado({ mensaje: err?.detail || "Error de conexión. Intenta nuevamente." });
      setStage("error");
    }
  }

  function handleSuccessClose() {
    onSuccess();
    onClose();
  }

  const tarjeta = detectarTarjeta(numero);
  const meses = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 10 }, (_, i) => String(anioActual + i).slice(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ── Procesando ── */}
        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 px-8 space-y-5">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-xl">💳</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-black text-slate-800">Procesando pago...</p>
              <p className="text-xs text-slate-400">Conectando con la pasarela de pago segura</p>
            </div>
            <div className="flex space-x-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 bg-[#0284c7] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Éxito ── */}
        {stage === "success" && (
          <div className="flex flex-col items-center py-10 px-8 space-y-5 text-center">
            <div className="w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center text-4xl">
              ✅
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">¡Pago Aprobado!</h3>
              <p className="text-sm text-slate-500">{resultado?.mensaje}</p>
            </div>
            <div className="w-full bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-4 space-y-2 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Plan activado</span>
                <span className="font-black text-slate-800">{plan.nombre}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Monto cobrado</span>
                <span className="font-black text-emerald-600">${parseFloat(plan.precio).toFixed(2)} USD</span>
              </div>
              {resultado?.referencia && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Referencia</span>
                  <span className="font-mono text-[10px] text-slate-500">{resultado.referencia.slice(0,16)}...</span>
                </div>
              )}
            </div>
            <button onClick={handleSuccessClose}
              className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/20 transition-all">
              ¡Perfecto! Ver mi plan
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {stage === "error" && (
          <div className="flex flex-col items-center py-10 px-8 space-y-5 text-center">
            <div className="w-20 h-20 bg-red-50 border-4 border-red-200 rounded-full flex items-center justify-center text-4xl">
              ❌
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">Pago Rechazado</h3>
              <p className="text-sm text-red-600 font-semibold">{resultado?.mensaje}</p>
            </div>
            <div className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 text-left space-y-1">
              <p className="text-xs font-bold text-slate-600">¿Qué puedes hacer?</p>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside leading-relaxed">
                <li>Verifica que el número de tarjeta sea correcto</li>
                <li>Comprueba la fecha de vencimiento</li>
                <li>Confirma el CVV en el reverso de tu tarjeta</li>
                <li>Intenta con otra tarjeta</li>
              </ul>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setStage("form")}
                className="flex-1 py-3 border border-[#e0f2fe] text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50 transition-all">
                Reintentar
              </button>
              <button onClick={onClose}
                className="flex-1 py-3 bg-red-50 border border-red-100 text-red-600 font-bold rounded-2xl text-sm hover:bg-red-100 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ── Formulario ── */}
        {stage === "form" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e0f2fe]">
              <div>
                <p className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">Pago Seguro Simulado</p>
                <h2 className="text-lg font-black text-slate-800 mt-0.5">
                  Suscribirse a {plan.nombre}
                </h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Resumen del plan */}
            <div className="mx-6 mt-4 bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPlanIcon(plan.nombre)}</span>
                <div>
                  <p className="text-sm font-black text-slate-800">{plan.nombre}</p>
                  <p className="text-[10px] text-slate-400">{plan.descripcion || "Plan de suscripción"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#0284c7]">
                  ${parseFloat(plan.precio).toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-400">/mes</p>
              </div>
            </div>

            {/* Si es gratuito, botón directo sin formulario */}
            {esGratuito ? (
              <div className="p-6">
                <p className="text-xs text-slate-500 text-center mb-4">
                  Este plan es completamente gratuito. No se requiere tarjeta de crédito.
                </p>
                <button onClick={handleSubmit as any}
                  className="w-full py-4 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/20 transition-all">
                  ✅ Activar Plan Gratuito
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Tarjeta visual */}
                <div
                  className="rounded-2xl p-5 text-white relative overflow-hidden h-36"
                  style={{ background: "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)" }}
                >
                  <div className="absolute top-3 right-4 text-xl opacity-80">{tarjeta.icon}</div>
                  <div className="absolute bottom-3 right-4 text-[10px] font-bold opacity-70 uppercase tracking-widest">
                    {tarjeta.label}
                  </div>
                  <p className="text-[11px] font-semibold opacity-70 uppercase tracking-widest mt-1">Número de tarjeta</p>
                  <p className="text-lg font-mono font-bold tracking-widest mt-1">
                    {numero || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-[9px] opacity-60 uppercase tracking-widest">Titular</p>
                      <p className="text-xs font-bold uppercase truncate max-w-[160px]">
                        {titular || "NOMBRE APELLIDO"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-60 uppercase tracking-widest">Vence</p>
                      <p className="text-xs font-bold">{mes || "MM"}/{anio || "AA"}</p>
                    </div>
                  </div>
                </div>

                {/* Número de tarjeta */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    required
                    value={numero}
                    onChange={e => setNumero(formatCardInput(e.target.value))}
                    maxLength={19}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10 bg-white tracking-widest placeholder-slate-300"
                  />
                </div>

                {/* Titular */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    required
                    value={titular}
                    onChange={e => setTitular(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10 bg-white uppercase placeholder-slate-300"
                  />
                </div>

                {/* Fecha y CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Mes
                    </label>
                    <select required value={mes} onChange={e => setMes(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10 bg-white">
                      <option value="">MM</option>
                      {meses.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Año
                    </label>
                    <select required value={anio} onChange={e => setAnio(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10 bg-white">
                      <option value="">AA</option>
                      {anios.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      required
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                      maxLength={4}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center font-mono text-slate-700 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10 bg-white"
                    />
                  </div>
                </div>

                {/* Nota de simulación */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
                  <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
                  <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
                    <strong>Pago Simulado:</strong> No se realizan cargos reales. Usa <span className="font-mono">0000</span> al final para simular rechazo por fondos, <span className="font-mono">1111</span> para tarjeta bloqueada, o cualquier otro número para aprobar.
                  </p>
                </div>

                {/* Botón pagar */}
                <button type="submit"
                  className="w-full py-4 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center space-x-2">
                  <span>🔒</span>
                  <span>Pagar ${parseFloat(plan.precio).toFixed(2)} USD</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  Pago encriptado y procesado de forma segura · Simulación educativa
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function MiSuscripcion() {
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [historialSubs, setHistorialSubs] = useState<Suscripcion[]>([]);
  const [historialPagos, setHistorialPagos] = useState<PagoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tab, setTab] = useState<"planes" | "subs" | "pagos">("planes");
  const [planParaPagar, setPlanParaPagar] = useState<Plan | null>(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");
      const [sub, planesData, histSubs, histPagos] = await Promise.all([
        getMiSuscripcion().catch(() => null),
        getPlanesList(),
        getHistorialSuscripciones().catch(() => []),
        getHistorialPagos().catch(() => []),
      ]);
      setSuscripcion(sub);
      setPlanes(planesData);
      setHistorialSubs(histSubs);
      setHistorialPagos(histPagos);
    } catch (err: any) {
      setError(err?.detail || "Error al cargar la información");
    } finally {
      setCargando(false);
    }
  }

  async function handleCancelar() {
    if (!confirm("¿Cancelar tu suscripción? Se asignará el plan gratuito automáticamente.")) return;
    try {
      setProcesando(true);
      await cancelarSuscripcion();
      await cargarDatos();
      setMensaje("Suscripción cancelada correctamente.");
    } catch (err: any) {
      setError(err?.detail || "Error al cancelar la suscripción");
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#e0f2fe] border-t-[#0284c7] rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-500 mt-4 animate-pulse">Cargando suscripción...</p>
    </div>
  );

  const planActual = suscripcion?.plan || planes.find(p => p.id === suscripcion?.id_plan);

  return (
    <section className="min-h-screen font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wide">SaaS</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Mi Suscripción</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona tu plan activo, realiza pagos y consulta tu historial de transacciones.
          </p>
        </div>

        {/* Notificaciones */}
        {mensaje && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-semibold">
            ✅ {mensaje}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Banner plan activo */}
        {planActual && suscripcion && (
          <div className="bg-white border-2 border-[#0284c7]/20 rounded-3xl p-6 shadow-xl shadow-sky-600/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-sky-600/20">
                  {getPlanIcon(planActual.nombre)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">Plan Activo</p>
                  <h2 className="text-xl font-black text-slate-800">{planActual.nombre}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{planActual.descripcion || "Sin descripción"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="text-2xl font-black text-slate-800">
                  ${parseFloat(planActual.precio).toFixed(2)}
                  <span className="text-xs font-semibold text-slate-400">/mes</span>
                </span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                  suscripcion.estado === "ACTIVA"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}>{suscripcion.estado}</span>
              </div>
            </div>

            {/* Límites */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Audios", valor: planActual.max_audios, icon: "🎙️" },
                { label: "Proyectos", valor: planActual.max_proyectos, icon: "📁" },
                { label: "Transcripciones", valor: planActual.max_transcripciones, icon: "📝" },
                { label: "Resúmenes IA", valor: planActual.max_resumenes, icon: "🤖" },
              ].map(item => (
                <div key={item.label} className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl p-3 text-center">
                  <span className="text-base">{item.icon}</span>
                  <span className={`block text-sm font-black mt-1 ${
                    item.valor === null || item.valor === undefined ? "text-emerald-600" : "text-slate-700"
                  }`}>{formatLimite(item.valor)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Activa desde: {new Date(suscripcion.fecha_inicio).toLocaleDateString()}</span>
              {suscripcion.estado === "ACTIVA" && parseFloat(planActual.precio) > 0 && (
                <button onClick={handleCancelar} disabled={procesando}
                  className="text-red-500 hover:text-red-700 font-bold transition-colors disabled:opacity-50">
                  Cancelar suscripción
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 max-w-lg gap-1">
          {([
            { id: "planes", label: "📦 Planes disponibles" },
            { id: "subs",   label: "📋 Historial suscripciones" },
            { id: "pagos",  label: "💳 Historial de pagos" },
          ] as { id: typeof tab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                tab === t.id ? "bg-[#0284c7] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Planes ── */}
        {tab === "planes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {planes.length === 0 && (
              <div className="col-span-3 text-center py-16 text-slate-400">
                <span className="text-4xl block mb-3">📦</span>
                <p className="text-sm font-bold">No hay planes disponibles todavía.</p>
                <p className="text-xs mt-1">El administrador debe crearlos desde el panel de administración.</p>
              </div>
            )}
            {planes.map(plan => {
              const esActual = suscripcion?.id_plan === plan.id && suscripcion?.estado === "ACTIVA";
              return (
                <div key={plan.id}
                  className={`bg-white rounded-3xl border p-6 shadow-lg flex flex-col transition-all hover:scale-[1.02] ${
                    esActual
                      ? "border-[#0284c7] ring-2 ring-[#0284c7]/20 shadow-sky-600/10"
                      : "border-[#e0f2fe] shadow-sky-600/5"
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-2xl">{getPlanIcon(plan.nombre)}</span>
                      <h3 className="text-lg font-black text-slate-800 mt-1">{plan.nombre}</h3>
                    </div>
                    {esActual && (
                      <span className="text-[10px] font-bold text-[#0284c7] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
                        Actual
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">
                    {plan.descripcion || "Acceso a las funcionalidades del sistema."}
                  </p>

                  <div className="space-y-2 mb-5">
                    {[
                      { label: "Audios", valor: plan.max_audios, icon: "🎙️" },
                      { label: "Proyectos", valor: plan.max_proyectos, icon: "📁" },
                      { label: "Transcripciones", valor: plan.max_transcripciones, icon: "📝" },
                      { label: "Resúmenes IA", valor: plan.max_resumenes, icon: "🤖" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center space-x-1.5">
                          <span>{item.icon}</span><span>{item.label}</span>
                        </span>
                        <span className={`font-bold ${
                          item.valor === null || item.valor === undefined ? "text-emerald-600" : "text-slate-700"
                        }`}>{formatLimite(item.valor)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#e0f2fe] pt-4">
                    <p className="text-xl font-black text-slate-800 mb-3">
                      {parseFloat(plan.precio) === 0 ? (
                        <span className="text-emerald-600">Gratis</span>
                      ) : (
                        <>${parseFloat(plan.precio).toFixed(2)}<span className="text-xs font-semibold text-slate-400">/mes</span></>
                      )}
                    </p>
                    <button
                      onClick={() => { setMensaje(""); setError(""); setPlanParaPagar(plan); }}
                      disabled={esActual}
                      className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                        esActual
                          ? "bg-[#f0f9ff] text-[#0284c7] border border-[#e0f2fe] cursor-default"
                          : "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-sky-600/10"
                      }`}>
                      {esActual ? "✓ Plan Actual" : parseFloat(plan.precio) === 0 ? "Activar Gratis" : "Suscribirse"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tab: Historial Suscripciones ── */}
        {tab === "subs" && (
          <div className="bg-white rounded-3xl border border-[#e0f2fe] shadow-xl shadow-sky-600/5 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Historial de Suscripciones</h2>
            {historialSubs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl block mb-3">📋</span>
                <p className="text-sm font-bold">Sin historial registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historialSubs.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 border border-[#e0f2fe] rounded-2xl hover:bg-[#f0f9ff]/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getPlanIcon(h.plan?.nombre || "")}</span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">{h.plan?.nombre || `Plan #${h.id_plan}`}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(h.fecha_inicio).toLocaleDateString()}
                          {h.fecha_fin ? ` → ${new Date(h.fecha_fin).toLocaleDateString()}` : " → Activa"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                      h.estado === "ACTIVA"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : h.estado === "CANCELADA"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-slate-100 text-slate-500"
                    }`}>{h.estado}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Historial de Pagos ── */}
        {tab === "pagos" && (
          <div className="bg-white rounded-3xl border border-[#e0f2fe] shadow-xl shadow-sky-600/5 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Historial de Transacciones</h2>
            {historialPagos.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl block mb-3">💳</span>
                <p className="text-sm font-bold">Sin transacciones registradas</p>
                <p className="text-xs mt-1">Aquí aparecerán todos tus intentos de pago.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historialPagos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 border border-[#e0f2fe] rounded-2xl hover:bg-[#f0f9ff]/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        p.estado === "APROBADO" ? "bg-emerald-50" : "bg-red-50"
                      }`}>
                        {p.estado === "APROBADO" ? "✅" : "❌"}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">
                          {p.plan?.nombre || "Plan desconocido"}
                          {p.ultimos_digitos && (
                            <span className="ml-2 text-[10px] font-semibold text-slate-400">
                              {p.tipo_tarjeta} ••••{p.ultimos_digitos}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.referencia?.slice(0, 20)}...</p>
                        <p className="text-[10px] text-slate-400">{new Date(p.creado_en).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-base font-black ${
                        p.estado === "APROBADO" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        ${p.monto.toFixed(2)}
                      </p>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        p.estado === "APROBADO"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : p.estado === "RECHAZADO"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-slate-100 text-slate-500"
                      }`}>{p.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de pago */}
      {planParaPagar && (
        <ModalPago
          plan={planParaPagar}
          onClose={() => setPlanParaPagar(null)}
          onSuccess={() => {
            setMensaje(`¡Suscripción al plan "${planParaPagar.nombre}" activada correctamente!`);
            setPlanParaPagar(null);
            cargarDatos();
          }}
        />
      )}
    </section>
  );
}
