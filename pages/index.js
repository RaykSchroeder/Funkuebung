import { useState } from "react";
import ScenarioList from "/components/ScenarioList";
import scenarios from "/data/scenarios"; // dein Rohdaten-Array
import Layout from "/components/Layout";

export default function Home() {
  const [code, setCode] = useState("");
  const [teamNr, setTeamNr] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null);

  const [activeScenarios, setActiveScenarios] = useState([]); // sichtbare Szenarien

  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // 🧠 Funktion: Code prüfen + Freigabelogik
  const handleAddScenario = async (e) => {
    e.preventDefault();
    setError(null);

    const cleaned = code.trim();
    if (!cleaned) return setError("Bitte Code eingeben.");

    // Gesuchtes Szenario finden
    const found = scenarios.find((s) => s.code === cleaned);
    if (!found) return setError("❌ Szenario nicht gefunden.");

    if (!teamNr) {
      return setError("Bitte zuerst Teamnummer wählen (1–6).");
    }

    // Wenn Szenario eine row > 1 hat → prüfen, ob vorheriges freigeschaltet ist
    if (Number(found.row) > 1) {
      const prevRow = Number(found.row) - 1;
      const prevScenario = scenarios.find(
        (s) => s.role === found.role && Number(s.row) === prevRow
      );

      if (prevScenario) {
        try {
          // Progress von Supabase abrufen
          const res = await fetch(
            `/api/task-progress?teamId=${teamNr}&scenarioCode=${prevScenario.code}`,
            {
              headers: { "x-admin-pass": adminPass },
            }
          );
          const data = await res.json();
          const ok = res.ok && Array.isArray(data);

          // prüfen, ob mindestens eine Lösung abgehakt wurde
          const hasSolutionDone =
            ok &&
            data.some((d) => d.type === "solution" && d.done === true);

          if (!hasSolutionDone) {
            return setError(
              `🚫 Dieses Szenario (${found.title}) ist noch nicht freigeschaltet. Bitte zuerst das Szenario "${prevScenario.title}" beginnen oder eine Lösung dort abhaken.`
            );
          }
        } catch (err) {
          console.error("Fehler beim Prüfen der Freigabe:", err);
          return setError("Serverfehler bei der Freigabeprüfung.");
        }
      }
    }

    // Wenn erlaubt → Szenario laden
    setActiveScenarios([found]);
    setExpandedCode(found.code);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-6 p-4 bg-white rounded shadow">
        <h1 className="text-xl font-bold mb-2 text-center">🚒 Funkübung</h1>

        {/* Teamnummer */}
        <div className="mb-4 text-center">
          <label className="block mb-2 font-medium">
            Teamnummer (1–6) wählen:
          </label>
          <input
            type="number"
            min="1"
            max="6"
            value={teamNr || ""}
            onChange={(e) => setTeamNr(e.target.value)}
            className="border p-2 rounded w-24 text-center"
          />
        </div>

        {/* Codeeingabe */}
        <form onSubmit={handleAddScenario} className="flex gap-2 mb-4 justify-center">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Szenario-Code eingeben"
            className="border p-2 rounded flex-grow"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Öffnen
          </button>
        </form>

        {/* Fehleranzeige */}
        {error && (
          <p className="text-red-600 font-semibold text-center mb-4">{error}</p>
        )}
      </div>

      {/* Sichtbare Szenarien */}
      {activeScenarios.length > 0 && (
        <div className="max-w-4xl mx-auto mt-6">
          <ScenarioList
            scenarios={activeScenarios}
            teamId={teamNr}
            loginCode={code}
            mode="team"
            expandedCode={expandedCode}
            setExpandedCode={setExpandedCode}
          />
        </div>
      )}
    </Layout>
  );
}
