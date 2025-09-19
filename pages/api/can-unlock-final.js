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
    // Szenarien für das Team laden
    const scenariosModule = await import("../../data/scenarios.js");
    const teamScenarios = scenariosModule.default.filter(
      (s) => String(s.team) === String(teamId)
    );

    if (!teamScenarios.length) {
      return res.status(404).json({ error: "Keine Szenarien für Team gefunden" });
    }

    // Erwartete Codes (alle ohne isFinal)
    const expectedCodes = [];
    teamScenarios.forEach((s) => {
      if (!s.isFinal) {
        expectedCodes.push(s.code);
      }
      if (s.subScenarios) {
        s.subScenarios.forEach((sub) => {
          if (!sub.isFinal) {
            expectedCodes.push(sub.code);
          }
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

    // Gefundene Szenarien mit mindestens einer abgehakten Aufgabe
    const foundCodes = [...new Set(progress.map((p) => p.scenario_code))];

    // Check: Alle expectedCodes müssen in foundCodes drin sein
    const allCovered = expectedCodes.every((code) =>
      foundCodes.includes(code)
    );

    return res.status(200).json({
      allowed: allCovered,
      expectedCodes,
      foundCodes,
      totalExpected: expectedCodes.length,
      totalFound: foundCodes.length,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
