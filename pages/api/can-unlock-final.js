// pages/api/can-unlock-final.js
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
    const scenariosModule = await import("../../data/scenarios.js");
    const teamScenarios = scenariosModule.default.filter(
      (s) => String(s.team) === String(teamId)
    );

    if (!teamScenarios.length) {
      return res.status(404).json({ error: "Keine Szenarien für Team gefunden" });
    }

    // Alle Codes sammeln (ohne isFinal)
    const expectedCodes = [];
    teamScenarios.forEach((s) => {
      if (!s.isFinal) expectedCodes.push({ code: s.code, title: s.title });
      if (s.subScenarios) {
        s.subScenarios.forEach((sub) => {
          if (!sub.isFinal)
            expectedCodes.push({ code: sub.code, title: sub.title });
        });
      }
    });

    // Fortschritt abrufen
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

    const foundCodes = [...new Set(progress.map((p) => p.scenario_code))];

    // Welche fehlen?
    const missing = expectedCodes.filter(
      (exp) => !foundCodes.includes(exp.code)
    );

    const allCovered = missing.length === 0;

    return res.status(200).json({
      allowed: allCovered,
      expectedCodes,
      foundCodes,
      missingCodes: missing, // 👈 Neu
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
