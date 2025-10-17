import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ScenarioViewer from "../components/ScenarioViewer";
import Link from "next/link";
import scenarios from "../data/scenarios";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState("menu");
  const [items, setItems] = useState([]);
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);
  const [countWithRating, setCountWithRating] = useState(0);
  const [status, setStatus] = useState("");

  // Passwort-Abfrage
  useEffect(() => {
    const pass = prompt("Admin-Passwort:");
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      alert("❌ Kein Zugriff");
      window.location.href = "/";
    }
  }, []);

  // Feedback laden
  useEffect(() => {
    if (view !== "feedback") return;

    async function load() {
      const res = await fetch("/api/feedback", {
        headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
      });
      if (res.status === 401) {
        setStatus("Nicht berechtigt.");
        return;
      }
      const data = await res.json();

      if (data.feedback) {
        setItems(data.feedback);
        setCount(data.count);

        // Sterne herausfiltern
        const ratings = data.feedback
          .map((f) => f.rating)
          .filter((r) => typeof r === "number" && !isNaN(r));

        setCountWithRating(ratings.length);

        if (ratings.length > 0) {
          const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          setAverage(avg.toFixed(2));
        } else {
          setAverage(null);
        }
      } else {
        setItems([]);
        setAverage(null);
        setCount(0);
        setCountWithRating(0);
      }
      setStatus("");
    }

    load();
  }, [view]);

  // Durchschnitt als Sterne rendern
  function renderStars(avg) {
    if (!avg) return "–";
    const fullStars = Math.floor(avg);
    const halfStar = avg - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span className="text-yellow-600">
        {"⭐".repeat(fullStars)}
        {halfStar && "✩"}
        {"☆".repeat(emptyStars)}
      </span>
    );
  }

  // CSV-Export
  function exportCSV() {
    if (items.length === 0) {
      alert("Kein Feedback vorhanden.");
      return;
    }

    const header = ["ID", "Nachricht", "Bewertung", "Datum"];
    const rows = items.map((f) => [
      f.id,
      f.message ? `"${f.message.replace(/"/g, '""')}"` : "",
      f.rating ?? "",
      new Date(f.created_at ?? f.date).toLocaleString("de-DE"),
    ]);

    const csvContent = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "feedbacks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!authenticated) {
    return (
      <Layout>
        <p className="p-6 text-center text-slate-500">⏳ Überprüfung …</p>
      </Layout>
    );
  }

  // Hauptmenü
  if (view === "menu")
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6 space-y-4">
          <Link
            href="/"
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </Link>

          <h1 className="text-2xl font-bold mb-4">⚙️ Admin-Dashboard</h1>

          <button
            onClick={() => setView("feedback")}
            className="block w-full px-4 py-2 border rounded bg-slate-100"
          >
            📋 Feedbacks
          </button>

          <Link
            href="/statusboard"
            className="block w-full px-4 py-2 border rounded bg-slate-100 text-center"
          >
            📊 Statusboard
          </Link>

          <h2 className="mt-4 font-semibold">Szenarien</h2>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[1, 2, 3, 4, 5, 6].map((t) => (
              <button
                key={t}
                onClick={() => setView(`team${t}`)}
                className="px-4 py-2 border rounded bg-slate-100"
              >
                Team {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setView("scenarios")}
            className="block w-full px-4 py-2 border rounded bg-slate-100 mt-4"
          >
            📝 Szenarien bearbeiten
          </button>
        </div>
      </Layout>
    );

  // Feedback-Ansicht
  if (view === "feedback")
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">📋 Feedbacks</h1>

          {status && <p className="text-slate-500">{status}</p>}
          {!status && count === 0 && (
            <p className="text-slate-500">Noch kein Feedback vorhanden</p>
          )}

          {!status && count > 0 && (
            <div className="mb-4 p-3 border rounded bg-slate-50">
              <p className="font-semibold">
                Durchschnittliche Bewertung:{" "}
                {average !== null ? (
                  <>
                    {average} / 5 ⭐ ({renderStars(Number(average))})
                  </>
                ) : (
                  "–"
                )}
              </p>
              <p className="text-sm text-slate-600">
                Anzahl Feedbacks: {count} (davon {countWithRating} mit Bewertung)
              </p>
              <button
                onClick={exportCSV}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                📥 Export als CSV
              </button>
            </div>
          )}

          {!status && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((f) => (
                <li key={f.id} className="p-3 border rounded bg-slate-100">
                  {f.rating && (
                    <p className="mb-1 text-yellow-600">
                      {"⭐".repeat(f.rating)}{" "}
                      <span className="text-sm text-slate-600">
                        ({f.rating}/5)
                      </span>
                    </p>
                  )}
                  {f.message && (
                    <p className="font-medium whitespace-pre-wrap">
                      {f.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(f.created_at ?? f.date).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Layout>
    );

  // Szenarien Bearbeiten (Supabase)
  if (view === "scenarios") {
    const [scenariosDB, setScenariosDB] = useState([]);
    const [statusDB, setStatusDB] = useState("Lade Szenarien …");
    const [editing, setEditing] = useState(null);

    useEffect(() => {
      async function loadScenarios() {
        try {
          const res = await fetch("/api/scenarios-db", {
            headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Fehler beim Laden");
          setScenariosDB(data);
          setStatusDB("");
        } catch (e) {
          setStatusDB(e.message);
        }
      }
      loadScenarios();
    }, []);

    const handleSave = async (scenario) => {
      try {
        const res = await fetch("/api/scenarios-db", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS,
          },
          body: JSON.stringify(scenario),
        });
        if (!res.ok) throw new Error("Fehler beim Speichern");
        alert("✅ Gespeichert!");
        setEditing(null);
      } catch (e) {
        alert("❌ " + e.message);
      }
    };

    return (
      <Layout>
        <div className="max-w-5xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">📝 Szenarien bearbeiten</h1>

          {statusDB && <p className="text-slate-500">{statusDB}</p>}

          {!statusDB && scenariosDB.length > 0 && (
            <table className="w-full border text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border">Gruppe</th>
                  <th className="p-2 border">Rolle</th>
                  <th className="p-2 border">Code</th>
                  <th className="p-2 border">Titel</th>
                  <th className="p-2 border">Beschreibung</th>
                  <th className="p-2 border">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {scenariosDB.map((s) => (
                  <tr key={s.code} className="border-t">
                    <td className="p-2 border">{s.gruppe}</td>
                    <td className="p-2 border">{s.rolle}</td>
                    <td className="p-2 border">{s.code}</td>
                    <td className="p-2 border">
                      {editing === s.code ? (
                        <input
                          value={s.titel}
                          onChange={(e) =>
                            setScenariosDB((prev) =>
                              prev.map((p) =>
                                p.code === s.code
                                  ? { ...p, titel: e.target.value }
                                  : p
                              )
                            )
                          }
                          className="border px-1 w-full"
                        />
                      ) : (
                        s.titel
                      )}
                    </td>
                    <td className="p-2 border">
                      {editing === s.code ? (
                        <textarea
                          value={s.beschreibung}
                          onChange={(e) =>
                            setScenariosDB((prev) =>
                              prev.map((p) =>
                                p.code === s.code
                                  ? { ...p, beschreibung: e.target.value }
                                  : p
                              )
                            )
                          }
                          className="border px-1 w-full"
                        />
                      ) : (
                        <span className="line-clamp-2">{s.beschreibung}</span>
                      )}
                    </td>
                    <td className="p-2 border text-center">
                      {editing === s.code ? (
                        <>
                          <button
                            onClick={() => handleSave(s)}
                            className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                          >
                            💾 Speichern
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                          >
                            ✖ Abbrechen
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditing(s.code)}
                          className="bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          ✏️ Bearbeiten
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Layout>
    );
  }

  // Team-Ansicht
  if (view.startsWith("team")) {
    const teamNr = parseInt(view.replace("team", ""), 10);
    const mainScenario = scenarios.find((s) => s.team === teamNr);

    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">Team {teamNr} – Szenarien</h1>

          {mainScenario && (
            <ScenarioViewer
              key={mainScenario.code}
              scenario={mainScenario}
              onBack={() => {}}
              mode="admin"
              teamId={teamNr}
            />
          )}

          {mainScenario?.subScenarios?.map((sub) => (
            <ScenarioViewer
              key={sub.code}
              scenario={{ ...sub, team: teamNr }}
              onBack={() => {}}
              mode="admin"
              teamId={teamNr}
            />
          ))}
        </div>
      </Layout>
    );
  }
}
