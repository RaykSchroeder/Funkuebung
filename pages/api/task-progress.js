export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    return res.status(500).json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  // 🔒 Admin-Check (wie gehabt)
  if (!process.env.ADMIN_PASS) {
    return res.status(500).json({ error: "ADMIN_PASS ist nicht gesetzt." });
  }
  const pass = req.headers["x-admin-pass"];
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ✅ GET
  if (req.method === "GET") {
    const { teamId, scenarioCode } = req.query;
    if (!teamId) {
      return res.status(400).json({ error: "teamId ist erforderlich" });
    }

    try {
      let query = `${url}/rest/v1/task_progress?team_id=eq.${teamId}`;
      if (scenarioCode && scenarioCode !== "*") {
        query += `&scenario_code=eq.${scenarioCode}`;
      }

      const r = await fetch(query, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      });

      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);

      // ✨ NEU: alle Szenarien gruppiert zurückgeben
      if (scenarioCode === "*") {
        const grouped = data.reduce((acc, entry) => {
          if (!acc[entry.scenario_code]) acc[entry.scenario_code] = [];
          acc[entry.scenario_code].push(entry);
          return acc;
        }, {});
        return res.status(200).json(grouped);
      }

      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  // ✅ PATCH (wie gehabt)
  if (req.method === "PATCH") {
    const { teamId, scenarioCode, taskIndex, type, done } = req.body;

    if (!teamId || !scenarioCode) {
      return res
        .status(400)
        .json({ error: "teamId und scenarioCode sind erforderlich" });
    }

    try {
      console.log("➡️ Speichern:", {
        teamId,
        scenarioCode,
        taskIndex,
        type,
        done,
      });

      const r = await fetch(
        `${url}/rest/v1/task_progress?on_conflict=team_id,scenario_code,task_index,type`,
        {
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
            done: !!done,
          }),
        }
      );

      const text = await r.text();
      console.log("⬅️ Antwort Supabase:", r.status, text);

      if (!r.ok) return res.status(r.status).json({ error: text });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  // ❌ Andere Methoden blocken
  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method not allowed" });
}
