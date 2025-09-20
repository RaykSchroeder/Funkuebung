// pages/index.js
import { useState } from "react";
import ScenarioViewer from "../components/ScenarioViewer";
import FeedbackForm from "../components/FeedbackForm";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import FeuerwehrAlphabetModal from "../components/FeuerwehrAlphabetModal";

export default function Home() {
  const [code, setCode] = useState("");
  const [activeScenarios, setActiveScenarios] = useState([]); // Liste der aktuell angezeigten Szenarien (Haupt + Subs)
  const [mainScenario, setMainScenario] = useState(null); // aktives Hauptszenario (einziges)
  const [error, setError] = useState(null);

  // Handler für Code-Eingabe (Haupt- oder Sub-Szenario)
  const handleAddScenario = async (e) => {
    e.preventDefault();
    setError(null);

    const cleaned = code.trim();
    if (!/^\d{4}$/.test(cleaned)) {
      setError("Bitte Teamnummer eingeben");
      return;
    }

    // 1) Prüfen, ob Code ein Hauptszenario ist
    const foundMain = scenarios.find((s) => s.code === cleaned);

    if (foundMain) {
      // Hauptszenario setzen (nur eins aktiv)
      if (!activeScenarios.some((s) => s.code === foundMain.code)) {
        setActiveScenarios([foundMain]);
      } else {
        // wenn schon vorhanden, nichts tun (oder man könnte eine Info anzeigen)
        setActiveScenarios([foundMain]);
      }
      setMainScenario(foundMain);
      setCode("");
      return;
    }

    // 2) Falls kein Hauptszenario: Sub-Szenario nur zulassen, wenn Hauptszenario bereits gesetzt
    if (!mainScenario) {
      setError("Bitte zuerst die Teamnummer eingeben.");
      return;
    }

    const sub = mainScenario.subScenarios?.find((sub) => sub.code === cleaned);
    if (!sub) {
      setError("Ungültiger Code oder gehört nicht zu diesem Team.");
      setCode("");
      return;
    }

    // 3) Falls Sub ein finales Szenario ist -> Freigabe prüfen (API)
    if (sub.isFinal || sub.title === "Übung Ende") {
      try {
        const res = await fetch(`/api/can-unlock-final?teamId=${mainScenario.team}`);
        const data = await res.json().catch(() => ({}));
        // falls API fehlschlägt oder allowed=false -> wie ungültiger Code behandeln
        if (!res.ok || !data.allowed) {
          setError("Abschlusslage noch nicht freigeschaltet.");
          setCode("");
          return;
        }
        // wenn allowed -> weiter (wird normal hinzugefügt)
      } catch (err) {
        console.error("Fehler bei Freigabeprüfung:", err);
        setError("Serverfehler bei Freigabeprüfung.");
        setCode("");
        return;
      }
    }

    // 4) Sub-Szenario hinzufügen (nur einmal)
    if (!activeScenarios.some((s) => s.code === sub.code)) {
      // wichtig: die team-Nummer mitgeben, damit ScenarioViewer teamId hat
      setActiveScenarios((prev) => [...prev, { ...sub, team: mainScenario.team }]);
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

        {/* Fehlermeldung (unter dem Eingabefeld, genau wie bei ungültigem Code) */}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Szenarien-Liste */}
        {activeScenarios.length > 0 ? (
          <div className="space-y-6">
            {activeScenarios.map((s, i) => (
              <ScenarioViewer
                key={s.code}
                scenario={s}
                onBack={() => {
                  // optional: einzelne Szenarien entfernen mit onBack (wenn gewünscht)
                  // hier nichts tun, nur Platzhalter
                }}
                mode="team"
                teamId={s.team}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Noch kein Szenario geladen</p>
        )}

        {/* Hilfesymbol (Feuerwehr-Alphabet) */}
        <FeuerwehrAlphabetModal />

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
