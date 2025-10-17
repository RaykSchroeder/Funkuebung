import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

// Hilfsfunktion, um DB-Zeile in dein bisheriges Format zu konvertieren
function mapRowToScenario(row) {
  const tasks = [
    row.aufgabe1,
    row.aufgabe2,
    row.aufgabe3,
    row.aufgabe4,
    row.aufgabe5,
  ].filter(Boolean);

  const solutions = [row.loesung1, row.loesung2, row.loesung3].filter(Boolean);

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
}

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Code required" });

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) return res.status(404).json({ error: "Not found" });

  // gleiche Struktur wie vorher zurückgeben
  res.status(200).json(mapRowToScenario(data));
}
