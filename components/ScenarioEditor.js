import { useEffect, useState } from "react";
import Layout from "./Layout";

export default function ScenarioEditor({ onBack }) {
  const [scenariosDB, setScenariosDB] = useState([]);
  const [statusDB, setStatusDB] = useState("Lade Szenarien …");
  const [editing, setEditing] = useState(null);

  // Szenarien laden
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

  // Speichern
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

  // Feldreihenfolge
  const fieldGroups = [
    { label: "Allgemein", fields: ["gruppe", "rolle", "code", "titel", "bilder"] },
    { label: "Beschreibung", fields: ["beschreibung"] },
    {
      label: "Aufgaben",
      fields: ["aufgabe1", "aufgabe2", "aufgabe3", "aufgabe4", "aufgabe5"],
    },
    { label: "Lösungen", fields: ["loesung1", "loesung2", "loesung3"] },
  ];

  // Kartenfarben (abwechslend)
  const cardColors = [
    "bg-slate-50",
    "bg-white",
    "bg-slate-100",
    "bg-slate-200",
    "bg-slate-50",
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white shadow rounded-xl p-6">
        <button
          onClick={onBack}
          className="text-red-600 hover:underline flex items-center mb-6"
        >
          <span className="mr-2">⬅️</span> Zurück
        </button>

        <h1 className="text-2xl font-bold mb-6">📝 Szenarien bearbeiten</h1>

        {statusDB && <p className="text-slate-500">{statusDB}</p>}

        {!statusDB && scenariosDB.length > 0 && (
          <div className="space-y-6">
            {scenariosDB.map((s, index) => (
              <div
                key={s.code}
                className={`rounded-xl border shadow-sm p-4 ${cardColors[index % cardColors.length]}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">
                    {s.titel || "(kein Titel)"}{" "}
                    <span className="text-slate-500 text-sm">({s.code})</span>
                  </h2>
                  {editing === s.code ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(s)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        💾 Speichern
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ✖ Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(s.code)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ✏️ Bearbeiten
                    </button>
                  )}
                </div>

                {/* Abschnittsweise Darstellung */}
                {fieldGroups.map((group) => (
                  <div key={group.label} className="mt-4">
                    <h3 className="font-medium text-slate-600 mb-1">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.fields.map((f) => (
                        <div key={f}>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {f}
                          </label>
                          {editing === s.code ? (
                            f === "beschreibung" ? (
                              <textarea
                                value={s[f] ?? ""}
                                onChange={(e) =>
                                  setScenariosDB((prev) =>
                                    prev.map((p) =>
                                      p.code === s.code
                                        ? { ...p, [f]: e.target.value }
                                        : p
                                    )
                                  )
                                }
                                className="border rounded-md w-full p-2 text-sm"
                                rows={3}
                              />
                            ) : (
                              <input
                                value={s[f] ?? ""}
                                onChange={(e) =>
                                  setScenariosDB((prev) =>
                                    prev.map((p) =>
                                      p.code === s.code
                                        ? { ...p, [f]: e.target.value }
                                        : p
                                    )
                                  )
                                }
                                className="border rounded-md w-full p-2 text-sm"
                              />
                            )
                          ) : (
                            <p className="p-2 bg-white border rounded-md min-h-[36px] text-sm whitespace-pre-wrap">
                              {s[f] || "—"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
