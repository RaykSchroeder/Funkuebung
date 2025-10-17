export default async function handler(req, res) {
  // === Supabase Keys aus .env.local ===
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE;

  // === Plausibilitätsprüfung ===
  if (!url || !anon || !service) {
    console.error("❌ Supabase-Variablen fehlen:", { url, anon: !!anon, service: !!service });
    return res.status(500).json({ error: "Supabase-Variablen fehlen." });
  }

  // === Admin-Pass prüfen ===
  const pass = req.headers["x-admin-pass"];
  if (pass !== process.env.NEXT_PUBLIC_ADMIN_PASS) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // === ALLE LADEN ===
    if (req.method === "GET") {
      const r = await fetch(`${url}/rest/v1/scenarios?select=*`, {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      });
      const data = await r.json();
      return res.status(r.ok ? 200 : r.status).json(data);
    }

    // === NEUES SZENARIO ANLEGEN ===
    if (req.method === "POST") {
      const body = req.body || {};
      if (!body.code || body.code.trim() === "") {
        body.code = Math.floor(1000 + Math.random() * 9000).toString(); // auto-code
      }

      const r = await fetch(`${url}/rest/v1/scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: service,
          Authorization: `Bearer ${service}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const err = await r.text();
        console.error("Fehler beim POST:", err);
        return res.status(r.status).json({ error: err || "Fehler beim Einfügen" });
      }
      return res.status(200).json({ success: true, code: body.code });
    }

    // === SZENARIO SPEICHERN / AKTUALISIEREN ===
    if (req.method === "PATCH") {
      const body = req.body || {};
      if (!body.code) {
        return res.status(400).json({ error: "Code fehlt zur Identifikation" });
      }

      const r = await fetch(
        `${url}/rest/v1/scenarios?code=eq.${encodeURIComponent(body.code)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: service,
            Authorization: `Bearer ${service}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(body),
        }
      );

      if (!r.ok) {
        const err = await r.text();
        console.error("Fehler beim PATCH:", err);
        return res.status(r.status).json({ error: err || "Fehler beim Aktualisieren" });
      }
      return res.status(200).json({ success: true });
    }

    // === SZENARIO LÖSCHEN ===
    if (req.method === "DELETE") {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: "Code muss angegeben werden" });
      }

      const r = await fetch(`${url}/rest/v1/scenarios?code=eq.${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      });

      if (!r.ok) {
        const err = await r.text();
        console.error("Fehler beim DELETE:", err);
        return res.status(r.status).json({ error: err || "Fehler beim Löschen" });
      }
      return res.status(200).json({ success: true });
    }

    // === Ungültige Methode ===
    res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("❌ Fehler in /api/scenarios-db:", e);
    return res.status(500).json({ error: e.message || "Serverfehler" });
  }
}
