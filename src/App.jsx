import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://nmgptqmyzbakabbwerqx.supabase.co";
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_ncYtAt8DpLsf3MnRBPwZGA_T1p7cYn7";
const sb = createClient(SB_URL, SB_KEY, {
  auth: {
    persistSession: true,
    storageKey: "gymos-auth",
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// ── Utils ─────────────────────────────────────────────────────────
const uid6 = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / 86400000);
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const GF = "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');";

// Machine categories
const MACHINE_CATEGORIES = ["Tren inferior","Tren superior empuje","Tren superior tirón","Core","Cardio","Peso libre","Funcional","Otro"];

// Goal options
const GOALS = ["Ganar masa muscular","Perder grasa corporal","Mejorar fuerza funcional","Mejorar condición física general","Rendimiento deportivo","Rehabilitación y prevención"];

// ── AI Plan Generator ─────────────────────────────────────────────
async function generateWorkoutPlan(assessment, machines) {
  const machineList = machines.filter(m => m.available).map(m => m.name).join(", ") || "Solo peso corporal y mancuernas básicas";
  const prompt = `Eres el mejor entrenador deportivo del mundo. Crea un plan de entrenamiento mensual COMPLETO.

PERFIL DEL CLIENTE:
- Nombre: ${assessment.full_name || "Atleta"} | Edad: ${assessment.age}a | Peso: ${assessment.weight}kg | Altura: ${assessment.height}cm | Sexo: ${assessment.sex}
- Lesiones: ${assessment.injuries || "Ninguna"}
- Objetivo: ${assessment.goal} — ${assessment.specific_goal || ""}
- Experiencia gym: ${assessment.gym_exp}
- Días de entrenamiento por semana: ${assessment.gym_days}
- Duración por sesión: ${assessment.session_time}
- Condición física: ${assessment.fitness_level || "—"}
- Marcas actuales: ${assessment.benchmarks || "Sin referencia"}

TEST FÍSICO:
- FMS Sentadilla: ${assessment.fms_squat || "—"} | Zancada: ${assessment.fms_lunge || "—"}
- Movilidad hombro: ${assessment.fms_shoulder || "—"} | Isquiotibiales: ${assessment.fms_hamstring || "—"}
- Plancha: ${assessment.test_plank || "—"} seg | Flexiones: ${assessment.test_pushup || "—"} reps
- Zonas débiles: ${assessment.weak_zones || "—"}
- A reforzar: ${assessment.strengthen_zones || "—"}

MÁQUINAS DISPONIBLES EN EL GIMNASIO:
${machineList}
IMPORTANTE: Usar SOLO las máquinas listadas arriba. No mencionar equipamiento que no esté disponible.

Genera exactamente ${assessment.gym_days} días de entrenamiento (una semana tipo).
Cada día debe tener 5-6 ejercicios. Sé CONCISO en las instrucciones (máximo 10 palabras por instrucción).

Responde SOLO con JSON válido sin markdown:
{
  "summary": "análisis breve en 2 oraciones",
  "days_per_week": ${assessment.gym_days},
  "total_days": ${assessment.gym_days},
  "phase1": {"name": "Semanas 1-2", "focus": "descripción corta"},
  "phase2": {"name": "Semanas 3-4", "focus": "descripción corta"},
  "days": [
    {
      "day_number": 1,
      "week": 1,
      "name": "Día A — nombre",
      "focus": "músculos principales",
      "exercises": [
        {
          "name": "Ejercicio",
          "sets": 3,
          "reps": "12",
          "rest": "90 seg",
          "load": "Moderada",
          "muscles": "músculos",
          "instructions": "indicación clave breve"
        }
      ]
    }
  ]
}`;

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 8000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  const txt = d.content.map(i => i.text || "").join("");
  return JSON.parse(txt.replace(/```json\n?|```\n?/g, "").trim());
}

// ── Shared styles ─────────────────────────────────────────────────
const C = {
  bg: "#0a0a0f", surface: "#12121a", card: "#1a1a2e",
  primary: "#00ff87", secondary: "#6366f1", accent: "#f59e0b",
  danger: "#ef4444", text: "#ffffff", muted: "#64748b",
  border: "#1e293b",
};

const INP = {
  width: "100%", background: "#0f0f1a", border: "1px solid #1e293b",
  borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
  color: "#fff", boxSizing: "border-box", fontFamily: "inherit",
};

const BTN = (variant = "primary") => ({
  background: variant === "primary" ? C.primary : variant === "danger" ? C.danger : "transparent",
  color: variant === "primary" ? "#000" : "#fff",
  border: variant === "ghost" ? "1px solid #1e293b" : "none",
  borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit",
});

function Tag({ text, color = "#6366f1", bg }) {
  return <span style={{ background: bg || color + "22", color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" }}>{text}</span>;
}

function Card({ children, style = {} }) {
  return <div style={{ background: C.card, borderRadius: 16, border: "1px solid " + C.border, padding: 20, ...style }}>{children}</div>;
}

function Fld({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: "#475569", margin: "0 0 4px" }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── AUTH SCREENS ──────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  // Detect invite code from URL: /join/GYM001 or ?gym=GYM001
  const urlParams = new URLSearchParams(window.location.search);
  const pathCode = window.location.pathname.split("/join/")[1]?.toUpperCase();
  const queryCode = urlParams.get("gym")?.toUpperCase();
  const urlInviteCode = pathCode || queryCode || "";

  const [mode, setMode] = useState(urlInviteCode ? "register" : "login");
  const [role, setRole] = useState(urlInviteCode ? "client" : "client");
  const [gymFromUrl, setGymFromUrl] = useState(null);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "", invite_code: urlInviteCode });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If URL has invite code, load gym name to show on screen
  useEffect(() => {
    if (urlInviteCode) {
      sb.from("gyms").select("id,name,invite_code").eq("invite_code", urlInviteCode).single()
        .then(({ data }) => { if (data) setGymFromUrl(data); else setError("Código de gimnasio inválido."); });
    }
  }, []);

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const { data, error } = await sb.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        if (data.user) onAuth(data.user.id);
      } else {
        if (role === "client") {
          // Use already-loaded gym from URL invite link; otherwise query by typed code
          let gymData = gymFromUrl?.id ? gymFromUrl : null;
          if (!gymData) {
            const code = form.invite_code?.trim().toUpperCase();
            if (!code || code.length < 4) throw new Error("Ingresá el código de invitación del gimnasio.");
            const { data: g } = await sb.from("gyms").select("*").eq("invite_code", code).single();
            if (!g) throw new Error("Código de invitación incorrecto. Pedíselo a tu entrenador.");
            gymData = g;
          }
          const { data, error } = await sb.auth.signUp({ email: form.email, password: form.password });
          if (error) throw error;
          if (data.user) {
            const { error: pe } = await sb.from("profiles").insert({
              id: data.user.id, role, full_name: form.full_name, phone: form.phone,
              status: "active", gym_id: gymData.id
            });
            if (pe) throw pe;
            onAuth(data.user.id);
          }
        } else {
          // Trainer: 1) profile, 2) gym, 3) link — all before signalling auth
          const { data, error } = await sb.auth.signUp({ email: form.email, password: form.password });
          if (error) throw error;
          if (data.user) {
            const { error: pe } = await sb.from("profiles").insert({
              id: data.user.id, role, full_name: form.full_name, phone: form.phone, status: "active"
            });
            if (pe) throw pe;
            const inviteCode = uid6();
            const { data: gym, error: ge } = await sb.from("gyms").insert({
              name: form.gym_name || "Mi Gimnasio", owner_id: data.user.id, invite_code: inviteCode
            }).select().single();
            if (ge) throw ge;
            const { error: le } = await sb.from("profiles").update({ gym_id: gym.id }).eq("id", data.user.id);
            if (le) throw le;
            onAuth(data.user.id);
          }
        }
      }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{GF}</style>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 42, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>
            Gym<span style={{ color: C.primary }}>OS</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>El sistema operativo de tu gimnasio</p>
        </div>

        {/* Gym banner when coming from invite link */}
        {gymFromUrl && (
          <div style={{ background: C.primary + "18", border: "1px solid " + C.primary + "55", borderRadius: 14, padding: "14px 18px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🏋️</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.primary, fontFamily: "'Sora',sans-serif" }}>{gymFromUrl.name}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Creá tu cuenta para unirte a este gimnasio</div>
          </div>
        )}

        <Card>
          {/* Mode toggle */}
          <div style={{ display: "flex", background: "#0f0f1a", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[["login","Iniciar sesión"],["register","Registrarse"]].map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: mode === m ? C.secondary : "transparent", color: mode === m ? "#fff" : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <>
                {/* Role selector — only show if NOT coming from invite link */}
                {!urlInviteCode && (
                  <Fld label="Soy...">
                    <div style={{ display: "flex", gap: 10 }}>
                      {[["trainer","🏋️ Entrenador / Dueño"],["client","💪 Cliente del gym"]].map(([r,l]) => (
                        <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "2px solid " + (role === r ? C.primary : C.border), background: role === r ? C.primary + "22" : "transparent", color: role === r ? C.primary : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
                      ))}
                    </div>
                  </Fld>
                )}
                <Fld label="Nombre completo *">
                  <input style={INP} value={form.full_name} onChange={upd("full_name")} placeholder="Juan García" />
                </Fld>
                {role === "trainer" && !urlInviteCode && (
                  <Fld label="Nombre del gimnasio *">
                    <input style={INP} value={form.gym_name || ""} onChange={upd("gym_name")} placeholder="Ej: PowerGym Palermo" />
                  </Fld>
                )}
                {role === "client" && !urlInviteCode && (
                  <Fld label="Código del gimnasio *" hint="Tu entrenador te da este código">
                    <input style={{ ...INP, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: C.primary }} value={form.invite_code || ""} onChange={upd("invite_code")} placeholder="Ej: GYM001" maxLength={8} />
                  </Fld>
                )}
                <Fld label="Teléfono (opcional)">
                  <input style={INP} value={form.phone} onChange={upd("phone")} placeholder="+54 11 0000-0000" />
                </Fld>
              </>
            )}
            <Fld label="Email *">
              <input style={INP} type="email" value={form.email} onChange={upd("email")} placeholder="tu@email.com" />
            </Fld>
            <Fld label="Contraseña *">
              <input style={INP} type="password" value={form.password} onChange={upd("password")} placeholder="Mínimo 6 caracteres" />
            </Fld>
            {error && <div style={{ background: "#ef444422", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 14px", color: "#ef4444", fontSize: 13 }}>⚠️ {error}</div>}
            <button onClick={handleSubmit} disabled={loading} style={{ ...BTN("primary"), padding: "13px", fontSize: 15, marginTop: 4 }}>
              {loading ? "Cargando..." : mode === "login" ? "Entrar →" : "Crear cuenta →"}
            </button>
          </div>
        </Card>

        {mode === "register" && role === "client" && (
          <p style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            Necesitás el código de tu gimnasio para registrarte. Pedíselo a tu entrenador.
          </p>
        )}
      </div>
    </div>
  );
}

// ── TRAINER APP ───────────────────────────────────────────────────
function TrainerApp({ user, profile, onLogout }) {
  const [screen, setScreen] = useState(() => sessionStorage.getItem("trainer_screen") || "dashboard");
  const [gym, setGym] = useState(null);
  const [clients, setClients] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist screen across tab switches
  const goScreen = (s) => { setScreen(s); sessionStorage.setItem("trainer_screen", s); };

  // Restore selected client after reload
  useEffect(() => {
    const savedClientId = sessionStorage.getItem("trainer_client_id");
    if (savedClientId && clients.length > 0) {
      const found = clients.find(c => c.id === savedClientId);
      if (found) setSelectedClient(found);
    }
  }, [clients]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const { data: gymData } = await sb.from("gyms").select("*").eq("owner_id", user.id).single();
    if (gymData) {
      setGym(gymData);
      const { data: clientsData } = await sb.from("profiles")
        .select("*, assessments(*), payments(*)")
        .eq("gym_id", gymData.id).eq("role", "client");
      setClients(clientsData || []);
      const { data: mData } = await sb.from("machines").select("*").eq("gym_id", gymData.id).order("category");
      setMachines(mData || []);
    }
    setLoading(false);
  }

  async function activateClient(clientId) {
    await sb.from("profiles").update({ status: "active" }).eq("id", clientId);
    loadAll();
  }

  async function generateQR() {
    if (!gym) return;
    const code = uid6();
    const todayDate = today();
    const { error } = await sb.from("daily_qr").upsert({ gym_id: gym.id, date: todayDate, code }, { onConflict: "gym_id,date" });
    if (!error) alert("QR generado: " + code);
    else alert("Error: " + error.message);
  }

  if (loading) return <LoadingScreen />;

  const pending = clients.filter(c => c.status === "pending");
  const active = clients.filter(c => c.status === "active");

  if (screen === "client" && selectedClient) {
    return <ClientProfileTrainer client={selectedClient} gym={gym} machines={machines} onBack={() => { sessionStorage.removeItem("trainer_client_id"); goScreen("dashboard"); loadAll(); }} />;
  }
  if (screen === "machines") {
    return <MachinesScreen gym={gym} machines={machines} onBack={() => { goScreen("dashboard"); loadAll(); }} />;
  }
  if (screen === "qr") {
    return <QRScreen gym={gym} onBack={() => goScreen("dashboard")} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{GF}</style>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>Gym<span style={{ color: C.primary }}>OS</span> <span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>— {gym?.name || "Panel"}</span></h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {gym?.invite_code && (
            <div style={{ background: C.primary + "22", border: "1px solid " + C.primary + "44", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted }}>Código del gym:</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.primary, letterSpacing: "0.15em" }}>{gym.invite_code}</span>
            </div>
          )}
          <button onClick={() => goScreen("qr")} style={{ ...BTN("primary"), padding: "8px 16px", fontSize: 13 }}>📱 QR del día</button>
          <button onClick={() => goScreen("machines")} style={{ ...BTN("ghost"), padding: "8px 16px", fontSize: 13 }}>🏋️ Máquinas</button>
          {gym?.invite_code && (
            <button onClick={() => {
              const link = window.location.origin + "/join/" + gym.invite_code;
              navigator.clipboard.writeText(link).then(() => alert("✓ Link copiado: " + link));
            }} style={{ ...BTN("ghost"), padding: "8px 16px", fontSize: 13 }}>📋 Copiar link</button>
          )}
          <button onClick={onLogout} style={{ ...BTN("ghost"), padding: "8px 14px", fontSize: 13 }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Clientes activos", value: active.length, icon: "💪", color: C.primary },
            { label: "Pendientes de activar", value: pending.length, icon: "⏳", color: C.accent },
            { label: "Máquinas disponibles", value: machines.filter(m => m.available).length, icon: "🏋️", color: C.secondary },
            { label: "Cuotas vencidas", value: clients.filter(c => c.payments?.some(p => p.status === "overdue")).length, icon: "🔴", color: C.danger },
          ].map(s => (
            <Card key={s.label} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 30 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pending activation */}
        {pending.length > 0 && (
          <Card style={{ marginBottom: 20, borderColor: C.accent + "44" }}>
            <h3 style={{ margin: "0 0 14px", color: C.accent, fontSize: 14, fontWeight: 700 }}>⏳ Clientes pendientes de activar ({pending.length})</h3>
            {pending.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + C.border }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.full_name || c.email || "—"}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Se registró el {fmtDate(c.created_at)}</div>
                </div>
                <button onClick={() => activateClient(c.id)} style={{ ...BTN("primary"), padding: "7px 16px", fontSize: 12 }}>Activar</button>
              </div>
            ))}
          </Card>
        )}

        {/* Client list */}
        <Card>
          <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700 }}>Clientes activos</h2>
          {active.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Sin clientes activos aún</p>
              <p style={{ fontSize: 13, margin: 0 }}>Activá clientes desde la sección de pendientes</p>
            </div>
          ) : active.map((c, idx) => {
            const latestPayment = c.payments?.sort((a, b) => new Date(b.due_date) - new Date(a.due_date))[0];
            const payStatus = latestPayment?.status;
            const daysLeft = latestPayment?.due_date ? daysUntil(latestPayment.due_date) : null;
            const hasAssessment = c.assessments;
            const hasPlan = false; // would check workout_plans
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: idx < active.length - 1 ? "1px solid " + C.border : "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#00ff87)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#000", flexShrink: 0 }}>
                  {(c.full_name || "C")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.full_name || "—"}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{c.assessments?.goal || "Sin objetivo cargado"}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {hasAssessment ? <Tag text="✓ Test" color={C.primary} /> : <Tag text="Sin test" color={C.muted} />}
                  {payStatus === "overdue" && <Tag text="⚠️ Vencida" color={C.danger} />}
                  {payStatus === "pending" && daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && <Tag text={"Vence en " + daysLeft + "d"} color={C.accent} />}
                  {payStatus === "paid" && <Tag text="✓ Pagado" color={C.primary} />}
                </div>
                <button onClick={() => { setSelectedClient(c); sessionStorage.setItem("trainer_client_id", c.id); goScreen("client"); }} style={{ ...BTN("ghost"), padding: "8px 16px", fontSize: 13 }}>Ver perfil →</button>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── CLIENT PROFILE (trainer view) ─────────────────────────────────
function ClientProfileTrainer({ client, gym, machines, onBack }) {
  const [tab, setTab] = useState("perfil");
  const [assessment, setAssessment] = useState(client.assessments || null);
  const [plan, setPlan] = useState(null);
  const [payments, setPayments] = useState(client.payments || []);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [physTest, setPhysTest] = useState({});
  const [newPayment, setNewPayment] = useState({ amount: "", due_date: "", notes: "" });

  useEffect(() => { loadPlan(); }, []);

  async function loadPlan() {
    const now = new Date();
    const { data } = await sb.from("workout_plans").select("*")
      .eq("client_id", client.id).eq("month", now.getMonth() + 1).eq("year", now.getFullYear())
      .eq("is_active", true).single();
    if (data) setPlan(data);
  }

  async function savePhysicalTest() {
    setSaving(true);
    const data = { ...physTest, physical_test_done: true, trainer_completed: true };
    if (assessment) {
      await sb.from("assessments").update(data).eq("client_id", client.id);
    } else {
      await sb.from("assessments").insert({ client_id: client.id, ...data });
    }
    setAssessment(prev => ({ ...(prev || {}), ...data }));
    setSaving(false);
    alert("Test físico guardado ✓");
  }

  async function handleGeneratePlan() {
    if (!assessment) { alert("El cliente debe completar el test inicial primero."); return; }
    setGenerating(true);
    try {
      const fullAssessment = { ...assessment, full_name: client.full_name };
      const weekData = await generateWorkoutPlan(fullAssessment, machines);

      // Expand 1 week template into 4 weeks with progressive overload
      const baseDays = weekData.days || [];
      const allDays = [];
      for (let week = 1; week <= 4; week++) {
        baseDays.forEach((day, idx) => {
          const loadMap = { "Liviana": ["Liviana","Liviana","Moderada","Moderada"], "Moderada": ["Moderada","Moderada","Moderada-Alta","Moderada-Alta"], "Alta": ["Alta","Alta","Alta","Alta"] };
          allDays.push({
            ...day,
            day_number: (week - 1) * baseDays.length + idx + 1,
            week,
            exercises: day.exercises.map(ex => ({
              ...ex,
              sets: week >= 3 ? Math.min((ex.sets || 3) + 1, 5) : ex.sets,
              load: loadMap[ex.load]?.[week - 1] || ex.load,
            }))
          });
        });
      }

      const planData = { ...weekData, total_days: allDays.length, days: allDays };
      const now = new Date();
      await sb.from("workout_plans").update({ is_active: false }).eq("client_id", client.id);
      const { data } = await sb.from("workout_plans").insert({
        client_id: client.id, gym_id: gym.id,
        month: now.getMonth() + 1, year: now.getFullYear(),
        days_per_week: assessment.gym_days || 3,
        plan_data: planData, is_active: true,
      }).select().single();
      if (data) setPlan(data);
      alert("Plan generado exitosamente ✓ — " + allDays.length + " días en total (4 semanas)");
    } catch (e) { alert("Error: " + e.message); }
    setGenerating(false);
  }

  async function saveBodyAnalysis(data) {
    await sb.from("assessments").update({ ...data, analysis_date: today() }).eq("client_id", client.id);
    setAssessment(prev => ({ ...prev, ...data }));
    alert("Análisis corporal guardado ✓");
  }

  async function addPayment() {
    if (!newPayment.amount || !newPayment.due_date) return;
    const { data } = await sb.from("payments").insert({
      client_id: client.id, gym_id: gym.id,
      amount: parseFloat(newPayment.amount), due_date: newPayment.due_date,
      notes: newPayment.notes, status: "pending"
    }).select().single();
    if (data) { setPayments(prev => [...prev, data]); setNewPayment({ amount: "", due_date: "", notes: "" }); }
  }

  async function updatePaymentStatus(payId, status) {
    await sb.from("payments").update({ status, paid_date: status === "paid" ? today() : null }).eq("id", payId);
    setPayments(prev => prev.map(p => p.id === payId ? { ...p, status } : p));
  }

  const TABS = [["perfil","👤 Perfil"],["test","🔬 Test físico"],["plan","🏋️ Plan actual"],["analisis","📊 Análisis corporal"],["pagos","💰 Pagos"]];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 700 }}>{client.full_name || "Cliente"}</span>
        <Tag text={client.status === "active" ? "Activo" : "Pendiente"} color={client.status === "active" ? C.primary : C.accent} />
        <div style={{ marginLeft: "auto" }}>
          <button onClick={handleGeneratePlan} disabled={generating} style={{ ...BTN("primary"), padding: "8px 18px", fontSize: 13 }}>
            {generating ? "⏳ Generando..." : "🤖 Generar plan del mes"}
          </button>
        </div>
      </div>

      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: "transparent", border: "none", borderBottom: tab === id ? "2px solid " + C.primary : "2px solid transparent", color: tab === id ? C.primary : C.muted, padding: "13px 14px", fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>{lbl}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "26px 24px" }}>

        {tab === "perfil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <h3 style={{ margin: "0 0 16px", color: C.primary, fontSize: 15 }}>Datos personales</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Nombre", client.full_name], ["Teléfono", client.phone], ["Objetivo", assessment?.goal], ["Experiencia", assessment?.gym_exp], ["Días/semana", assessment?.gym_days], ["Sesión", assessment?.session_time], ["Peso", assessment?.weight ? assessment.weight + " kg" : "—"], ["Altura", assessment?.height ? assessment.height + " cm" : "—"]].map(([l, v]) => (
                  <div key={l} style={{ background: C.surface, borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontWeight: 600, marginTop: 3 }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
              {assessment?.injuries && <div style={{ marginTop: 12, background: "#ef444418", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444" }}>⚠️ Lesiones: {assessment.injuries}</div>}
            </Card>
          </div>
        )}

        {tab === "test" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ borderColor: C.primary + "33" }}>
              <h3 style={{ margin: "0 0 4px", color: C.primary, fontSize: 15 }}>🔬 Test físico presencial</h3>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 18px" }}>Completar con el cliente presente. Marcar Bien / Regular / Mal para cada patrón.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["fms_squat","Sentadilla libre con brazos arriba"],["fms_lunge","Zancada en línea"],["fms_shoulder","Movilidad de hombro (manos detrás)"],["fms_hamstring","Elongación isquiotibial (tocar el suelo)"]].map(([k, lbl]) => (
                  <Fld key={k} label={lbl}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["Bien","#16a34a","✅"],["Regular","#ca8a04","⚠️"],["Mal","#dc2626","❌"]].map(([v, col, e]) => {
                        const val = physTest[k] || assessment?.[k];
                        const sel = val === v;
                        return <button key={v} onClick={() => setPhysTest(p => ({ ...p, [k]: v }))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "2px solid " + (sel ? col : C.border), background: sel ? col + "22" : "transparent", color: sel ? col : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{e} {v}</button>;
                      })}
                    </div>
                  </Fld>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Fld label="Plancha frontal (segundos)">
                    <input style={INP} type="number" value={physTest.test_plank || assessment?.test_plank || ""} onChange={e => setPhysTest(p => ({ ...p, test_plank: e.target.value }))} placeholder="Ej: 30" />
                  </Fld>
                  <Fld label="Flexiones (reps con forma)">
                    <input style={INP} type="number" value={physTest.test_pushup || assessment?.test_pushup || ""} onChange={e => setPhysTest(p => ({ ...p, test_pushup: e.target.value }))} placeholder="Ej: 10" />
                  </Fld>
                </div>
                <Fld label="Zonas débiles identificadas">
                  <textarea style={{ ...INP, height: 60, resize: "none" }} value={physTest.weak_zones || assessment?.weak_zones || ""} onChange={e => setPhysTest(p => ({ ...p, weak_zones: e.target.value }))} placeholder="Ej: Core débil, glúteos inhibidos..." />
                </Fld>
                <Fld label="A reforzar prioritariamente">
                  <textarea style={{ ...INP, height: 60, resize: "none" }} value={physTest.strengthen_zones || assessment?.strengthen_zones || ""} onChange={e => setPhysTest(p => ({ ...p, strengthen_zones: e.target.value }))} placeholder="Ej: Activación glútea, movilidad de cadera..." />
                </Fld>
                <Fld label="Observaciones del entrenador">
                  <textarea style={{ ...INP, height: 60, resize: "none" }} value={physTest.test_notes || assessment?.test_notes || ""} onChange={e => setPhysTest(p => ({ ...p, test_notes: e.target.value }))} placeholder="Cualquier detalle relevante..." />
                </Fld>
                <button onClick={savePhysicalTest} disabled={saving} style={{ ...BTN("primary"), padding: "12px" }}>{saving ? "Guardando..." : "💾 Guardar test físico"}</button>
              </div>
            </Card>
          </div>
        )}

        {tab === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!plan ? (
              <Card style={{ textAlign: "center", padding: "48px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <p style={{ fontWeight: 600, fontSize: 16, margin: "0 0 6px" }}>Sin plan generado este mes</p>
                <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Asegurate de que el cliente completó el test inicial, luego generá el plan.</p>
                <button onClick={handleGeneratePlan} disabled={generating} style={{ ...BTN("primary"), padding: "12px 28px" }}>
                  {generating ? "⏳ Generando..." : "🤖 Generar plan del mes"}
                </button>
              </Card>
            ) : (
              <>
                <Card style={{ background: "linear-gradient(135deg,#1a1a2e,#0f0f1a)", borderColor: C.primary + "44" }}>
                  <h3 style={{ margin: "0 0 8px", color: C.primary, fontFamily: "'Sora',sans-serif" }}>{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</h3>
                  <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>{plan.plan_data?.summary}</p>
                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <Tag text={plan.days_per_week + " días/semana"} color={C.secondary} />
                    <Tag text={plan.plan_data?.total_days + " días totales"} color={C.primary} />
                  </div>
                </Card>
                {plan.plan_data?.days?.map((day) => (
                  <Card key={day.day_number}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <span style={{ background: C.primary + "22", color: C.primary, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", marginRight: 8 }}>Día {day.day_number} — Sem {day.week}</span>
                        <span style={{ fontWeight: 700 }}>{day.name}</span>
                      </div>
                      <span style={{ fontSize: 12, color: C.muted }}>{day.focus}</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead><tr style={{ background: "#0f0f1a" }}>
                          {["Ejercicio","Series","Reps","Descanso","Músculos","Indicación"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {day.exercises?.map((ex, i) => (
                            <tr key={i} style={{ borderTop: "1px solid " + C.border, background: i % 2 ? "#0f0f1a" : "transparent" }}>
                              <td style={{ padding: "9px 10px", fontWeight: 600 }}>{ex.name}</td>
                              <td style={{ padding: "9px 10px", color: C.primary, fontWeight: 700, textAlign: "center" }}>{ex.sets}</td>
                              <td style={{ padding: "9px 10px", color: C.text }}>{ex.reps}</td>
                              <td style={{ padding: "9px 10px", color: C.muted }}>{ex.rest}</td>
                              <td style={{ padding: "9px 10px", color: C.muted, fontSize: 12 }}>{ex.muscles}</td>
                              <td style={{ padding: "9px 10px", color: C.secondary, fontSize: 12, fontStyle: "italic" }}>{ex.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "analisis" && (
          <BodyAnalysisTab assessment={assessment} onSave={saveBodyAnalysis} />
        )}

        {tab === "pagos" && (
          <PaymentsTab payments={payments} onAdd={addPayment} onUpdateStatus={updatePaymentStatus} newPayment={newPayment} setNewPayment={setNewPayment} />
        )}
      </div>
    </div>
  );
}

function BodyAnalysisTab({ assessment, onSave }) {
  const [form, setForm] = useState({ body_fat_pct: assessment?.body_fat_pct || "", muscle_mass_kg: assessment?.muscle_mass_kg || "", visceral_fat: assessment?.visceral_fat || "", analysis_notes: assessment?.analysis_notes || "" });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Card>
      <h3 style={{ margin: "0 0 6px", color: C.primary, fontSize: 15 }}>📊 Análisis corporal del nutricionista</h3>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 18px" }}>Cargar los datos obtenidos en la medición mensual. Esto ajustará la rutina en la próxima generación.</p>
      {assessment?.analysis_date && <div style={{ background: C.surface, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.muted, marginBottom: 16 }}>Último análisis: {fmtDate(assessment.analysis_date)}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Fld label="% Grasa corporal"><input style={INP} type="number" step="0.1" value={form.body_fat_pct} onChange={upd("body_fat_pct")} placeholder="Ej: 18.5" /></Fld>
          <Fld label="Masa muscular (kg)"><input style={INP} type="number" step="0.1" value={form.muscle_mass_kg} onChange={upd("muscle_mass_kg")} placeholder="Ej: 32.0" /></Fld>
          <Fld label="Grasa visceral (nivel)"><input style={INP} type="number" value={form.visceral_fat} onChange={upd("visceral_fat")} placeholder="Ej: 8" /></Fld>
        </div>
        <Fld label="Observaciones del nutricionista">
          <textarea style={{ ...INP, height: 72, resize: "none" }} value={form.analysis_notes} onChange={upd("analysis_notes")} placeholder="Recomendaciones, cambios a implementar en la rutina..." />
        </Fld>
        <button onClick={() => onSave(form)} style={{ ...BTN("primary"), padding: "12px" }}>💾 Guardar análisis corporal</button>
      </div>
    </Card>
  );
}

function PaymentsTab({ payments, onAdd, onUpdateStatus, newPayment, setNewPayment }) {
  const upd = k => e => setNewPayment(p => ({ ...p, [k]: e.target.value }));
  const statusColors = { pending: C.accent, paid: C.primary, overdue: C.danger };
  const statusLabels = { pending: "Pendiente", paid: "Pagado", overdue: "Vencido" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <h3 style={{ margin: "0 0 16px", color: C.primary, fontSize: 15 }}>Registrar cuota</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Fld label="Monto ($)"><input style={INP} type="number" value={newPayment.amount} onChange={upd("amount")} placeholder="Ej: 15000" /></Fld>
          <Fld label="Fecha de vencimiento"><input style={INP} type="date" value={newPayment.due_date} onChange={upd("due_date")} /></Fld>
        </div>
        <Fld label="Nota (opcional)">
          <input style={INP} value={newPayment.notes} onChange={upd("notes")} placeholder="Ej: Cuota Enero 2025" />
        </Fld>
        <button onClick={onAdd} style={{ ...BTN("primary"), marginTop: 12, padding: "10px 20px" }}>+ Agregar cuota</button>
      </Card>
      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Historial de pagos</h3>
        {payments.length === 0 ? <p style={{ color: C.muted, fontSize: 14 }}>Sin registros aún.</p> : payments.sort((a, b) => new Date(b.due_date) - new Date(a.due_date)).map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < payments.length - 1 ? "1px solid " + C.border : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>${p.amount?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: C.muted }}>Vence: {fmtDate(p.due_date)}{p.paid_date ? " · Pagado: " + fmtDate(p.paid_date) : ""}</div>
              {p.notes && <div style={{ fontSize: 12, color: C.muted }}>{p.notes}</div>}
            </div>
            <Tag text={statusLabels[p.status]} color={statusColors[p.status]} />
            {p.status !== "paid" && <button onClick={() => onUpdateStatus(p.id, "paid")} style={{ ...BTN("primary"), padding: "6px 12px", fontSize: 12 }}>Marcar pagado</button>}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── MACHINES SCREEN ───────────────────────────────────────────────
function MachinesScreen({ gym, machines: initialMachines, onBack }) {
  const [machines, setMachines] = useState(initialMachines);
  const [form, setForm] = useState({ name: "", category: MACHINE_CATEGORIES[0] });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function addMachine() {
    if (!form.name.trim()) return;
    const { data } = await sb.from("machines").insert({ gym_id: gym.id, name: form.name, category: form.category }).select().single();
    if (data) { setMachines(prev => [...prev, data]); setForm({ name: "", category: MACHINE_CATEGORIES[0] }); }
  }

  async function toggleMachine(id, available) {
    await sb.from("machines").update({ available: !available }).eq("id", id);
    setMachines(prev => prev.map(m => m.id === id ? { ...m, available: !available } : m));
  }

  async function deleteMachine(id) {
    if (!confirm("¿Eliminar esta máquina?")) return;
    await sb.from("machines").delete().eq("id", id);
    setMachines(prev => prev.filter(m => m.id !== id));
  }

  const grouped = MACHINE_CATEGORIES.reduce((acc, cat) => {
    const items = machines.filter(m => m.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 700 }}>🏋️ Inventario de máquinas</span>
        <Tag text={machines.filter(m => m.available).length + " disponibles"} color={C.primary} />
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "26px 24px" }}>
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", color: C.primary, fontSize: 14, fontWeight: 700 }}>Agregar máquina o equipo</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "end" }}>
            <Fld label="Nombre del equipo *">
              <input style={INP} value={form.name} onChange={upd("name")} placeholder="Ej: Sentadilla Smith, Mancuernas, Cable cruzado..." />
            </Fld>
            <Fld label="Categoría">
              <select style={INP} value={form.category} onChange={upd("category")}>
                {MACHINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Fld>
            <button onClick={addMachine} style={{ ...BTN("primary"), padding: "10px 20px", whiteSpace: "nowrap" }}>+ Agregar</button>
          </div>
        </Card>
        {Object.keys(grouped).length === 0 ? (
          <Card style={{ textAlign: "center", padding: "48px" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏋️</div>
            <p style={{ fontWeight: 600, color: C.muted, fontSize: 15 }}>Sin equipamiento cargado aún</p>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Cargá el inventario del gimnasio para que la IA genere rutinas correctas</p>
          </Card>
        ) : Object.entries(grouped).map(([cat, items]) => (
          <Card key={cat} style={{ marginBottom: 14 }}>
            <h4 style={{ margin: "0 0 12px", color: C.secondary, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat}</h4>
            {items.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid " + C.border }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.available ? C.primary : C.danger, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 500, color: m.available ? C.text : C.muted }}>{m.name}</span>
                <button onClick={() => toggleMachine(m.id, m.available)} style={{ ...BTN("ghost"), padding: "5px 12px", fontSize: 12 }}>{m.available ? "Marcar no disp." : "Marcar disp."}</button>
                <button onClick={() => deleteMachine(m.id)} style={{ ...BTN("ghost"), padding: "5px 10px", fontSize: 12, color: C.danger, borderColor: C.danger + "44" }}>✕</button>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── QR SCREEN ─────────────────────────────────────────────────────
function QRScreen({ gym, onBack }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTodayQR(); }, []);

  async function loadTodayQR() {
    const { data } = await sb.from("daily_qr").select("*").eq("gym_id", gym.id).eq("date", today()).single();
    setQrData(data);
    setLoading(false);
  }

  async function generateQR() {
    const code = uid6();
    const { data, error } = await sb.from("daily_qr").upsert({ gym_id: gym.id, date: today(), code }, { onConflict: "gym_id,date" }).select().single();
    if (data) setQrData(data);
    else if (error) alert("Error: " + error.message);
  }

  const qrImgUrl = qrData ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=GYMOS-${qrData.code}&bgcolor=0a0a0f&color=00ff87&format=png` : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 700 }}>📱 QR del día</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: C.muted, marginBottom: 8, fontSize: 14 }}>{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 32px" }}>Código de asistencia</h2>
          {loading ? <div style={{ color: C.muted }}>Cargando...</div> : qrData ? (
            <>
              <div style={{ background: "#0a0a0f", borderRadius: 20, padding: 20, display: "inline-block", border: "2px solid " + C.primary + "44", marginBottom: 24 }}>
                <img src={qrImgUrl} alt="QR Code" style={{ width: 280, height: 280, display: "block" }} />
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 48, fontWeight: 800, color: C.primary, letterSpacing: "0.2em", marginBottom: 8 }}>{qrData.code}</div>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Los clientes escanean el QR o ingresan el código manualmente en su app</p>
              <button onClick={generateQR} style={{ ...BTN("ghost"), padding: "10px 24px" }}>🔄 Regenerar QR</button>
            </>
          ) : (
            <>
              <div style={{ background: C.card, borderRadius: 20, padding: "60px 40px", border: "2px dashed " + C.border, marginBottom: 24 }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>📱</div>
                <p style={{ color: C.muted, fontSize: 14 }}>No hay QR generado para hoy</p>
              </div>
              <button onClick={generateQR} style={{ ...BTN("primary"), padding: "14px 36px", fontSize: 16 }}>Generar QR de hoy</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CLIENT APP ────────────────────────────────────────────────────
function ClientApp({ user, profile, onLogout }) {
  const [screen, setScreen] = useState("home");
  const [gym, setGym] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [plan, setPlan] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    if (profile.gym_id) {
      const { data: gymData } = await sb.from("gyms").select("*").eq("id", profile.gym_id).single();
      setGym(gymData);
    }
    const { data: aData } = await sb.from("assessments").select("*").eq("client_id", user.id).single();
    setAssessment(aData);
    const { data: planData } = await sb.from("workout_plans").select("*").eq("client_id", user.id).eq("is_active", true).single();
    setPlan(planData);
    const { data: attData } = await sb.from("attendance").select("*").eq("client_id", user.id).eq("date", today()).single();
    setTodayAttendance(attData);
    const { data: payData } = await sb.from("payments").select("*").eq("client_id", user.id).order("due_date", { ascending: false });
    setPayments(payData || []);
    setLoading(false);
    return { plan: planData, attendance: attData };
  }

  if (loading) return <LoadingScreen />;

  // Determine today's workout day — note: index can be 0 so check explicitly for null/undefined
  const todayDayIndex = todayAttendance?.plan_day_index;
  const todayWorkout = plan && todayDayIndex !== undefined && todayDayIndex !== null
    ? plan.plan_data?.days?.[todayDayIndex] || null
    : null;

  // Payment alerts
  const latestPayment = payments[0];
  const payAlert = latestPayment ? (
    latestPayment.status === "overdue" ? { type: "danger", msg: "⚠️ Tu cuota está vencida. Contactá al gimnasio." } :
    latestPayment.status === "pending" && daysUntil(latestPayment.due_date) <= 3 && daysUntil(latestPayment.due_date) >= 0
      ? { type: "warning", msg: `⏰ Tu cuota vence en ${daysUntil(latestPayment.due_date)} día${daysUntil(latestPayment.due_date) !== 1 ? "s" : ""}.` }
      : null
  ) : null;

  if (screen === "checkin") return <QRCheckin user={user} profile={profile} gym={gym} plan={plan} onCheckin={async (dayIndex) => {
    await loadAll();
    // Navigate directly to workout if we have the plan day
    const workout = plan?.plan_data?.days?.[dayIndex];
    if (workout) setScreen("workout_direct_" + dayIndex);
    else setScreen("home");
  }} onBack={() => setScreen("home")} />;
  if (screen.startsWith("workout_direct_")) {
    const idx = parseInt(screen.split("workout_direct_")[1]);
    const workout = plan?.plan_data?.days?.[idx];
    if (workout) return <WorkoutScreen workout={workout} onBack={() => setScreen("home")} />;
  }
  if (screen === "workout" && todayWorkout) return <WorkoutScreen workout={todayWorkout} onBack={() => setScreen("home")} />;
  if (screen === "test") return <ClientTestScreen user={user} assessment={assessment} onSave={(a) => { setAssessment(a); setScreen("home"); }} onBack={() => setScreen("home")} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, margin: 0 }}>Gym<span style={{ color: C.primary }}>OS</span></h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{profile.full_name || user.email}</span>
          <button onClick={onLogout} style={{ ...BTN("ghost"), padding: "6px 12px", fontSize: 12 }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Status: pending */}
        {profile.status === "pending" && (
          <div style={{ background: C.accent + "22", border: "1px solid " + C.accent + "66", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, color: C.accent, marginBottom: 4 }}>⏳ Cuenta pendiente de activación</div>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Tu entrenador debe activar tu cuenta. Acercate al gimnasio o contactalo directamente.</p>
          </div>
        )}

        {/* Payment alert */}
        {payAlert && (
          <div style={{ background: (payAlert.type === "danger" ? C.danger : C.accent) + "22", border: "1px solid " + (payAlert.type === "danger" ? C.danger : C.accent) + "66", borderRadius: 14, padding: "14px 18px" }}>
            <div style={{ fontWeight: 700, color: payAlert.type === "danger" ? C.danger : C.accent, fontSize: 14 }}>{payAlert.msg}</div>
          </div>
        )}

        {/* Gym info */}
        {gym && (
          <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏠</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{gym.name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>Tu gimnasio</div>
            </div>
          </Card>
        )}

        {/* Complete test CTA */}
        {profile.status === "active" && !assessment?.client_completed && (
          <Card style={{ borderColor: C.secondary + "66", background: C.secondary + "11" }}>
            <div style={{ fontWeight: 700, color: C.secondary, marginBottom: 6 }}>📋 Completá tu test inicial</div>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px" }}>Necesitamos algunos datos para que tu entrenador pueda crear tu plan personalizado.</p>
            <button onClick={() => setScreen("test")} style={{ ...BTN("primary"), background: C.secondary, padding: "10px 20px", fontSize: 13 }}>Completar test →</button>
          </Card>
        )}

        {/* Today's workout card */}
        {profile.status === "active" && (
          <Card style={{ background: "linear-gradient(135deg,#1a1a2e,#0f0f1a)", borderColor: C.primary + "44" }}>
            <div style={{ fontWeight: 700, color: C.primary, fontSize: 14, marginBottom: 4 }}>HOY</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, margin: "0 0 14px" }}>
              {todayWorkout ? todayWorkout.name : todayAttendance ? "Entrenamiento completado ✓" : "Rutina del día"}
            </h2>
            {!todayAttendance && plan ? (
              <button onClick={() => setScreen("checkin")} style={{ ...BTN("primary"), padding: "13px 28px", fontSize: 15, width: "100%" }}>
                📱 Escanear QR para desbloquear
              </button>
            ) : todayWorkout ? (
              <button onClick={() => setScreen("workout")} style={{ ...BTN("primary"), padding: "13px 28px", fontSize: 15, width: "100%" }}>
                Ver rutina de hoy →
              </button>
            ) : (
              <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
                {!plan ? "Tu entrenador aún no generó tu plan del mes." : "Escaneá el QR cuando llegues al gym para ver tu rutina."}
              </p>
            )}
          </Card>
        )}

        {/* Stats */}
        {plan && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, fontFamily: "'Sora',sans-serif" }}>{plan.days_per_week}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>días por semana</div>
            </Card>
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.secondary, fontFamily: "'Sora',sans-serif" }}>{MONTHS[new Date().getMonth()]}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>plan activo</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── QR CHECK-IN ───────────────────────────────────────────────────
function QRCheckin({ user, profile, gym, plan, onCheckin, onBack }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleCheckin() {
    if (code.length !== 6) { setError("El código debe tener 6 caracteres."); return; }
    setLoading(true); setError("");
    try {
      // 1. Verify QR code
      const { data: qrData, error: qrError } = await sb.from("daily_qr")
        .select("*")
        .eq("gym_id", profile.gym_id)
        .eq("date", today())
        .eq("code", code.toUpperCase())
        .single();

      if (qrError || !qrData) {
        setError("Código incorrecto o expirado. Pedile el código de hoy a tu entrenador.");
        setLoading(false);
        return;
      }

      // 2. Calculate which day of the plan corresponds to today
      const { data: allAtt } = await sb.from("attendance")
        .select("id")
        .eq("client_id", user.id);
      const pastCount = allAtt ? allAtt.length : 0;
      const totalDays = plan?.plan_data?.days?.length || 12;
      const nextDayIndex = pastCount % totalDays;

      // 3. Register attendance (without qr_code field — not in schema)
      const { error: attError } = await sb.from("attendance").upsert(
        { client_id: user.id, gym_id: profile.gym_id, date: today(), plan_day_index: nextDayIndex },
        { onConflict: "client_id,date" }
      );

      if (attError) { setError("Error al registrar asistencia: " + attError.message); setLoading(false); return; }

      // 4. Show success then go directly to workout
      setSuccess(true);
      setTimeout(() => onCheckin(nextDayIndex), 1200);

    } catch (e) { setError("Error inesperado: " + e.message); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Inicio</button>
        <span style={{ fontWeight: 700 }}>Registrar asistencia</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          {success ? (
            <div>
              <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 8px", color: C.primary }}>¡Asistencia registrada!</h2>
              <p style={{ color: C.muted, fontSize: 14 }}>Abriendo tu rutina de hoy...</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>¿Ya estás en el gym?</h2>
              <p style={{ color: C.muted, fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>Ingresá el código de 6 letras que muestra el entrenador en su pantalla hoy.</p>
              <input
                style={{ ...INP, textAlign: "center", fontSize: 32, fontWeight: 800, letterSpacing: "0.3em", color: C.primary, padding: "16px", marginBottom: 8 }}
                value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX" maxLength={6}
              />
              {error && <div style={{ background: C.danger + "22", border: "1px solid " + C.danger + "66", borderRadius: 10, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
              <button onClick={handleCheckin} disabled={loading || code.length !== 6} style={{ ...BTN("primary"), padding: "14px", fontSize: 16, width: "100%", marginTop: 8, opacity: code.length !== 6 ? 0.5 : 1 }}>
                {loading ? "Verificando..." : "✓ Confirmar asistencia"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WORKOUT SCREEN ────────────────────────────────────────────────
function WorkoutScreen({ workout, onBack }) {
  const [expandedEx, setExpandedEx] = useState(null);

  function ytUrl(exerciseName) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(exerciseName + " tutorial técnica correcta");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Inicio</button>
        <span style={{ fontWeight: 700 }}>Rutina de hoy</span>
        <Tag text={"Día " + workout.day_number} color={C.primary} />
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {/* Day header */}
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#0f0f1a)", borderRadius: 18, padding: 22, border: "1px solid " + C.primary + "44", marginBottom: 20 }}>
          <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Semana {workout.week} — Día {workout.day_number}</div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{workout.name}</h2>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>{workout.focus}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Tag text={workout.exercises?.length + " ejercicios"} color={C.secondary} />
          </div>
        </div>

        {/* Exercise list */}
        {workout.exercises?.map((ex, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => setExpandedEx(expandedEx === i ? null : i)} style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", color: C.primary, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{ex.muscles}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Tag text={ex.sets + " × " + ex.reps} color={C.primary} />
                <Tag text={ex.rest} color={C.secondary} />
              </div>
              <span style={{ color: C.muted, fontSize: 18, marginLeft: 4 }}>{expandedEx === i ? "▲" : "▼"}</span>
            </div>
            {expandedEx === i && (
              <div style={{ padding: "0 18px 16px", borderTop: "1px solid " + C.border }}>
                <div style={{ paddingTop: 14, display: "flex", gap: 10, marginBottom: 12 }}>
                  {[["Series", ex.sets], ["Reps", ex.reps], ["Descanso", ex.rest], ["Carga", ex.load]].map(([l, v]) => (
                    <div key={l} style={{ flex: 1, background: C.surface, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.primary }}>{v}</div>
                      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: C.secondary + "22", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.secondary, marginBottom: 12 }}>
                  💡 {ex.instructions}
                </div>
                <a href={ytUrl(ex.name)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#ff000022", border: "1px solid #ff000066", borderRadius: 10, padding: "10px 14px", color: "#ff4444", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  ▶ Ver tutorial en YouTube
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CLIENT TEST SCREEN ────────────────────────────────────────────
function ClientTestScreen({ user, assessment, onSave, onBack }) {
  const [form, setForm] = useState({
    age: assessment?.age || "", weight: assessment?.weight || "", height: assessment?.height || "",
    sex: assessment?.sex || "", injuries: assessment?.injuries || "", goal: assessment?.goal || GOALS[0],
    specific_goal: assessment?.specific_goal || "", gym_exp: assessment?.gym_exp || "",
    gym_days: assessment?.gym_days || 3, session_time: assessment?.session_time || "1 hora",
    fitness_level: assessment?.fitness_level || "", benchmarks: assessment?.benchmarks || "",
    occupation: assessment?.occupation || "", daily_steps: assessment?.daily_steps || "", sleep: assessment?.sleep || "",
  });
  const [saving, setSaving] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const opts = arr => arr.map(o => <option key={o} value={o}>{o}</option>);

  async function handleSave() {
    setSaving(true);
    const data = { ...form, client_completed: true };
    let result;
    if (assessment) {
      const { data: d } = await sb.from("assessments").update(data).eq("client_id", user.id).select().single();
      result = d;
    } else {
      const { data: d } = await sb.from("assessments").insert({ client_id: user.id, ...data }).select().single();
      result = d;
    }
    setSaving(false);
    if (result) onSave(result);
    else alert("Error al guardar. Intentá de nuevo.");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Inicio</button>
        <span style={{ fontWeight: 700 }}>📋 Mi test inicial</span>
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 4px", color: C.primary, fontSize: 15 }}>Datos personales</h3>
          <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px" }}>Tu entrenador usará esta información para crear tu plan personalizado.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Fld label="Edad *"><input style={INP} type="number" value={form.age} onChange={upd("age")} placeholder="25" /></Fld>
              <Fld label="Sexo *">
                <select style={INP} value={form.sex} onChange={upd("sex")}>
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </Fld>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Fld label="Peso (kg) *"><input style={INP} type="number" value={form.weight} onChange={upd("weight")} placeholder="70" /></Fld>
              <Fld label="Altura (cm) *"><input style={INP} type="number" value={form.height} onChange={upd("height")} placeholder="170" /></Fld>
            </div>
            <Fld label="Lesiones o molestias">
              <textarea style={{ ...INP, height: 60, resize: "none" }} value={form.injuries} onChange={upd("injuries")} placeholder="Ej: Dolor de rodilla, problemas de espalda... o Ninguna" />
            </Fld>
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: C.primary, fontSize: 15 }}>Objetivos y nivel</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Fld label="¿Qué querés lograr? *">
              <select style={INP} value={form.goal} onChange={upd("goal")}>{opts(GOALS)}</select>
            </Fld>
            <Fld label="Contame más sobre tu objetivo">
              <textarea style={{ ...INP, height: 60, resize: "none" }} value={form.specific_goal} onChange={upd("specific_goal")} placeholder="Ej: Quiero bajar 5kg antes del verano y tonificar las piernas..." />
            </Fld>
            <Fld label="Experiencia en el gimnasio *">
              <select style={INP} value={form.gym_exp} onChange={upd("gym_exp")}>
                <option value="">Seleccionar</option>
                {opts(["Nunca fui al gimnasio", "Principiante (menos de 6 meses)", "Intermedio (6 meses a 2 años)", "Avanzado (más de 2 años)", "Fui antes, llevo tiempo sin ir"])}
              </select>
            </Fld>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Fld label="Días por semana">
                <select style={INP} value={form.gym_days} onChange={upd("gym_days")}>
                  {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} días</option>)}
                </select>
              </Fld>
              <Fld label="Duración por sesión">
                <select style={INP} value={form.session_time} onChange={upd("session_time")}>
                  {opts(["45 minutos", "1 hora", "1 hora 30 minutos", "2 horas"])}
                </select>
              </Fld>
            </div>
            <Fld label="Condición física actual">
              <select style={INP} value={form.fitness_level} onChange={upd("fitness_level")}>
                <option value="">Seleccionar</option>
                {opts(["Muy sedentario/a", "Poco activo/a", "Moderadamente activo/a", "Activo/a", "Muy activo/a"])}
              </select>
            </Fld>
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: C.primary, fontSize: 15 }}>Vida diaria</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Fld label="¿A qué te dedicás?">
              <input style={INP} value={form.occupation} onChange={upd("occupation")} placeholder="Ej: Estudiante, oficinista, trabajo físico..." />
            </Fld>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Fld label="Pasos diarios aprox.">
                <select style={INP} value={form.daily_steps} onChange={upd("daily_steps")}>
                  <option value="">Seleccionar</option>
                  {opts(["Menos de 3.000 pasos", "3.000 a 6.000 pasos", "6.000 a 10.000 pasos", "Más de 10.000 pasos"])}
                </select>
              </Fld>
              <Fld label="Horas de sueño">
                <select style={INP} value={form.sleep} onChange={upd("sleep")}>
                  <option value="">Seleccionar</option>
                  {opts(["Menos de 6 horas", "6 a 7 horas", "7 a 8 horas", "Más de 8 horas"])}
                </select>
              </Fld>
            </div>
          </div>
        </Card>
        <button onClick={handleSave} disabled={saving || !form.age || !form.weight || !form.height || !form.sex} style={{ ...BTN("primary"), padding: "14px", fontSize: 16 }}>
          {saving ? "Guardando..." : "✓ Guardar mi información"}
        </button>
      </div>
    </div>
  );
}

// ── LOADING ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{GF + " @keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid " + C.primary, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff" }}>Gym<span style={{ color: C.primary }}>OS</span></span>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (_event === "SIGNED_OUT") {
        setSession(null); setProfile(null); setLoading(false);
      } else if (_event === "SIGNED_IN") {
        setSession(session);
        // loadProfile is called by AuthScreen.onAuth after all DB ops complete
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    setLoading(true);
    const { data } = await sb.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function handleLogout() {
    await sb.auth.signOut();
    setSession(null); setProfile(null);
  }

  if (loading) return <LoadingScreen />;
  if (!session) return <AuthScreen onAuth={(userId) => loadProfile(userId)} />;
  if (!profile) return <LoadingScreen />;
  if (profile.role === "trainer") return <TrainerApp user={session.user} profile={profile} onLogout={handleLogout} />;
  return <ClientApp user={session.user} profile={profile} onLogout={handleLogout} />;
}
