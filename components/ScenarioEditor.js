import { useEffect, useState } from "react";
import Layout from "./Layout";

export default function ScenarioEditor({ onBack }) {
  const [scenariosDB, setScenariosDB] = useState([]);
  const [statusDB, setStatusDB] = useState("Lade Szenarien …");
  const [editing, setEditing] = useState(null);
  const [filterGroup, setFilterGroup] = useState(""); // 🔍 Gruppe-Filter
  const [filterRole, setFilterRole] = useState(""); // 🔍 Rolle-Filter

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

  // Kartenfarben
  const cardColors = [
    "bg-slate-50",
    "bg-white",
    "bg-slate-100",
    "bg-slate-200",
    "bg-slate-50",
  ];

  // 🔎 Filter anwenden
  const filteredScenarios = scenariosDB.filter((s) => {
    const matchesGroup =
      !filterGroup || (s.gruppe && s.gruppe.toLowerCase() === filterGroup.toLowerCase());
    const matchesRole =
      !filterRole || (s.rolle && s.rolle.toLowerCase() === filterRole.toLowerCase());
    return matchesGroup && matchesRole;
  });

  // 🔧 Dynamische Optionen
  const uniqueGroups = [...new Set(scenariosDB.map((s) => s.gruppe).filter(Boolean))];
  const uniqueRoles = [...new Set(scenariosDB.map((s) => s.rolle).filter(Boolean))];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white shadow rounded-xl p-6">
        <button
          onClick={onBack}
          className="text-red-600 hover:underline flex items-center mb-6"
        >
          <span className="mr-2">⬅️</span> Zurück
        </button>

        <h1 className="text-2xl font-bold mb-4">📝 Szenarien bearbeiten</h1>

        {/* 🔍 Filterleiste */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Gruppe:
            </label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="">Alle</option>
              {uniqueGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Rolle / Trupp:
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="">Alle</option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setFilterGroup("");
              setFilterRole("");
            }}
            className="ml-auto bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
          >
            🔄 Filter zurücksetzen
          </button>
        </div>

        {statusDB && <p className="text-slate-500">{statusDB}</p>}

        {!statusDB && filteredScenarios.length === 0 && (
          <p className="text-slate-500 italic">Keine Szenarien gefunden.</p>
        )}

        {!statusDB && filteredScenarios.length > 0 && (
          <div className="space-y-6">
            {filteredScenarios.map((s, index) => (
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
                {[
                  { label: "Allgemein", fields: ["gruppe", "rolle", "code", "titel", "bilder"] },
                  { label: "Beschreibung", fields: ["beschreibung"] },
                  {
                    label: "Aufgaben",
                    fields: ["aufgabe1", "aufgabe2", "aufgabe3", "aufgabe4", "aufgabe5"],
                  },
                  { label: "Lösungen", fields: ["loesung1", "loesung2", "loesung3"] },
                ].map((group) => (
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
