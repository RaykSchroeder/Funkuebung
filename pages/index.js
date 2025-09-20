// pages/index.js
import { useState } from "react";
import ScenarioViewer from "../components/ScenarioViewer";
import FeedbackForm from "../components/FeedbackForm";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import FeuerwehrAlphabetModal from "../components/FeuerwehrAlphabetModal";

export default function Home() {
  const [code, setCode] = useState("");
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [mainScenario, setMainScenario] = useState(null);
  const [error, setError] = useState(null);

  const handleAddScenario = async (e) => {
    e.preventDefault();
    setError(null);

    const cleaned = code.trim();

    // --- 1) Hauptszenario (Teamnummer 1-6) ---
    if (!mainScenario) {
      if (!/^[1-6]$/.test(cleaned)) {
        setError("Bitte eine gültige Teamnummer (1–6) eingeben.");
        return;
      }

      const foundMain = scenarios.find(
        (s) => String(s.team) === cleaned && !s.subScenarios
      );

      if (!foundMain) {
        setError("Kein Hauptszenario für dieses Team gefunden.");
        return;
      }

      setActiveScenarios([foundMain]);
      setMainScenario(foundMain);
      setCode("");
      return;
    }

    // --- 2) Sub-Szenario (nur 4-stellig erlaubt) ---
    if (!/^\d{4}$/.test(cleaned)) {
      setError("Bitte einen gültigen 4-stelligen Szenario-Code eingeben.");
      return;
    }

    const sub = mainScenario.subScenarios?.find((sub) => sub.code === cleaned);
    if (!sub) {
      setError("Ungültiger Code oder gehört nicht zu diesem Team.");
      setCode("");
      return;
    }

    // --- 3) Finale prüfen ---
    if (sub.isFinal || sub.title === "Übung Ende") {
      try {
        const res = await fetch(`/api/can-unlock-final?teamId=${mainScenario.team}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.allowed) {
          setError("Abschlusslage noch nicht freigeschaltet.");
          setCode("");
          return;
        }
      } catch (err) {
        console.error("Fehler bei Freigabeprüfung:", err);
        setError("Serverfehler bei Freigabeprüfung.");
        setCode("");
        return;
      }
    }

    // --- 4) Szenario hinzufügen ---
    if (!activeScenarios.some((s) => s.code === sub.code)) {
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
            placeholder={
              !mainScenario
                ? "🔑 Teamnummer (1–6) eingeben"
                : "➡️ Nächsten Szenario-Code (4-stellig) eingeben"
            }
            maxLength={mainScenario ? 4 : 1}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button className="px-4 py-2 bg-slate-800 text-white rounded">
            {!mainScenario ? "Start" : "Nächster Code"}
          </button>
        </form>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Szenarien */}
        {activeScenarios.length > 0 ? (
          <div className="space-y-6">
            {activeScenarios.map((s) => (
              <ScenarioViewer
                key={s.code}
                scenario={s}
                onBack={() => {}}
                mode="team"
                teamId={s.team}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Noch kein Szenario geladen</p>
        )}

        <FeuerwehrAlphabetModal />
        <FeedbackForm />

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
