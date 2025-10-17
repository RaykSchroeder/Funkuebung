export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;
  const adminPass = process.env.ADMIN_PASS;
  const publicPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // === Grundcheck ===
  if (!url || !service) {
    return res
      .status(500)
      .json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  // === Authentifizierung ===
  const clientPass = req.headers["x-admin-pass"];
  if (clientPass !== adminPass && clientPass !== publicPass) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // === GET: Alle Szenarien laden ===
  if (req.method === "GET") {
    try {
      const r = await fetch(`${url}/rest/v1/scenarios?select=*`, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      });

      const data = await r.json();
      if (!r.ok)
        return res.status(r.status).json({
          error: data?.message || "Fehler beim Laden der Szenarien",
        });

      return res.status(200).json(data);
    } catch (e) {
      console.error("❌ Fehler beim Laden:", e);
      return res
        .status(500)
        .json({ error: e.message || "Unbekannter Serverfehler" });
    }
  }

  // === PATCH: Szenario aktualisieren ===
  if (req.method === "PATCH") {
    try {
      const body = req.body;
      if (!body.code)
        return res.status(400).json({ error: "Code fehlt im Request." });

      // Nur bekannte Felder erlauben (deine Supabase-Struktur)
      const allowedKeys = [
        "gruppe",
        "rolle",
        "code",
        "titel",
        "bilder",
        "beschreibung",
        "aufgabe1",
        "aufgabe2",
        "aufgabe3",
        "aufgabe4",
        "aufgabe5",
        "loesung1",
        "loesung2",
        "loesung3",
      ];

      // Nur vorhandene Felder übernehmen
      const cleanBody = {};
      for (const k of allowedKeys) {
        if (body[k] !== undefined) cleanBody[k] = body[k];
      }

      console.log("🔹 PATCH Szenario:", cleanBody);

      const r = await fetch(`${url}/rest/v1/scenarios?code=eq.${body.code}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: service,
          Authorization: `Bearer ${service}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(cleanBody),
      });

      const data = await r.json();
      if (!r.ok) {
        console.error("❌ Supabase-Fehler:", data);
        return res.status(r.status).json({
          error: data?.message || "Fehler beim Speichern",
          details: data,
        });
      }

      console.log("✅ Szenario gespeichert:", data);
      return res.status(200).json(data);
    } catch (e) {
      console.error("❌ Fehler beim PATCH:", e);
      return res
        .status(500)
        .json({ error: e.message || "Unbekannter Serverfehler" });
    }
  }

  // === Methodenbeschränkung ===
  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
