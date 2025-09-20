// pages/api/status-progress.js
export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    return res.status(500).json({ error: "Supabase-Variablen fehlen" });
  }

  if (!process.env.ADMIN_PASS) {
    return res.status(500).json({ error: "ADMIN_PASS fehlt" });
  }
  const pass = req.headers["x-admin-pass"];
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const r = await fetch(`${url}/rest/v1/task_progress?select=*`, {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    // Struktur: progress[teamId][scenarioCode] = Anzahl erledigter Lösungstasks
    const progress = {};
    data.forEach((p) => {
      if (!p.done) return; // nur erledigte
      if (!progress[p.team_id]) progress[p.team_id] = {};
      if (!progress[p.team_id][p.scenario_code]) progress[p.team_id][p.scenario_code] = 0;

      // nur Lösungstasks zählen (sub-szenarien haben meist solutionTasks)
      if (p.type === "solution") {
        progress[p.team_id][p.scenario_code] += 1;
      }
    });

    return res.status(200).json(progress);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
