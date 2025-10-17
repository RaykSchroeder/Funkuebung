import { useEffect, useState } from "react";
import Layout from "./Layout";

export default function ScenarioEditor({ onBack }) {
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
          onClick={onBack}
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
