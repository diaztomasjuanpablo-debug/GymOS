export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://nmgptqmyzbakabbwerqx.supabase.co";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!RESEND_API_KEY) return res.status(500).json({ error: "RESEND_API_KEY not configured" });

  const { clientId, clientName, planName, amount, paymentDate, dueDate, gymName } = req.body;

  // Fetch client email from Supabase admin API using service role key
  let to = null;
  if (clientId && SUPABASE_SERVICE_KEY) {
    try {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${clientId}`, {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      });
      const userData = await userRes.json();
      to = userData.email || null;
    } catch (err) {
      console.error("Could not fetch client email:", err);
    }
  }

  if (!to) return res.status(400).json({ error: "No se pudo obtener el email del cliente" });

  const html = `
    <p>Hola <strong>${clientName}</strong>,</p>
    <p>Te confirmamos que tu pago fue registrado correctamente.</p>
    <h3>📋 Detalle:</h3>
    <ul>
      <li><strong>Plan:</strong> ${planName}</li>
      <li><strong>Monto:</strong> $${amount}</li>
      <li><strong>Fecha de pago:</strong> ${paymentDate}</li>
      <li><strong>Próximo vencimiento:</strong> ${dueDate}</li>
    </ul>
    <p>Cualquier consulta, contactate con tu gimnasio.</p>
    <p>— El equipo de <strong>${gymName}</strong></p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${gymName} <onboarding@resend.dev>`,
        to: [to],
        subject: `Confirmación de pago — ${gymName}`,
        html,
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
