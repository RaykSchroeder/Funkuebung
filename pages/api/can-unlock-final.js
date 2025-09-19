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
    // 🔹 Alle Szenarios des Teams (inkl. Sub) holen
    const scenariosModule = await import("../../data/scenarios.js");
    const teamScenarios = scenariosModule.default.filter(s => s.team == teamId);

    if (!teamScenarios.length) {
      return res.status(404).json({ error: "Keine Szenarien für Team gefunden" });
    }

    // 🔹 Alle Codes (Haupt + Sub) einsammeln
    const codes = [];
    teamScenarios.forEach(s => {
      codes.push(s.code);
      if (s.subScenarios) {
        s.subScenarios.forEach(sub => codes.push(sub.code));
      }
    });

    // 🔹 Fortschritt aus Supabase abrufen
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

    // 🔹 Check: Hat jedes Szenario mindestens 1 Done?
    const covered = new Set(progress.map(p => p.scenario_code));
    const allCovered = codes.every(code => covered.has(code));

    return res.status(200).json({ allowed: allCovered });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
