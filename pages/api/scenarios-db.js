export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE;
  const adminPass = process.env.ADMIN_PASS;

  if (!url || !service)
    return res
      .status(500)
      .json({ error: "Supabase-Umgebungsvariablen fehlen." });

  if (req.headers["x-admin-pass"] !== adminPass)
    return res.status(401).json({ error: "Unauthorized" });

  // --- Alle Szenarien abrufen ---
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
      return res
        .status(500)
        .json({ error: e.message || "Unbekannter Serverfehler" });
    }
  }

  // --- Ein Szenario aktualisieren ---
  if (req.method === "PATCH") {
    try {
      const body = req.body;
      if (!body.code)
        return res.status(400).json({ error: "Code fehlt im Request." });

      const r = await fetch(
        `${url}/rest/v1/scenarios?code=eq.${body.code}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: service,
            Authorization: `Bearer ${service}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            titel: body.titel,
            beschreibung: body.beschreibung,
            gruppe: body.gruppe,
            rolle: body.rolle,
          }),
        }
      );

      if (!r.ok) {
        const errText = await r.text();
        return res
          .status(r.status)
          .json({ error: errText || "Fehler beim Speichern" });
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      return res
        .status(500)
        .json({ error: e.message || "Unbekannter Serverfehler" });
    }
  }

  // --- Methodenbeschränkung ---
  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
