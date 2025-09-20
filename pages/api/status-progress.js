// Aggregiert erledigte Einträge (done=true) pro Team und Szenario-Code
export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    return res.status(500).json({ error: "Supabase-Variablen fehlen" });
  }

  // 🔒 Admin-Check
  if (!process.env.ADMIN_PASS) {
    return res.status(500).json({ error: "ADMIN_PASS fehlt" });
  }
  const pass = req.headers["x-admin-pass"];
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Nur erledigte Einträge laden
    const r = await fetch(`${url}/rest/v1/task_progress?done=eq.true&select=team_id,scenario_code`, {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    // Struktur: progress[teamId][scenarioCode] = Anzahl erledigter Einträge
    const progress = {};
    for (const p of data) {
      const t = String(p.team_id);
      const sc = String(p.scenario_code);
      if (!progress[t]) progress[t] = {};
      if (!progress[t][sc]) progress[t][sc] = 0;
      progress[t][sc] += 1;
    }

    return res.status(200).json(progress);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
