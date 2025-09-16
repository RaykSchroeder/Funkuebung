import { useState } from "react";
import ScenarioViewer from "../components/ScenarioViewer";
import FeedbackForm from "../components/FeedbackForm";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios"; // 👈 damit wir direkt die Szenarien abgleichen können

export default function Home() {
  const [code, setCode] = useState("");
  const [activeScenarios, setActiveScenarios] = useState([]); // Liste mit allen angezeigten Szenarien
  const [error, setError] = useState(null);

  const handleAddScenario = (e) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{4}$/.test(code.trim())) {
      setError("Bitte 4-stelligen Code eingeben");
      return;
    }

    let found = null;

    // Hauptszenario suchen
    found = scenarios.find((s) => s.code === code.trim());

    // Wenn nicht Hauptszenario → Sub-Szenarien durchsuchen
    if (!found) {
      scenarios.forEach((s) => {
        const sub = s.subScenarios?.find((sub) => sub.code === code.trim());
        if (sub) {
          found = { ...sub, team: s.team }; // Sub-Szenario gefunden
        }
      });
    }

    if (!found) {
      setError("Ungültiger Code oder Szenario nicht gefunden");
      return;
    }

    // Nur hinzufügen, wenn noch nicht aktiv
    if (!activeScenarios.some((s) => s.code === found.code)) {
      setActiveScenarios((prev) => [...prev, found]);
    }

    setCode("");
  };

  return (
    <Layout>
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 mx-auto">
        {/* Code-Eingabe */}
        <form onSubmit={handleAddScenario} className="flex gap-2 mb-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Szenario-Code eingeben"
            maxLength={4}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button className="px-4 py-2 bg-slate-800 text-white rounded">
            Nächster Code
          </button>
        </form>

        {/* Statusmeldungen */}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Szenarien-Liste */}
        {activeScenarios.length > 0 ? (
          <div className="space-y-6">
            {activeScenarios.map((s, i) => (
              <ScenarioViewer
                key={i}
                scenario={s}
                onBack={() => {}}
                mode="team" // 👈 Teams sehen keinen Admin-Modus
                teamId={s.team}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Noch kein Szenario geladen</p>
        )}

        {/* Feedback-Formular */}
        <FeedbackForm />

        {/* Admin Button */}
        <div className="mt-6 text-right">
          <button
            onClick={() => (window.location.href = "/admin-dashboard")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🔑 Admin
          </button>
        </div>
      </div>
    </Layout>
  );
}
