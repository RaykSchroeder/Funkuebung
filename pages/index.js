import { useState } from "react";
import ScenarioViewer from "../components/ScenarioViewer";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import FeuerwehrAlphabetModal from "../components/FeuerwehrAlphabetModal";

export default function Home() {
  const [code, setCode] = useState("");
  const [activeScenarios, setActiveScenarios] = useState([]); // aktive Szenarien
  const [teamNr, setTeamNr] = useState(null); // merkt sich das aktive Team
  const [error, setError] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null); // nur 1 Szenario offen
  const [showAlphabet, setShowAlphabet] = useState(false);

  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

  // 🧩 Szenario-Code prüfen und laden
  const handleAddScenario = async (e) => {
    e.preventDefault();
    setError(null);

    const cleaned = code.trim();

    // --- 1️⃣ Teamnummer prüfen ---
    if (!teamNr || !/^[1-6]$/.test(teamNr)) {
      return setError("Bitte zuerst eine gültige Teamnummer (1–6) wählen.");
    }

    // --- 2️⃣ Szenario anhand Code finden ---
    const found = scenarios.find((s) => s.code === cleaned);
    if (!found) {
      return setError("❌ Szenario nicht gefunden.");
    }

    // --- 3️⃣ Wenn Szenario eine höhere Row hat → vorheriges prüfen ---
    if (Number(found.row) > 1) {
      const prevRow = Number(found.row) - 1;
      const prevScenario = scenarios.find(
        (s) => s.role === found.role && Number(s.row) === prevRow
      );

      if (prevScenario) {
        try {
          const res = await fetch(
            `/api/task-progress?teamId=${teamNr}&scenarioCode=${prevScenario.code}`,
            { headers: { "x-admin-pass": adminPass } }
          );
          const data = await res.json();
          const ok = res.ok && Array.isArray(data);

          // prüfen, ob mindestens eine Lösung erledigt wurde
          const hasAnySolution =
            ok &&
            data.some((d) => d.type === "solution" && d.done === true);

          if (!hasAnySolution) {
            return setError(
              `🚫 Dieses Szenario (${found.title}) ist noch nicht freigeschaltet. Bitte zuerst "${prevScenario.title}" beginnen oder eine Lösung dort abhaken.`
            );
          }
        } catch (err) {
          console.error("Fehler bei Freigabeprüfung:", err);
          return setError("Serverfehler bei der Freigabeprüfung.");
        }
      }
    }

    // --- 4️⃣ Wenn erlaubt → Szenario aktivieren ---
    setActiveScenarios([found]);
    setExpandedCode(found.code);
  };

  // 🧹 Reset-Funktion
  const handleReset = () => {
    setActiveScenarios([]);
    setCode("");
    setError(null);
    setExpandedCode(null);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-6 p-4 bg-white rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-center">🚒 Funkübung</h1>

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

        {/* Steuerung */}
        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Zurücksetzen
          </button>
          <button
            onClick={() => setShowAlphabet(true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🔡 Funkalphabet
          </button>
        </div>
      </div>

      {/* Szenarienanzeige */}
      {activeScenarios.length > 0 && (
        <div className="max-w-4xl mx-auto mt-6 space-y-4">
          {activeScenarios.map((scenario) => (
            <ScenarioViewer
              key={scenario.code}
              scenario={scenario}
              teamId={teamNr}
              loginCode={code}
              mode="team"
              expandedCode={expandedCode}
              setExpandedCode={setExpandedCode}
            />
          ))}
        </div>
      )}

      {/* Funkalphabet-Modal */}
      {showAlphabet && (
        <FeuerwehrAlphabetModal onClose={() => setShowAlphabet(false)} />
      )}
    </Layout>
  );
}
