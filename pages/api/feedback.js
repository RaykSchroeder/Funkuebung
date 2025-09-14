// pages/api/feedback.js
export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !anon) {
    return res.status(500).json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  if (req.method === "POST") {
    const { message } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message ist erforderlich" });
    }

    try {
      const r = await fetch(`${url}/rest/v1/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ message }),
      });

      if (!r.ok) {
        const err = await r.text();
        return res.status(r.status).json({ error: err || "Fehler beim Speichern" });
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  if (req.method === "GET") {
    // Admin-Check (Passwort im Header schicken)
    if (!process.env.ADMIN_PASS) {
      return res.status(500).json({ error: "ADMIN_PASS ist nicht gesetzt." });
    }
    const pass = req.headers["x-admin-pass"];
    if (pass !== process.env.ADMIN_PASS) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!service) {
      return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE fehlt." });
    }

    try {
      const r = await fetch(`${url}/rest/v1/feedback?select=*&order=created_at.desc`, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
