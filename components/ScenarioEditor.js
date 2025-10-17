import { useEffect, useState } from "react";
import Layout from "./Layout";

export default function ScenarioEditor({ onBack }) {
  const [scenariosDB, setScenariosDB] = useState([]);
  const [statusDB, setStatusDB] = useState("Lade Szenarien …");
  const [editing, setEditing] = useState(null);

  // Szenarien aus Supabase laden
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

  // Speichern eines Eintrags
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

  // Alle Spalten deiner Supabase-Tabelle
  const fieldNames = [
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto bg-white shadow rounded-xl p-6">
        <button
          onClick={onBack}
          className="text-red-600 hover:underline flex items-center mb-4"
        >
          <span className="mr-2">⬅️</span> Zurück
        </button>

        <h1 className="text-2xl font-bold mb-4">📝 Szenarien bearbeiten</h1>

        {statusDB && <p className="text-slate-500">{statusDB}</p>}

        {!statusDB && scenariosDB.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border text-xs md:text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {fieldNames.map((f) => (
                    <th key={f} className="p-2 border whitespace-nowrap">
                      {f}
                    </th>
                  ))}
                  <th className="p-2 border">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {scenariosDB.map((s) => (
                  <tr key={s.code} className="border-t align-top">
                    {fieldNames.map((f) => (
                      <td key={f} className="p-2 border">
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
                              className="border w-full h-16 px-1 text-xs"
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
                              className="border w-full px-1 text-xs"
                            />
                          )
                        ) : (
                          <div className="max-w-[250px] truncate">
                            {s[f] ?? ""}
                          </div>
                        )}
                      </td>
                    ))}

                    <td className="p-2 border text-center whitespace-nowrap">
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
          </div>
        )}
      </div>
    </Layout>
  );
}
