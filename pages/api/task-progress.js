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

  // ✅ GET (inkl. neuer Prüfung)
  if (req.method === "GET") {
    const { teamId, scenarioCode, role, row } = req.query; // 👈 role & row neu
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

      // ✨ NEU: Prüfung auf vorherige "row"
      let previousDone = true; // Standard: erlaubt, wenn row=1 oder nicht angegeben
      if (row && Number(row) > 1 && role) {
        const prevRow = Number(row) - 1;

        // Hole alle Szenarien mit row-1 und gleicher Rolle (role)
        const prevQuery = `${url}/rest/v1/task_progress?team_id=eq.${teamId}&role=eq.${role}&row=eq.${prevRow}&done=eq.true`;
        const rPrev = await fetch(prevQuery, {
          headers: {
            apikey: service,
            Authorization: `Bearer ${service}`,
          },
        });
        const prevData = await rPrev.json();

        previousDone = Array.isArray(prevData) && prevData.length > 0;
      }

      // Falls gruppiert zurückgegeben wird
      if (scenarioCode === "*") {
        const grouped = data.reduce((acc, entry) => {
          if (!acc[entry.scenario_code]) acc[entry.scenario_code] = [];
          acc[entry.scenario_code].push(entry);
          return acc;
        }, {});
        return res.status(200).json({ grouped, previousDone });
      }

      // Einzelnes Szenario
      return res.status(200).json({ data, previousDone });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  // ✅ PATCH (unverändert)
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
