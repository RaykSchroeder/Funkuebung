export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    return res.status(500).json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: "teamId fehlt" });

  try {
    // Szenarien aus /data/scenarios.js laden
    const scenariosModule = await import("../../data/scenarios.js");
    const teamScenarios = scenariosModule.default.filter(
      (s) => String(s.team) === String(teamId)
    );

    if (!teamScenarios.length) {
      return res.status(404).json({ error: "Keine Szenarien für Team gefunden" });
    }

    // Erwartete "letzte Tasks" sammeln
    const requiredTasks = [];
    teamScenarios.forEach((s) => {
      if (s.tasks && s.tasks.length > 0) {
        requiredTasks.push({ code: s.code, index: s.tasks.length - 1 });
      }
      if (s.subScenarios) {
        s.subScenarios.forEach((sub) => {
          if (sub.tasks && sub.tasks.length > 0) {
            requiredTasks.push({ code: sub.code, index: sub.tasks.length - 1 });
          }
        });
      }
    });

    // Fortschritt aus DB laden
    const r = await fetch(
      `${url}/rest/v1/task_progress?team_id=eq.${teamId}&done=eq.true`,
      {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      }
    );
    const progress = await r.json();
    if (!r.ok) return res.status(r.status).json(progress);

    // Check: für jeden requiredTask existiert ein done=true Eintrag
    const allDone = requiredTasks.every((reqTask) =>
      progress.some(
        (p) =>
          p.scenario_code === reqTask.code &&
          p.task_index === reqTask.index &&
          p.done === true
      )
    );

    return res.status(200).json({
      allowed: allDone,
      requiredTasks,
      totalRequired: requiredTasks.length,
      totalDone: progress.filter((p) => p.done).length,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
