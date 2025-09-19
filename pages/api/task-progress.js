export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    return res.status(500).json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  // 🔒 Admin-Check
  if (!process.env.ADMIN_PASS) {
    return res.status(500).json({ error: "ADMIN_PASS ist nicht gesetzt." });
  }
  const pass = req.headers["x-admin-pass"];
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ✅ GET: Fortschritt abrufen
  if (req.method === "GET") {
    const { teamId, scenarioCode } = req.query;
    if (!teamId || !scenarioCode) {
      return res.status(400).json({ error: "teamId und scenarioCode sind erforderlich" });
    }

    try {
      const r = await fetch(
        `${url}/rest/v1/task_progress?team_id=eq.${teamId}&scenario_code=eq.${scenarioCode}`,
        {
          headers: {
            apikey: service,
            Authorization: `Bearer ${service}`,
          },
        }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  // ✅ PATCH: Fortschritt speichern/aktualisieren
  if (req.method === "PATCH") {
    const { teamId, scenarioCode, taskIndex, type, done } = req.body;

    if (!teamId || !scenarioCode) {
      return res.status(400).json({ error: "teamId und scenarioCode sind erforderlich" });
    }

    try {
      console.log("➡️ Speichern:", { teamId, scenarioCode, taskIndex, type, done });

      const r = await fetch(
        `${url}/rest/v1/task_progress?on_conflict=team_id,scenario_code,task_index,type`,
        {
          method: "POST", // 👈 wichtig: bleibt POST (Upsert)
          headers: {
            "Content-Type": "application/json",
            apikey: service,
            Authorization: `Bearer ${service}`,
            Prefer: "resolution=merge-duplicates",
          },
          body:
