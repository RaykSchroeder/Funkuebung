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

    // Alle relevanten Codes ohne Final
    const expectedCodes = [];
    teamScenarios.forEach((s) => {
      if (!s.isFinal) expectedCodes.push(s.code);
      if (s.subScenarios) {
        s.subScenarios.forEach((sub) => {
          if (!sub.isFinal) expectedCodes.push(sub.code);
        });
      }
    });

    // kompletten Fortschritt laden
    const r = await fetch(`${url}/rest/v1/task_progress?team_id=eq.${teamId}`, {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
    });
    const progress = await r.json();
    if (!r.ok) return res.status(r.status).json(progress);

    // Szenario gilt als erfüllt, wenn mindestens eine Lösung (type=solution) erledigt ist
    const fulfilledCodes = [
      ...new Set(
        progress
          .filter((p) => p.type === "solution" && p.done === true)
          .map((p) => p.scenario_code)
      ),
    ];

    const missing = expectedCodes.filter((code) => !fulfilledCodes.includes(code));

    return res.status(200).json({
      allowed: missing.length === 0,
      expectedCodes,
      fulfilledCodes,
      missing,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
