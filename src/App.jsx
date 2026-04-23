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
const GF = "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');";

// Machine categories
const MACHINE_CATEGORIES = ["Tren inferior","Tren superior empuje","Tren superior tirón","Core","Cardio","Peso libre","Funcional","Otro"];

// Goal options
const GOALS = ["Ganar masa muscular","Perder grasa corporal","Mejorar fuerza funcional","Mejorar condición física general","Rendimiento deportivo","Rehabilitación y prevención"];

// ── Exercise library ─────────────────────────────────────────────
const EXERCISE_LIBRARY = [
  // PECHO
  { name: "Press de banca plano con barra", category: "Pecho", muscles: "Pectoral mayor, Tríceps, Deltoides anterior", equipment: "Barra" },
  { name: "Press de banca inclinado con barra", category: "Pecho", muscles: "Pectoral mayor (porción clavicular), Tríceps", equipment: "Barra" },
  { name: "Press de banca declinado con barra", category: "Pecho", muscles: "Pectoral mayor (porción esternal), Tríceps", equipment: "Barra" },
  { name: "Press de banca plano con mancuernas", category: "Pecho", muscles: "Pectoral mayor, Tríceps", equipment: "Mancuernas" },
  { name: "Press de banca inclinado con mancuernas", category: "Pecho", muscles: "Pectoral mayor (porción clavicular)", equipment: "Mancuernas" },
  { name: "Aperturas con mancuernas en banco plano", category: "Pecho", muscles: "Pectoral mayor, Deltoides anterior", equipment: "Mancuernas" },
  { name: "Aperturas en banco inclinado con mancuernas", category: "Pecho", muscles: "Pectoral mayor (porción clavicular)", equipment: "Mancuernas" },
  { name: "Fondos en paralelas (pecho)", category: "Pecho", muscles: "Pectoral mayor, Tríceps, Deltoides", equipment: "Paralelas" },
  { name: "Crossover en polea alta", category: "Pecho", muscles: "Pectoral mayor, Deltoides anterior", equipment: "Polea" },
  { name: "Pullover con mancuerna", category: "Pecho", muscles: "Pectoral mayor, Dorsal ancho", equipment: "Mancuerna" },
  { name: "Flexiones de pecho", category: "Pecho", muscles: "Pectoral mayor, Tríceps, Deltoides", equipment: "Peso corporal" },
  // ESPALDA
  { name: "Dominadas con agarre supino", category: "Espalda", muscles: "Dorsal ancho, Bíceps, Romboides", equipment: "Barra fija" },
  { name: "Dominadas con agarre prono", category: "Espalda", muscles: "Dorsal ancho, Romboides, Trapecios", equipment: "Barra fija" },
  { name: "Remo con barra", category: "Espalda", muscles: "Dorsal ancho, Romboides, Trapecios medios, Bíceps", equipment: "Barra" },
  { name: "Remo con mancuerna a una mano", category: "Espalda", muscles: "Dorsal ancho, Romboides, Redondo mayor", equipment: "Mancuerna" },
  { name: "Remo en polea baja (cable)", category: "Espalda", muscles: "Dorsal ancho, Romboides, Trapecios medios", equipment: "Polea" },
  { name: "Jalón al pecho en polea alta", category: "Espalda", muscles: "Dorsal ancho, Bíceps, Romboides", equipment: "Polea" },
  { name: "Jalón tras nuca en polea alta", category: "Espalda", muscles: "Dorsal ancho, Bíceps", equipment: "Polea" },
  { name: "Remo en máquina (Hammer Strength)", category: "Espalda", muscles: "Dorsal ancho, Romboides, Trapecios", equipment: "Máquina" },
  { name: "Peso muerto convencional", category: "Espalda", muscles: "Erector espinal, Glúteos, Isquiotibiales, Trapecios", equipment: "Barra" },
  { name: "Peso muerto rumano", category: "Espalda", muscles: "Isquiotibiales, Glúteos, Erector espinal", equipment: "Barra" },
  { name: "Hiperextensiones en banco romano", category: "Espalda", muscles: "Erector espinal, Glúteos, Isquiotibiales", equipment: "Banco romano" },
  // HOMBROS
  { name: "Press militar con barra de pie", category: "Hombros", muscles: "Deltoides (todas las porciones), Tríceps, Trapecios", equipment: "Barra" },
  { name: "Press militar con mancuernas sentado", category: "Hombros", muscles: "Deltoides anterior y medio, Tríceps", equipment: "Mancuernas" },
  { name: "Elevaciones laterales con mancuernas", category: "Hombros", muscles: "Deltoides medio", equipment: "Mancuernas" },
  { name: "Elevaciones frontales con mancuernas", category: "Hombros", muscles: "Deltoides anterior", equipment: "Mancuernas" },
  { name: "Elevaciones laterales en polea baja", category: "Hombros", muscles: "Deltoides medio", equipment: "Polea" },
  { name: "Pájaro (elevaciones posteriores con mancuernas)", category: "Hombros", muscles: "Deltoides posterior, Romboides", equipment: "Mancuernas" },
  { name: "Face pull en polea alta", category: "Hombros", muscles: "Deltoides posterior, Romboides, Rotadores externos", equipment: "Polea" },
  { name: "Encogimientos de hombros con barra (Shrugs)", category: "Hombros", muscles: "Trapecios superiores", equipment: "Barra" },
  { name: "Encogimientos de hombros con mancuernas", category: "Hombros", muscles: "Trapecios superiores", equipment: "Mancuernas" },
  // BÍCEPS
  { name: "Curl de bíceps con barra recta", category: "Bíceps", muscles: "Bíceps braquial, Braquial anterior", equipment: "Barra" },
  { name: "Curl de bíceps con barra Z (EZ)", category: "Bíceps", muscles: "Bíceps braquial, Braquirradial", equipment: "Barra EZ" },
  { name: "Curl alterno con mancuernas de pie", category: "Bíceps", muscles: "Bíceps braquial, Braquial anterior", equipment: "Mancuernas" },
  { name: "Curl martillo con mancuernas", category: "Bíceps", muscles: "Braquirradial, Bíceps braquial", equipment: "Mancuernas" },
  { name: "Curl en banco Scott (predicador)", category: "Bíceps", muscles: "Bíceps braquial (porción corta)", equipment: "Banco Scott" },
  { name: "Curl concentrado con mancuerna", category: "Bíceps", muscles: "Bíceps braquial", equipment: "Mancuerna" },
  { name: "Curl en polea baja con barra", category: "Bíceps", muscles: "Bíceps braquial", equipment: "Polea" },
  // TRÍCEPS
  { name: "Press francés con barra EZ (tumbado)", category: "Tríceps", muscles: "Tríceps braquial (las 3 porciones)", equipment: "Barra EZ" },
  { name: "Extensión de tríceps en polea alta con cuerda", category: "Tríceps", muscles: "Tríceps braquial", equipment: "Polea" },
  { name: "Extensión de tríceps en polea alta con barra", category: "Tríceps", muscles: "Tríceps braquial", equipment: "Polea" },
  { name: "Fondos en paralelas (tríceps)", category: "Tríceps", muscles: "Tríceps braquial, Pectoral menor", equipment: "Paralelas" },
  { name: "Patada de tríceps con mancuerna", category: "Tríceps", muscles: "Tríceps braquial (porción larga)", equipment: "Mancuerna" },
  { name: "Press cerrado con barra", category: "Tríceps", muscles: "Tríceps braquial, Pectoral, Deltoides anterior", equipment: "Barra" },
  { name: "Extensión de tríceps sobre la cabeza con mancuerna", category: "Tríceps", muscles: "Tríceps braquial (porción larga)", equipment: "Mancuerna" },
  // PIERNAS
  { name: "Sentadilla con barra (back squat)", category: "Piernas", muscles: "Cuádriceps, Glúteos, Isquiotibiales, Erector espinal", equipment: "Barra" },
  { name: "Sentadilla frontal con barra", category: "Piernas", muscles: "Cuádriceps, Glúteos, Core", equipment: "Barra" },
  { name: "Sentadilla goblet con mancuerna", category: "Piernas", muscles: "Cuádriceps, Glúteos, Core", equipment: "Mancuerna" },
  { name: "Prensa de piernas 45°", category: "Piernas", muscles: "Cuádriceps, Glúteos, Isquiotibiales", equipment: "Máquina" },
  { name: "Extensión de cuádriceps en máquina", category: "Piernas", muscles: "Cuádriceps", equipment: "Máquina" },
  { name: "Curl de isquiotibiales tumbado en máquina", category: "Piernas", muscles: "Isquiotibiales", equipment: "Máquina" },
  { name: "Curl de isquiotibiales sentado en máquina", category: "Piernas", muscles: "Isquiotibiales", equipment: "Máquina" },
  { name: "Zancadas con mancuernas (lunges)", category: "Piernas", muscles: "Cuádriceps, Glúteos, Isquiotibiales", equipment: "Mancuernas" },
  { name: "Zancadas caminando con barra", category: "Piernas", muscles: "Cuádriceps, Glúteos, Isquiotibiales", equipment: "Barra" },
  { name: "Sentadilla búlgara (split squat)", category: "Piernas", muscles: "Cuádriceps, Glúteos, Isquiotibiales", equipment: "Mancuernas" },
  { name: "Hip thrust con barra", category: "Piernas", muscles: "Glúteos, Isquiotibiales", equipment: "Barra" },
  { name: "Glute bridge con barra", category: "Piernas", muscles: "Glúteos, Isquiotibiales", equipment: "Barra" },
  { name: "Elevación de talones de pie (pantorrillas)", category: "Piernas", muscles: "Gastrocnemio, Sóleo", equipment: "Máquina o peso corporal" },
  { name: "Elevación de talones sentado (pantorrillas)", category: "Piernas", muscles: "Sóleo", equipment: "Máquina" },
  { name: "Abducción de cadera en máquina", category: "Piernas", muscles: "Glúteo medio, Glúteo menor, TFL", equipment: "Máquina" },
  { name: "Aducción de cadera en máquina", category: "Piernas", muscles: "Aductores", equipment: "Máquina" },
  { name: "Step-up con mancuernas", category: "Piernas", muscles: "Cuádriceps, Glúteos, Isquiotibiales", equipment: "Mancuernas" },
  // ABDOMINALES / CORE
  { name: "Crunch abdominal en suelo", category: "Abdominales", muscles: "Recto abdominal", equipment: "Peso corporal" },
  { name: "Crunch en máquina de abdominales", category: "Abdominales", muscles: "Recto abdominal", equipment: "Máquina" },
  { name: "Plancha frontal", category: "Abdominales", muscles: "Core completo, Transverso abdominal", equipment: "Peso corporal" },
  { name: "Plancha lateral", category: "Abdominales", muscles: "Oblicuos, Core lateral", equipment: "Peso corporal" },
  { name: "Elevación de piernas colgado en barra", category: "Abdominales", muscles: "Recto abdominal inferior, Flexores de cadera", equipment: "Barra fija" },
  { name: "Elevación de piernas en banco plano", category: "Abdominales", muscles: "Recto abdominal inferior, Psoas ilíaco", equipment: "Banco" },
  { name: "Rueda abdominal (ab wheel)", category: "Abdominales", muscles: "Core completo, Dorsal, Hombros", equipment: "Rueda" },
  { name: "Encogimiento de rodillas en polea alta", category: "Abdominales", muscles: "Recto abdominal", equipment: "Polea" },
  { name: "Russian twist con disco", category: "Abdominales", muscles: "Oblicuos, Recto abdominal", equipment: "Disco" },
  { name: "Dead bug", category: "Abdominales", muscles: "Core profundo, Transverso abdominal", equipment: "Peso corporal" },
  // CARDIO / FUNCIONAL
  { name: "Burpees", category: "Cardio/Funcional", muscles: "Cuerpo completo", equipment: "Peso corporal" },
  { name: "Saltos al cajón (box jumps)", category: "Cardio/Funcional", muscles: "Cuádriceps, Glúteos, Pantorrillas", equipment: "Cajón pliométrico" },
  { name: "Caminata en cinta", category: "Cardio/Funcional", muscles: "Piernas, Core", equipment: "Cinta" },
  { name: "Trote en cinta", category: "Cardio/Funcional", muscles: "Piernas, Core, Cardiovascular", equipment: "Cinta" },
  { name: "Bicicleta estática", category: "Cardio/Funcional", muscles: "Cuádriceps, Isquiotibiales, Glúteos", equipment: "Bicicleta" },
  { name: "Elíptica", category: "Cardio/Funcional", muscles: "Piernas, Brazos, Cardiovascular", equipment: "Elíptica" },
  { name: "Remo en máquina (ergómetro)", category: "Cardio/Funcional", muscles: "Espalda, Piernas, Core, Brazos", equipment: "Máquina de remo" },
  { name: "Saltar la soga", category: "Cardio/Funcional", muscles: "Pantorrillas, Coordinación, Cardiovascular", equipment: "Soga" },
  { name: "Mountain climbers", category: "Cardio/Funcional", muscles: "Core, Hombros, Flexores de cadera", equipment: "Peso corporal" },
];

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
  bg: "#070a12", surface: "#0d1220", card: "#111831",
  primary: "#22e4c7", secondary: "#7c8dff", accent: "#ffb347",
  danger: "#ff6b8a", text: "#eaf0ff", muted: "#6c7aa0",
  border: "#1a2238", borderStrong: "#283352",
  pos: "#22e4a0", neg: "#ff6b8a", warn: "#ffb347",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  sans: "'Space Grotesk', system-ui, sans-serif",
};

const INP = {
  width: "100%", background: "#0d1220", border: "1px solid #1a2238",
  borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
  color: "#eaf0ff", boxSizing: "border-box", fontFamily: "inherit",
};

const BTN = (variant = "primary") => ({
  background: variant === "primary" ? C.primary : variant === "danger" ? C.danger : "transparent",
  color: variant === "primary" ? "#000" : C.text,
  border: variant === "ghost" ? "1px solid " + C.borderStrong : "none",
  borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
});

function Tag({ text, color = "#7c8dff", bg }) {
  return <span style={{ background: bg || color + "18", color, fontSize: 10, fontWeight: 500, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap", border: "1px solid " + color + "33", fontFamily: C.mono, letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</span>;
}

function Card({ children, style = {}, glow }) {
  return <div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, padding: 20, boxShadow: glow ? `0 0 0 1px ${C.primary}22, 0 20px 40px -20px ${C.primary}22` : "none", ...style }}>{children}</div>;
}

function Eyebrow({ children, color = C.muted, style = {} }) {
  return <div style={{ fontFamily: C.mono, fontSize: 10, color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, ...style }}>{children}</div>;
}

function Sparkline({ data, w = 120, h = 28, color = "currentColor", fill = null, strokeWidth = 1.5 }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * h]);
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {fill && <path d={d + ` L ${w} ${h} L 0 ${h} Z`} fill={fill} />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Ring({ value = 0.7, size = 80, strokeWidth = 6, color = "currentColor", track = C.border, children }) {
  const r = (size - strokeWidth) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - value)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

function Bars({ data, w = 140, h = 36, color = "currentColor", gap = 2, radius = 1 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data) || 1, bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {data.map((v, i) => { const bh = (v / max) * h; return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} fill={color} rx={radius}/>; })}
    </svg>
  );
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
          // Trainer registration — strictly sequential to avoid race conditions:
          // 1) auth user, 2) gym (need gym.id first), 3) profile with gym_id already set
          const { data: authData, error: authError } = await sb.auth.signUp({ email: form.email, password: form.password });
          if (authError) {
            console.error("[Trainer register] signUp error:", authError);
            throw authError;
          }
          if (!authData.user) throw new Error("No se pudo crear el usuario. Intentá de nuevo.");

          const userId = authData.user.id;

          const inviteCode = uid6();
          const { data: gym, error: gymError } = await sb.from("gyms").insert({
            name: form.gym_name || "Mi Gimnasio", owner_id: userId, invite_code: inviteCode
          }).select().single();
          if (gymError) {
            console.error("[Trainer register] gyms insert error:", gymError);
            throw new Error("No se pudo crear el gimnasio: " + gymError.message);
          }

          const { error: profileError } = await sb.from("profiles").insert({
            id: userId, role, full_name: form.full_name, phone: form.phone,
            status: "active", gym_id: gym.id
          });
          if (profileError) {
            console.error("[Trainer register] profiles insert error:", profileError);
            throw new Error("No se pudo crear el perfil: " + profileError.message);
          }

          onAuth(userId);
        }
      }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif" }}>
      <style>{GF}</style>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
            <span style={{ color: C.primary }}>◆</span> GymOS
          </h1>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>El sistema operativo de tu gimnasio</p>
        </div>

        {/* Gym banner when coming from invite link */}
        {gymFromUrl && (
          <div style={{ background: C.primary + "18", border: "1px solid " + C.primary + "55", borderRadius: 14, padding: "14px 18px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6, color: C.primary }}>◆</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: C.primary, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em" }}>{gymFromUrl.name}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Creá tu cuenta para unirte a este gimnasio</div>
          </div>
        )}

        <Card>
          {/* Mode toggle */}
          <div style={{ display: "flex", background: C.surface, borderRadius: 10, padding: 4, marginBottom: 24 }}>
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
                      {[["trainer","Entrenador / Dueño"],["client","Cliente del gym"]].map(([r,l]) => (
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
            {error && <div style={{ background: "#ff6b8a22", border: "1px solid " + C.danger, borderRadius: 10, padding: "10px 14px", color: C.danger, fontSize: 13 }}>{error}</div>}
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
  const [plans, setPlans] = useState([]);
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
      const { data: plansData } = await sb.from("membership_plans").select("*").eq("gym_id", gymData.id).order("price");
      setPlans(plansData || []);
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
    return <ClientProfileTrainer client={selectedClient} gym={gym} machines={machines} plans={plans} onBack={() => { sessionStorage.removeItem("trainer_client_id"); goScreen("dashboard"); loadAll(); }} />;
  }
  if (screen === "machines") {
    return <MachinesScreen gym={gym} machines={machines} onBack={() => { goScreen("dashboard"); loadAll(); }} />;
  }
  if (screen === "plans") {
    return <MembershipPlansScreen gym={gym} onBack={() => { goScreen("dashboard"); loadAll(); }} />;
  }
  if (screen === "qr") {
    return <QRScreen gym={gym} onBack={() => goScreen("dashboard")} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text }}>
      <style>{GF}</style>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}><span style={{ color: C.primary }}>◆</span> GymOS <span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>— {gym?.name || "Panel"}</span></h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {gym?.invite_code && (
            <div style={{ background: C.primary + "22", border: "1px solid " + C.primary + "44", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted }}>Código del gym:</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.primary, letterSpacing: "0.15em" }}>{gym.invite_code}</span>
            </div>
          )}
          <button onClick={() => goScreen("qr")} style={{ ...BTN("primary"), padding: "8px 16px", fontSize: 13 }}>QR del día</button>
          <button onClick={() => goScreen("machines")} style={{ ...BTN("ghost"), padding: "8px 16px", fontSize: 13 }}>Máquinas</button>
          <button onClick={() => goScreen("plans")} style={{ ...BTN("ghost"), padding: "8px 16px", fontSize: 13 }}>Planes</button>
          {gym?.invite_code && (
            <button onClick={() => {
              const link = window.location.origin + "/join/" + gym.invite_code;
              navigator.clipboard.writeText(link).then(() => alert("✓ Link copiado: " + link));
            }} style={{ ...BTN("ghost"), padding: "8px 16px", fontSize: 13 }}>Copiar link</button>
          )}
          <button onClick={onLogout} style={{ ...BTN("ghost"), padding: "8px 14px", fontSize: 13 }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Clientes activos", value: active.length, color: C.primary },
            { label: "Pendientes de activar", value: pending.length, color: C.warn },
            { label: "Máquinas disponibles", value: machines.filter(m => m.available).length, color: C.secondary },
            { label: "Cuotas vencidas", value: clients.filter(c => c.payments?.some(p => p.status === "overdue")).length, color: C.danger },
          ].map(s => (
            <Card key={s.label}>
              <Eyebrow>{s.label}</Eyebrow>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color, letterSpacing: "-0.03em", marginTop: 8 }}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Pending activation */}
        {pending.length > 0 && (
          <Card style={{ marginBottom: 20, borderColor: C.accent + "44" }}>
            <h3 style={{ margin: "0 0 14px", color: C.warn, fontSize: 14, fontWeight: 600 }}>Clientes pendientes de activar ({pending.length})</h3>
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
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.secondary},${C.primary})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#000", flexShrink: 0 }}>
                  {(c.full_name || "C")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.full_name || "—"}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{c.assessments?.goal || "Sin objetivo cargado"}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {hasAssessment ? <Tag text="✓ Test" color={C.primary} /> : <Tag text="Sin test" color={C.muted} />}
                  {payStatus === "overdue" && <Tag text="Vencida" color={C.danger} />}
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
// ── EditPlanModal ─────────────────────────────────────────────────
function EditPlanModal({ plan, clientId, onClose, onSave }) {
  const days = plan.plan_data?.days || [];
  const [editedDays, setEditedDays] = useState(days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) })));
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [addingEx, setAddingEx] = useState(false);

  const normalize = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = search.length >= 2
    ? EXERCISE_LIBRARY.filter(e => normalize(e.name).includes(normalize(search)) || normalize(e.category).includes(normalize(search))).slice(0, 8)
    : [];

  const currentDay = editedDays[selectedDayIdx];

  function updateExField(exIdx, field, value) {
    setEditedDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[selectedDayIdx].exercises[exIdx] = { ...next[selectedDayIdx].exercises[exIdx], [field]: value };
      return next;
    });
  }

  function removeEx(exIdx) {
    setEditedDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[selectedDayIdx].exercises.splice(exIdx, 1);
      return next;
    });
  }

  function addFromLibrary(libEx) {
    setEditedDays(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[selectedDayIdx].exercises.push({ name: libEx.name, muscles: libEx.muscles, sets: 3, reps: "10-12", rest: "60 seg", load: "Moderada", instructions: "" });
      return next;
    });
    setSearch("");
    setAddingEx(false);
  }

  async function handleSave() {
    setSaving(true);
    const newPlanData = { ...plan.plan_data, days: editedDays };
    await onSave(plan.id, newPlanData);
    setSaving(false);
    onClose();
  }

  const INP_SM = { ...INP, padding: "6px 10px", fontSize: 13 };
  const weeks = [...new Set(editedDays.map(d => d.week))];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "24px 16px" }}>
      <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 18, width: "100%", maxWidth: 900, fontFamily: C.sans }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid " + C.border }}>
          <div>
            <Eyebrow color={C.primary}>Editar plan</Eyebrow>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, letterSpacing: "-0.02em", color: C.text }}>
              {plan.plan_data?.summary?.slice(0, 60) || "Plan del mes"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: 500 }}>
          {/* Day selector sidebar */}
          <div style={{ borderRight: "1px solid " + C.border, padding: "16px 12px", overflowY: "auto", maxHeight: 680 }}>
            <Eyebrow style={{ padding: "0 8px", marginBottom: 10 }}>Días del plan</Eyebrow>
            {weeks.map(wk => (
              <div key={wk} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: C.mono, color: C.muted, letterSpacing: "0.12em", padding: "4px 8px", textTransform: "uppercase" }}>Semana {wk}</div>
                {editedDays.filter(d => d.week === wk).map(d => {
                  const idx = editedDays.indexOf(d);
                  const active = idx === selectedDayIdx;
                  return (
                    <button key={idx} onClick={() => { setSelectedDayIdx(idx); setSearch(""); setAddingEx(false); }} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 10, marginBottom: 3,
                      background: active ? C.primary + "18" : "transparent",
                      border: active ? "1px solid " + C.primary + "55" : "1px solid transparent",
                      color: active ? C.primary : C.text, cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400,
                    }}>
                      <div style={{ fontSize: 10, fontFamily: C.mono, color: active ? C.primary : C.muted, marginBottom: 2 }}>Día {d.day_number}</div>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name?.split("—")[1]?.trim() || d.name}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Edit panel */}
          <div style={{ padding: "20px 24px", overflowY: "auto", maxHeight: 680 }}>
            {currentDay && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{currentDay.name}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{currentDay.focus}</div>
                </div>

                {/* Exercise list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currentDay.exercises.map((ex, exIdx) => (
                    <div key={exIdx} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px" }}>
                      {/* Name with inline search */}
                      <div style={{ position: "relative", marginBottom: 10 }}>
                        <input
                          style={{ ...INP_SM, color: C.text, fontWeight: 500 }}
                          value={ex.name}
                          onChange={e => { updateExField(exIdx, "name", e.target.value); setSearch(e.target.value); setAddingEx(false); }}
                          onFocus={e => setSearch(e.target.value)}
                          placeholder="Nombre del ejercicio..."
                        />
                        {search.length >= 2 && filtered.length > 0 && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: "1px solid " + C.border, borderRadius: 10, zIndex: 10, marginTop: 4, maxHeight: 200, overflowY: "auto" }}>
                            {filtered.map((lib, li) => (
                              <div key={li} onClick={() => { updateExField(exIdx, "name", lib.name); updateExField(exIdx, "muscles", lib.muscles); setSearch(""); }}
                                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: li < filtered.length - 1 ? "1px solid " + C.border : "none" }}
                                onMouseEnter={e => e.currentTarget.style.background = C.card}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <div style={{ fontSize: 13, color: C.text }}>{lib.name}</div>
                                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lib.category} · {lib.muscles}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fields row */}
                      <div style={{ display: "grid", gridTemplateColumns: "80px 100px 110px 1fr auto", gap: 8, alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 9, fontFamily: C.mono, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Series</div>
                          <input style={INP_SM} type="number" min={1} max={10} value={ex.sets} onChange={e => updateExField(exIdx, "sets", parseInt(e.target.value) || 1)} />
                        </div>
                        <div>
                          <div style={{ fontSize: 9, fontFamily: C.mono, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Reps</div>
                          <input style={INP_SM} value={ex.reps} onChange={e => updateExField(exIdx, "reps", e.target.value)} placeholder="10-12" />
                        </div>
                        <div>
                          <div style={{ fontSize: 9, fontFamily: C.mono, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Descanso</div>
                          <input style={INP_SM} value={ex.rest} onChange={e => updateExField(exIdx, "rest", e.target.value)} placeholder="60 seg" />
                        </div>
                        <div>
                          <div style={{ fontSize: 9, fontFamily: C.mono, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Músculos</div>
                          <input style={{ ...INP_SM, color: C.muted }} value={ex.muscles || ""} onChange={e => updateExField(exIdx, "muscles", e.target.value)} placeholder="Músculos trabajados" />
                        </div>
                        <button onClick={() => removeEx(exIdx)} style={{ background: C.danger + "18", border: "1px solid " + C.danger + "44", color: C.danger, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 18 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add exercise */}
                <div style={{ marginTop: 14, position: "relative" }}>
                  {addingEx ? (
                    <div>
                      <input
                        autoFocus
                        style={{ ...INP, marginBottom: 0 }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar ejercicio... (ej: sentadilla, press, curl)"
                      />
                      {search.length >= 2 && filtered.length > 0 && (
                        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 10, marginTop: 4, maxHeight: 220, overflowY: "auto" }}>
                          {filtered.map((lib, li) => (
                            <div key={li} onClick={() => addFromLibrary(lib)}
                              style={{ padding: "11px 16px", cursor: "pointer", borderBottom: li < filtered.length - 1 ? "1px solid " + C.border : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                              onMouseEnter={e => e.currentTarget.style.background = C.card}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <div>
                                <div style={{ fontSize: 13, color: C.text }}>{lib.name}</div>
                                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lib.category} · {lib.muscles}</div>
                              </div>
                              <span style={{ fontSize: 11, color: C.primary, fontFamily: C.mono }}>+ Agregar</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {search.length >= 2 && filtered.length === 0 && (
                        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 10, marginTop: 4, padding: "14px 16px", fontSize: 13, color: C.muted }}>Sin resultados para "{search}"</div>
                      )}
                      <button onClick={() => { setAddingEx(false); setSearch(""); }} style={{ ...BTN("ghost"), marginTop: 8, fontSize: 12, padding: "7px 14px" }}>Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingEx(true); setSearch(""); }} style={{ ...BTN("ghost"), fontSize: 13, padding: "10px 18px", width: "100%" }}>
                      + Agregar ejercicio
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid " + C.border }}>
          <button onClick={onClose} style={{ ...BTN("ghost"), padding: "10px 22px" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ ...BTN("primary"), padding: "10px 28px", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientProfileTrainer({ client, gym, machines, plans, onBack }) {
  const [tab, setTab] = useState("perfil");
  const [assessment, setAssessment] = useState(client.assessments || null);
  const [plan, setPlan] = useState(null);
  const [payments, setPayments] = useState(client.payments || []);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [physTest, setPhysTest] = useState({});
  const [newPayment, setNewPayment] = useState({ plan_id: "", payment_date: today(), notes: "" });
  const [editingPlan, setEditingPlan] = useState(false);

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

  async function savePlanEdits(planId, newPlanData) {
    const { data } = await sb.from("workout_plans").update({ plan_data: newPlanData }).eq("id", planId).select().single();
    if (data) setPlan(data);
  }

  async function saveBodyAnalysis(data) {
    await sb.from("assessments").update({ ...data, analysis_date: today() }).eq("client_id", client.id);
    setAssessment(prev => ({ ...prev, ...data }));
    alert("Análisis corporal guardado ✓");
  }

  async function addPayment() {
    if (!newPayment.plan_id) return;
    const selectedPlan = plans.find(p => p.id === newPayment.plan_id);
    if (!selectedPlan) return;
    const paymentDate = newPayment.payment_date || today();
    const due = new Date(paymentDate);
    due.setDate(due.getDate() + 30);
    const dueDate = due.toISOString().split("T")[0];
    const { data } = await sb.from("payments").insert({
      client_id: client.id, gym_id: gym.id,
      plan_id: newPayment.plan_id,
      amount: selectedPlan.price,
      payment_date: paymentDate,
      due_date: dueDate,
      paid_date: paymentDate,
      notes: newPayment.notes || selectedPlan.name,
      status: "paid",
    }).select().single();
    if (data) {
      setPayments(prev => [...prev, data]);
      setNewPayment({ plan_id: "", payment_date: today(), notes: "" });
      // Send confirmation email — fire and forget, never blocks the payment
      fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.full_name || "Cliente",
          planName: selectedPlan.name,
          amount: selectedPlan.price.toLocaleString(),
          paymentDate: fmtDate(paymentDate),
          dueDate: fmtDate(dueDate),
          gymName: gym.name,
        }),
      }).catch(err => console.error("Email no enviado:", err));
    }
  }

  async function deletePayment(payId) {
    if (!confirm("¿Eliminar este registro de pago? Esta acción no se puede deshacer.")) return;
    const { error } = await sb.from("payments").delete().eq("id", payId);
    if (!error) {
      setPayments(prev => prev.filter(p => p.id !== payId));
      alert("Registro eliminado");
    } else {
      alert("Error al eliminar: " + error.message);
    }
  }

  async function updatePaymentStatus(payId, status) {
    await sb.from("payments").update({ status, paid_date: status === "paid" ? today() : null }).eq("id", payId);
    setPayments(prev => prev.map(p => p.id === payId ? { ...p, status } : p));
  }

  const TABS = [["perfil","Perfil"],["test","Test físico"],["plan","Plan actual"],["analisis","Análisis corporal"],["pagos","Pagos"]];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 700 }}>{client.full_name || "Cliente"}</span>
        <Tag text={client.status === "active" ? "Activo" : "Pendiente"} color={client.status === "active" ? C.primary : C.accent} />
        <div style={{ marginLeft: "auto" }}>
          <button onClick={handleGeneratePlan} disabled={generating} style={{ ...BTN("primary"), padding: "8px 18px", fontSize: 13 }}>
            {generating ? "Generando..." : "◆ Generar plan del mes"}
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
              {assessment?.injuries && <div style={{ marginTop: 12, background: "#ff6b8a18", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.danger }}>Lesiones: {assessment.injuries}</div>}
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
                      {[["Bien", C.pos,"✓"],["Regular", C.warn,"~"],["Mal", C.neg,"✗"]].map(([v, col, e]) => {
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
                  {generating ? "Generando..." : "◆ Generar plan del mes"}
                </button>
              </Card>
            ) : (
              <>
                {editingPlan && (
                  <EditPlanModal
                    plan={plan}
                    clientId={client.id}
                    onClose={() => setEditingPlan(false)}
                    onSave={savePlanEdits}
                  />
                )}
                <Card style={{ borderColor: C.primary + "44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ margin: "0 0 8px", color: C.primary, fontFamily: "'Space Grotesk',sans-serif" }}>{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</h3>
                      <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>{plan.plan_data?.summary}</p>
                      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                        <Tag text={plan.days_per_week + " días/semana"} color={C.secondary} />
                        <Tag text={plan.plan_data?.total_days + " días totales"} color={C.primary} />
                      </div>
                    </div>
                    <button onClick={() => setEditingPlan(true)} style={{ ...BTN("ghost"), fontSize: 13, padding: "8px 16px", whiteSpace: "nowrap" }}>✎ Editar plan</button>
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
                        <thead><tr style={{ background: C.surface }}>
                          {["Ejercicio","Series","Reps","Descanso","Músculos","Indicación"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {day.exercises?.map((ex, i) => (
                            <tr key={i} style={{ borderTop: "1px solid " + C.border, background: i % 2 ? C.surface : "transparent" }}>
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
          <PaymentsTab payments={payments} plans={plans} onAdd={addPayment} onUpdateStatus={updatePaymentStatus} onDelete={deletePayment} newPayment={newPayment} setNewPayment={setNewPayment} />
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
      <h3 style={{ margin: "0 0 6px", color: C.primary, fontSize: 15 }}>Análisis corporal del nutricionista</h3>
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

function PaymentsTab({ payments, plans, onAdd, onUpdateStatus, onDelete, newPayment, setNewPayment }) {
  const upd = k => e => setNewPayment(p => ({ ...p, [k]: e.target.value }));
  const statusColors = { pending: C.accent, paid: C.primary, overdue: C.danger };
  const statusLabels = { pending: "Pendiente", paid: "Pagado", overdue: "Vencido" };
  const selectedPlan = plans?.find(p => p.id === newPayment.plan_id);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <h3 style={{ margin: "0 0 16px", color: C.primary, fontSize: 15 }}>Registrar cuota</h3>
        {!plans || plans.length === 0 ? (
          <div style={{ background: C.accent + "18", border: "1px solid " + C.accent + "44", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: C.accent }}>
            No hay planes configurados. Creá planes desde <strong>Planes</strong> en el panel principal.
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Fld label="Plan de membresía *">
                <select style={INP} value={newPayment.plan_id} onChange={upd("plan_id")}>
                  <option value="">Seleccionar plan...</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price?.toLocaleString()}</option>)}
                </select>
              </Fld>
              <Fld label="Fecha de pago">
                <input style={INP} type="date" value={newPayment.payment_date} onChange={upd("payment_date")} />
              </Fld>
            </div>
            {selectedPlan && (
              <div style={{ background: C.primary + "18", border: "1px solid " + C.primary + "33", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontWeight: 800, color: C.primary, fontSize: 16 }}>${selectedPlan.price?.toLocaleString()}</span>
                {selectedPlan.sessions_per_week && <span style={{ color: C.muted }}>{selectedPlan.sessions_per_week}</span>}
                <span style={{ color: C.muted, marginLeft: "auto" }}>Vence en 30 días</span>
              </div>
            )}
            <Fld label="Nota (opcional)">
              <input style={INP} value={newPayment.notes} onChange={upd("notes")} placeholder="Ej: Cuota Abril 2026" />
            </Fld>
            <button onClick={onAdd} disabled={!newPayment.plan_id} style={{ ...BTN("primary"), marginTop: 12, padding: "10px 20px", opacity: !newPayment.plan_id ? 0.5 : 1 }}>+ Registrar cuota</button>
          </>
        )}
      </Card>
      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Historial de pagos</h3>
        {payments.length === 0 ? <p style={{ color: C.muted, fontSize: 14 }}>Sin registros aún.</p> : payments.sort((a, b) => new Date(b.due_date) - new Date(a.due_date)).map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < payments.length - 1 ? "1px solid " + C.border : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>${p.amount?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: C.muted }}>Pagado: {fmtDate(p.payment_date || p.paid_date)} · Vence: {fmtDate(p.due_date)}</div>
              {p.notes && <div style={{ fontSize: 12, color: C.muted }}>{p.notes}</div>}
            </div>
            <Tag text={statusLabels[p.status]} color={statusColors[p.status]} />
            {p.status !== "paid" && <button onClick={() => onUpdateStatus(p.id, "paid")} style={{ ...BTN("primary"), padding: "6px 12px", fontSize: 12 }}>Marcar pagado</button>}
            <button onClick={() => onDelete(p.id)} title="Eliminar registro" style={{ background: "transparent", border: "none", color: C.danger, cursor: "pointer", fontSize: 17, padding: "4px 6px", lineHeight: 1 }}>🗑️</button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── MEMBERSHIP PLANS SCREEN ───────────────────────────────────────
function MembershipPlansScreen({ gym, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "", sessions_per_week: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const updEdit = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    setLoading(true);
    const { data } = await sb.from("membership_plans").select("*").eq("gym_id", gym.id).order("price");
    setPlans(data || []);
    setLoading(false);
  }

  async function addPlan() {
    if (!form.name.trim() || !form.price) return;
    const { data } = await sb.from("membership_plans").insert({
      gym_id: gym.id, name: form.name, price: parseFloat(form.price),
      sessions_per_week: form.sessions_per_week || null,
    }).select().single();
    if (data) { setPlans(prev => [...prev, data]); setForm({ name: "", price: "", sessions_per_week: "" }); }
  }

  async function savePlan(id) {
    if (!editForm.name?.trim() || !editForm.price) return;
    const { data } = await sb.from("membership_plans").update({
      name: editForm.name, price: parseFloat(editForm.price),
      sessions_per_week: editForm.sessions_per_week || null,
    }).eq("id", id).select().single();
    if (data) { setPlans(prev => prev.map(p => p.id === id ? data : p)); setEditingId(null); }
  }

  async function deletePlan(id) {
    if (!confirm("¿Eliminar este plan?")) return;
    await sb.from("membership_plans").delete().eq("id", id);
    setPlans(prev => prev.filter(p => p.id !== id));
  }

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 700 }}>💳 Planes de Membresía</span>
        <Tag text={plans.length + " planes"} color={C.primary} />
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "26px 24px" }}>
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", color: C.primary, fontSize: 14, fontWeight: 700 }}>Crear nuevo plan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <Fld label="Nombre del plan *">
              <input style={INP} value={form.name} onChange={upd("name")} placeholder='Ej: Plan 3 veces por semana' />
            </Fld>
            <Fld label="Precio ($) *">
              <input style={INP} type="number" value={form.price} onChange={upd("price")} placeholder="Ej: 15000" />
            </Fld>
            <Fld label="Descripción corta">
              <input style={INP} value={form.sessions_per_week} onChange={upd("sessions_per_week")} placeholder="Ej: 3 veces/semana" />
            </Fld>
            <button onClick={addPlan} style={{ ...BTN("primary"), padding: "10px 20px", whiteSpace: "nowrap" }}>+ Agregar</button>
          </div>
        </Card>
        {plans.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "48px" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>💳</div>
            <p style={{ fontWeight: 600, color: C.muted, fontSize: 15 }}>Aún no configuraste planes</p>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Creá tu primer plan para poder registrar cuotas de clientes</p>
          </Card>
        ) : (
          <Card>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Planes activos</h3>
            {plans.map((plan, i) => (
              <div key={plan.id} style={{ padding: "14px 0", borderBottom: i < plans.length - 1 ? "1px solid " + C.border : "none" }}>
                {editingId === plan.id ? (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto", gap: 10, alignItems: "end" }}>
                    <Fld label="Nombre"><input style={INP} value={editForm.name} onChange={updEdit("name")} /></Fld>
                    <Fld label="Precio ($)"><input style={INP} type="number" value={editForm.price} onChange={updEdit("price")} /></Fld>
                    <Fld label="Descripción"><input style={INP} value={editForm.sessions_per_week || ""} onChange={updEdit("sessions_per_week")} /></Fld>
                    <button onClick={() => savePlan(plan.id)} style={{ ...BTN("primary"), padding: "8px 14px", fontSize: 13 }}>✓</button>
                    <button onClick={() => setEditingId(null)} style={{ ...BTN("ghost"), padding: "8px 14px", fontSize: 13 }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{plan.name}</div>
                      {plan.sessions_per_week && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{plan.sessions_per_week}</div>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: C.primary, fontFamily: "'Space Grotesk',sans-serif" }}>${plan.price?.toLocaleString()}</div>
                    <button onClick={() => { setEditingId(plan.id); setEditForm({ name: plan.name, price: plan.price, sessions_per_week: plan.sessions_per_week || "" }); }} style={{ ...BTN("ghost"), padding: "6px 14px", fontSize: 12 }}>Editar</button>
                    <button onClick={() => deletePlan(plan.id)} style={{ ...BTN("ghost"), padding: "6px 10px", fontSize: 12, color: C.danger, borderColor: C.danger + "44" }}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 600 }}>Inventario de máquinas</span>
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
            <div style={{ fontSize: 40, marginBottom: 10, color: C.muted }}>◈</div>
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

  const qrImgUrl = qrData ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=GYMOS-${qrData.code}&bgcolor=070a12&color=22e4c7&format=png` : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Panel</button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <span style={{ fontWeight: 600 }}>QR del día</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: C.muted, marginBottom: 8, fontSize: 14 }}>{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, margin: "0 0 32px" }}>Código de asistencia</h2>
          {loading ? <div style={{ color: C.muted }}>Cargando...</div> : qrData ? (
            <>
              <div style={{ background: C.bg, borderRadius: 20, padding: 20, display: "inline-block", border: "1px solid " + C.primary + "55", marginBottom: 24, boxShadow: `0 0 40px -10px ${C.primary}44` }}>
                <img src={qrImgUrl} alt="QR Code" style={{ width: 280, height: 280, display: "block" }} />
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 48, fontWeight: 600, color: C.primary, letterSpacing: "0.2em", marginBottom: 8 }}>{qrData.code}</div>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Los clientes escanean el QR o ingresan el código manualmente en su app</p>
              <button onClick={generateQR} style={{ ...BTN("ghost"), padding: "10px 24px" }}>Regenerar QR</button>
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
    latestPayment.status === "overdue" ? { type: "danger", msg: "Tu cuota está vencida. Contactá al gimnasio." } :
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}><span style={{ color: C.primary }}>◆</span> GymOS</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{profile.full_name || user.email}</span>
          <button onClick={onLogout} style={{ ...BTN("ghost"), padding: "6px 12px", fontSize: 12 }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Status: pending */}
        {profile.status === "pending" && (
          <div style={{ background: C.warn + "22", border: "1px solid " + C.warn + "66", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, color: C.warn, marginBottom: 4 }}>Cuenta pendiente de activación</div>
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
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000", fontSize: 16 }}>◆</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{gym.name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>Tu gimnasio</div>
            </div>
          </Card>
        )}

        {/* Complete test CTA */}
        {profile.status === "active" && !assessment?.client_completed && (
          <Card style={{ borderColor: C.secondary + "66", background: C.secondary + "11" }}>
            <div style={{ fontWeight: 700, color: C.secondary, marginBottom: 6 }}>Completá tu test inicial</div>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px" }}>Necesitamos algunos datos para que tu entrenador pueda crear tu plan personalizado.</p>
            <button onClick={() => setScreen("test")} style={{ ...BTN("primary"), background: C.secondary, padding: "10px 20px", fontSize: 13 }}>Completar test →</button>
          </Card>
        )}

        {/* Today's workout card */}
        {profile.status === "active" && (
          <Card glow style={{ borderColor: C.primary + "44" }}>
            <Eyebrow color={C.primary}>HOY</Eyebrow>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 600, margin: "8px 0 14px", letterSpacing: "-0.02em" }}>
              {todayWorkout ? todayWorkout.name : todayAttendance ? "Entrenamiento completado ✓" : "Rutina del día"}
            </h2>
            {!todayAttendance && plan ? (
              <button onClick={() => setScreen("checkin")} style={{ ...BTN("primary"), padding: "13px 28px", fontSize: 15, width: "100%" }}>
                Escanear QR para desbloquear
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
              <div style={{ fontSize: 32, fontWeight: 700, color: C.primary, letterSpacing: "-0.03em", marginTop: 6 }}>{plan.days_per_week}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>días por semana</div>
            </Card>
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.secondary, marginTop: 6 }}>{MONTHS[new Date().getMonth()]}</div>
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>
      <style>{GF}</style>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px", height: 58, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>← Inicio</button>
        <span style={{ fontWeight: 700 }}>Registrar asistencia</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          {success ? (
            <div>
              <div style={{ fontSize: 60, marginBottom: 16, color: C.primary }}>◆</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, margin: "0 0 8px", color: C.primary, letterSpacing: "-0.02em" }}>¡Asistencia registrada!</h2>
              <p style={{ color: C.muted, fontSize: 14 }}>Abriendo tu rutina de hoy...</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 16, color: C.accent2 || C.secondary }}>◈</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>¿Ya estás en el gym?</h2>
              <p style={{ color: C.muted, fontSize: 14, margin: "0 0 32px", lineHeight: 1.6 }}>Ingresá el código de 6 letras que muestra el entrenador en su pantalla hoy.</p>
              <input
                style={{ ...INP, textAlign: "center", fontSize: 32, fontWeight: 600, letterSpacing: "0.3em", color: C.primary, padding: "16px", marginBottom: 8, fontFamily: C.mono }}
                value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX" maxLength={6}
              />
              {error && <div style={{ background: C.danger + "22", border: "1px solid " + C.danger + "66", borderRadius: 10, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}
              <button onClick={handleCheckin} disabled={loading || code.length !== 6} style={{ ...BTN("primary"), padding: "14px", fontSize: 16, width: "100%", marginTop: 8, opacity: code.length !== 6 ? 0.5 : 1 }}>
                {loading ? "Verificando..." : "Confirmar asistencia"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WORKOUT SCREEN ────────────────────────────────────────────────
const ES_TO_EN = {
  "sentadilla": "barbell squat",
  "sentadilla con barra": "barbell squat",
  "sentadilla frontal": "barbell front squat",
  "prensa de piernas": "leg press",
  "extensión de cuádriceps": "leg extension",
  "curl de isquiotibiales": "lying leg curl",
  "peso muerto rumano": "romanian deadlift",
  "hip thrust": "barbell hip thrust",
  "zancada": "dumbbell lunge",
  "elevación de talones": "standing calf raise",
  "abducción de cadera": "hip abduction",
  "press de banca": "barbell bench press",
  "press de banca inclinado": "incline barbell bench press",
  "press de banca declinado": "decline barbell bench press",
  "aperturas con mancuernas": "dumbbell fly",
  "fondos en paralelas": "chest dip",
  "press con mancuernas": "dumbbell bench press",
  "pullover": "dumbbell pullover",
  "dominadas": "pull-up",
  "remo con barra": "barbell bent over row",
  "remo con mancuerna": "dumbbell row",
  "jalón al pecho": "cable pulldown",
  "remo en polea": "seated cable row",
  "peso muerto": "deadlift",
  "hiperextensiones": "hyperextension",
  "press militar": "barbell shoulder press",
  "elevaciones laterales": "dumbbell lateral raise",
  "elevaciones frontales": "dumbbell front raise",
  "face pull": "face pull",
  "pájaro": "dumbbell rear delt fly",
  "curl con barra": "barbell curl",
  "curl con mancuernas": "dumbbell bicep curl",
  "curl martillo": "hammer curl",
  "curl en polea": "cable curl",
  "extensión de tríceps": "dumbbell tricep extension",
  "press francés": "ezbar french press",
  "jalón de tríceps en polea": "cable triceps pushdown",
  "plancha": "plank",
  "crunch": "crunch",
  "crunch inverso": "reverse crunch",
  "elevación de piernas": "hanging leg raise",
  "rueda abdominal": "ab roller",
  "russian twist": "russian twist",
  "remo inclinado con mancuernas": "incline dumbbell row",
  "remo inclinado": "incline dumbbell row",
  "puente gluteo con mancuerna": "barbell hip thrust",
  "puente gluteo": "barbell hip thrust",
  "flexiones diamante": "push-ups close triceps position",
  "flexiones": "push-up",
  "superman con brazos extendidos": "superman",
  "superman": "superman",
};

let exerciseDBCache = null;

async function translateExerciseNameToEnglish(spanishName) {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 50,
        messages: [{
          role: "user",
          content: `Traducí este ejercicio de gimnasio al inglés para buscar en una base de datos de ejercicios. Devolvé SOLO el nombre en inglés, sin explicación, sin puntos, sin mayúsculas. Ejercicio: "${spanishName}"`
        }]
      })
    });
    const data = await response.json();
    const resultado = data.content[0].text.trim().toLowerCase();
    console.log("DEBUG traduccion IA:", { original: spanishName, traducido: resultado });
    return resultado;
  } catch (e) {
    return null;
  }
}

async function translateInstructions(instructionsArray) {
  if (!instructionsArray || instructionsArray.length === 0) return [];

  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Traducí estas instrucciones de ejercicio al español argentino, de forma clara y directa. Devolvé SOLO un array JSON con las instrucciones traducidas, sin texto adicional ni markdown:\n\n${JSON.stringify(instructionsArray)}`
        }]
      })
    });

    const data = await response.json();
    console.log("DEBUG traduccion raw:", data);
    const text = data.content[0].text.trim();
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.log("ERROR traduccion:", e);
    return instructionsArray;
  }
}

async function fetchExerciseGif(exerciseNameEs) {
  const normalized = exerciseNameEs.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let englishName = null;
  for (const [es, en] of Object.entries(ES_TO_EN)) {
    const normalizedKey = es.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      englishName = en;
      break;
    }
  }

  if (!englishName) {
    englishName = await translateExerciseNameToEnglish(exerciseNameEs);
  }

  console.log("DEBUG ejercicio:", { original: exerciseNameEs, normalized, englishName });

  if (!englishName) return null;

  try {
    if (!exerciseDBCache) {
      const response = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json");
      exerciseDBCache = await response.json();
    }

    const exercises = exerciseDBCache;

function wordOverlap(a, b) {
      const wordsA = a.toLowerCase().split(/\s+/);
      const wordsB = b.toLowerCase().split(/\s+/);
      return wordsA.filter(w => w.length > 2 && wordsB.includes(w)).length;
    }

    let match = exercises.find(ex =>
      ex.name.toLowerCase() === englishName.toLowerCase()
    );

    if (!match) {
      match = exercises.find(ex =>
        ex.name.toLowerCase().includes(englishName.toLowerCase()) ||
        englishName.toLowerCase().includes(ex.name.toLowerCase())
      );
    }

    if (!match) {
      let bestScore = 0;
      let bestMatch = null;
      for (const ex of exercises) {
        const score = wordOverlap(ex.name, englishName);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = ex;
        }
      }
      if (bestScore >= 2) match = bestMatch;
    }

    if (!match) return null;

    return {
      id: match.id,
      name: match.name,
      primaryMuscles: match.primaryMuscles,
      secondaryMuscles: match.secondaryMuscles,
      instructions: match.instructions,
      img0: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${match.id}/0.jpg`,
      img1: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${match.id}/1.jpg`,
    };
  } catch (e) {
    return null;
  }
}

const MUSCLE_TRANSLATIONS = {
  "hamstrings": "isquiotibiales",
  "quadriceps": "cuádriceps",
  "glutes": "glúteos",
  "calves": "pantorrillas",
  "abductors": "abductores",
  "adductors": "aductores",
  "chest": "pecho",
  "pectorals": "pectorales",
  "lats": "dorsales",
  "upper back": "espalda alta",
  "lower back": "zona lumbar",
  "middle back": "espalda media",
  "traps": "trapecios",
  "shoulders": "hombros",
  "delts": "deltoides",
  "biceps": "bíceps",
  "triceps": "tríceps",
  "forearms": "antebrazos",
  "abs": "abdominales",
  "core": "core",
  "neck": "cuello",
  "spine": "columna",
  "serratus anterior": "serrato anterior",
  "rhomboids": "romboides",
  "hip flexors": "flexores de cadera",
  "obliques": "oblicuos",
  "cardiovascular system": "sistema cardiovascular",
};

function ExerciseCard({ ex, index }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("details");
  const [tutorialData, setTutorialData] = useState(null);
  const [tutorialLoading, setTutorialLoading] = useState(false);
  const [tutorialLoaded, setTutorialLoaded] = useState(false);
  const [img1Failed, setImg1Failed] = useState(false);

  async function handleTutorialTab() {
    setTab("tutorial");
    if (!tutorialLoaded) {
      setTutorialLoading(true);
      const data = await fetchExerciseGif(ex.name);
      if (data && data.instructions && data.instructions.length > 0) {
        const translated = await translateInstructions(data.instructions);
        data.instructions = translated;
      }
      setTutorialData(data);
      setTutorialLoading(false);
      setTutorialLoaded(true);
    }
  }

  const chipStyle = {
    background: C.surface,
    border: "1px solid " + C.borderStrong,
    color: C.muted,
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: C.mono,
  };

  const tabStyle = (active) => ({
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid " + C.primary : "2px solid transparent",
    color: active ? C.primary : C.muted,
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
    <div style={{
      background: C.card,
      border: "1px solid " + C.border,
      borderRadius: 16,
      boxShadow: expanded ? "0 4px 16px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.2)",
      marginBottom: 12,
      overflow: "hidden",
      transition: "box-shadow 0.2s ease",
    }}>
      {/* Header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: C.surface, display: "flex", alignItems: "center",
          justifyContent: "center", color: C.primary, fontWeight: 700,
          fontSize: 13, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 8 }}>
            {ex.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ex.sets && <span style={chipStyle}>{ex.sets} series</span>}
            {ex.reps && <span style={chipStyle}>{ex.reps} reps</span>}
            {ex.rest && <span style={chipStyle}>{ex.rest}</span>}
          </div>
        </div>
        <span style={{ color: C.muted, fontSize: 14, marginLeft: 4, transition: "transform 0.2s ease", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", marginTop: 4 }}>▼</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: "1px solid " + C.border }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface }}>
            <button style={tabStyle(tab === "details")} onClick={() => setTab("details")}>Detalles</button>
            <button style={tabStyle(tab === "tutorial")} onClick={handleTutorialTab}>Tutorial</button>
          </div>

          {/* Tab content */}
          <div style={{ padding: "20px 24px" }}>
            {tab === "details" && (
              <div>
                {ex.muscles && (
                  <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                    {ex.muscles}
                  </p>
                )}
                <hr style={{ border: "none", borderTop: "1px solid " + C.border, margin: "0 0 14px" }} />
                <p style={{ fontSize: 15, lineHeight: 1.8, color: C.text, margin: "0 0 16px" }}>
                  {ex.instructions || "Sin instrucciones adicionales."}
                </p>
                {ex.load && (
                  <div style={{ display: "inline-block", background: C.surface, border: "1px solid " + C.border, borderRadius: 8, padding: "4px 12px" }}>
                    <span style={{ fontSize: 12, color: C.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Carga: {ex.load}</span>
                  </div>
                )}
              </div>
            )}
            {tab === "tutorial" && (
              <div>
                {tutorialLoading && (
                  <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Cargando...</p>
                )}
                {!tutorialLoading && tutorialLoaded && !tutorialData && (
                  <p style={{ fontSize: 14, color: C.muted, margin: 0, fontStyle: "italic" }}>Demostración no disponible</p>
                )}
                {!tutorialLoading && tutorialData && (
                  <div>
                    {/* Images side by side */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                      {tutorialData.img0 && (
                        <div style={{ flex: 1, width: img1Failed ? "100%" : "48%" }}>
                          <img src={tutorialData.img0} alt="Posición inicial" style={{ width: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid " + C.border, display: "block" }} />
                          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", margin: "4px 0 0" }}>Inicio</p>
                        </div>
                      )}
                      {tutorialData.img1 && !img1Failed && (
                        <div style={{ flex: 1 }}>
                          <img src={tutorialData.img1} alt="Posición final" onError={() => setImg1Failed(true)} style={{ width: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid " + C.border, display: "block" }} />
                          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", margin: "4px 0 0" }}>Final</p>
                        </div>
                      )}
                    </div>
                    {/* Primary muscle */}
                    {tutorialData.primaryMuscles?.length > 0 && (
                      <p style={{ fontSize: 13, margin: "0 0 14px" }}>
                        <span style={{ color: C.accent, fontWeight: 700 }}>Músculo principal: </span>
                        <span style={{ color: C.text }}>{MUSCLE_TRANSLATIONS[tutorialData.primaryMuscles[0]?.toLowerCase()] || tutorialData.primaryMuscles[0]}</span>
                      </p>
                    )}
                    {/* Instructions from DB */}
                    {tutorialData.instructions?.length > 0 && (
                      <ol style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0, paddingLeft: 20 }}>
                        {tutorialData.instructions.map((step, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutScreen({ workout, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "0 0 40px" }}>
      <style>{GF}</style>
      {/* Top nav */}
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, letterSpacing: "0.5px" }}>← Inicio</button>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>Rutina de hoy</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        {/* Day header */}
        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "22px 24px", marginBottom: 20, boxShadow: `0 0 0 1px ${C.primary}22, 0 20px 40px -20px ${C.primary}22` }}>
          <Eyebrow color={C.primary} style={{ marginBottom: 8 }}>Semana {workout.week} — Día {workout.day_number}</Eyebrow>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, margin: "0 0 6px", color: C.text, letterSpacing: "-0.02em" }}>{workout.name}</h2>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 12px" }}>{workout.focus}</p>
          <hr style={{ border: "none", borderTop: "1px solid " + C.border, margin: "12px 0" }} />
          <span style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {workout.exercises?.length} ejercicios
          </span>
        </div>

        {/* Exercise cards */}
        {workout.exercises?.map((ex, i) => (
          <ExerciseCard key={i} ex={ex} index={i} />
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
    try {
      const payload = { client_id: user.id, ...form, client_completed: true };
      const { data: result, error } = await sb.from("assessments")
        .upsert(payload, { onConflict: "client_id" })
        .select()
        .single();
      if (error) {
        console.error("Supabase error:", JSON.stringify(error));
        throw error;
      }
      if (result) onSave(result);
      else alert("Error al guardar. Intentá de nuevo.");
    } catch (err) {
      console.error("Assessment error:", err);
      alert("Error al guardar: " + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Space Grotesk',sans-serif", color: C.text }}>
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
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif" }}>
      <style>{GF + " @keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid " + C.primary, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}><span style={{ color: C.primary }}>◆</span> GymOS</span>
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
