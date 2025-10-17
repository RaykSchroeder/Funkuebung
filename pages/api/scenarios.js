export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return res.status(500).json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Code required" });

  try {
    // Hole die Zeile mit passendem Code aus Supabase
    const r = await fetch(`${url}/rest/v1/scenarios?code=eq.${code}&select=*`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: err || "Fehler beim Laden" });
    }

    const rows = await r.json();
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });

    const row = rows[0];

    // === Mapping: Supabase-Zeile → dein altes JSON-Format ===
    const tasks = [
      row.aufgabe1,
      row.aufgabe2,
      row.aufgabe3,
      row.aufgabe4,
      row.aufgabe5,
    ].filter(Boolean);

    const solutions = [row.loesung1, row.loesung2, row.loesung3].filter(Boolean);

    const mapped = {
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

    return res.status(200).json(mapped);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
