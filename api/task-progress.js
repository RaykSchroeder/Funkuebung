export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    return res.status(500).json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  if (req.method === "GET") {
    const { teamId, scenarioCode } = req.query;
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

  if (req.method === "PATCH") {
    const { teamId, scenarioCode, taskIndex, type, done } = req.body;
    try {
      const r = await fetch(`${url}/rest/v1/task_progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: service,
          Authorization: `Bearer ${service}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          team_id: teamId,
          scenario_code: scenarioCode,
          task_index: taskIndex,
          type,
          done,
        }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method not allowed" });
}
