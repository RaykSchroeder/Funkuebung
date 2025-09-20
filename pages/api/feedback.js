export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !anon) {
    return res
      .status(500)
      .json({ error: "Supabase-Umgebungsvariablen fehlen." });
  }

  // --- POST: Feedback speichern ---
  if (req.method === "POST") {
    const { message, rating } = req.body || {};

    // sichere Prüfungen
    const hasMessage =
      typeof message === "string" && message.trim().length > 0;
    const hasRating = typeof rating === "number" && rating > 0;

    // mindestens eins muss vorhanden sein
    if (!hasMessage && !hasRating) {
      return res
        .status(400)
        .json({ error: "Bitte Feedbacktext oder Bewertung angeben." });
    }

    try {
      const r = await fetch(`${url}/rest/v1/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          message: hasMessage ? message.trim() : null,
          rating: hasRating ? rating : null,
        }),
      });

      if (!r.ok) {
        const err = await r.text();
        return res
          .status(r.status)
          .json({ error: err || "Fehler beim Speichern" });
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  // --- GET: Feedback + Durchschnittsbewertung (Admin) ---
  if (req.method === "GET") {
    if (!process.env.ADMIN_PASS) {
      return res.status(500).json({ error: "ADMIN_PASS ist nicht gesetzt." });
    }

    const pass = req.headers["x-admin-pass"];
    if (pass !== process.env.ADMIN_PASS) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!service) {
      return res
        .status(500)
        .json({ error: "SUPABASE_SERVICE_ROLE fehlt." });
    }

    try {
      // 1. Alle Feedbacks holen
      const r = await fetch(
        `${url}/rest/v1/feedback?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: service,
            Authorization: `Bearer ${service}`,
          },
        }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);

      // 2. Durchschnitt berechnen
      const rAvg = await fetch(`${url}/rest/v1/feedback?select=avg(rating)`, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      });
      const avgData = await rAvg.json();
      const avgRating = avgData?.[0]?.avg || null;

      return res.status(200).json({
        average_rating: avgRating ? Number(avgRating).toFixed(2) : null,
        count: data.length,
        feedback: data,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Serverfehler" });
    }
  }

  // --- Method not allowed ---
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
