export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return res
      .status(500)
      .json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  try {
    // Hole alle Szenarien aus Supabase
    const r = await fetch(`${url}/rest/v1/scenarios?select=*`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
    });

    if (!r.ok) {
      const err = await r.text();
      return res
        .status(r.status)
        .json({ error: err || "Fehler beim Laden der Szenarien" });
    }

    const rows = await r.json();

    // === Mapping jeder Zeile in dein App-Format ===
    const mapped = rows.map((row) => {
      const tasks = [
        row.aufgabe1,
        row.aufgabe2,
        row.aufgabe3,
        row.aufgabe4,
        row.aufgabe5,
      ].filter(Boolean);

      const solutions = [
        row.loesung1,
        row.loesung2,
        row.loesung3,
      ].filter(Boolean);

      return {
        team: parseInt(row.gruppe?.replace(/\D/g, "")) || 1,
        code: row.code,
        role: row.rolle,
        title: row.titel,
        description: row.beschreibung,
        fileType: row.bilder?.toLowerCase().includes("bild") ? "image" : null,
        file: row.bilder || null,
        tasks,
        solutionTasks: solutions,
      };
    });

    // === Sortierung nach Gruppe und Code (optional) ===
    mapped.sort((a, b) => {
      if (a.team !== b.team) return a.team - b.team;
      return a.code.localeCompare(b.code);
    });

    return res.status(200).json(mapped);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
