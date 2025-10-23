import { useState } from "react";
import ScenarioViewer from "../components/ScenarioViewer";
import FeedbackForm from "../components/FeedbackForm";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import FeuerwehrAlphabetModal from "../components/FeuerwehrAlphabetModal";
import ImageModalButton from "../components/ImageModalButton";

export default function Home() {
  const [code, setCode] = useState("");
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [teamNr, setTeamNr] = useState(null);
  const [loginCode, setLoginCode] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null);
  const [showHelpers, setShowHelpers] = useState(false); // 👈 steuert das Hilfemenü

  const handleAddScenario = async (e) => {
    e.preventDefault();
    setError(null);
    const cleaned = code.trim().toUpperCase();

    // --- 1) Login ---
    if (!loginCode) {
      if (
        !/^GF[1-6]$/.test(cleaned) &&
        !/^AT[1-6]$/.test(cleaned) &&
        !/^WT[1-6]$/.test(cleaned)
      ) {
        setError(
          "Bitte eine gültige Team-Kennung eingeben (GF1-6, AT1-6, WT1-6)."
        );
        return;
      }
      setLoginCode(cleaned);
      setTeamNr(Number(cleaned.replace(/\D/g, "")));
      setCode("");
      return;
    }

    // --- 2) Sub-Szenario ---
    if (!/^\d{4}$/.test(cleaned)) {
      setError("Bitte einen gültigen 4-stelligen Szenario-Code eingeben.");
      return;
    }

    const mainScenario = scenarios.find((s) => s.team === teamNr);
    const sub = mainScenario?.subScenarios?.find((x) => x.code === cleaned);

    if (!sub) {
      const anywhere = scenarios.some((s) =>
        s.subScenarios?.some((x) => x.code === cleaned)
      );
      if (anywhere) {
        setError("❌ Falsche Gruppe – der Code gehört zu einer anderen Gruppe.");
      } else {
        setError("❌ Ungültiger Szenario-Code.");
      }
      setCode("");
      return;
    }

    // --- 2b) Rolle prüfen ---
    if (loginCode && sub.role !== loginCode) {
      setError("❌ Nicht der richtige Trupp – dieser Code gehört einem anderen Trupp.");
      setCode("");
      return;
    }

    // --- 3) Vorheriges Szenario prüfen ---
    if (sub.row && Number(sub.row) > 1) {
      try {
        const prevScenario = mainScenario.subScenarios.find(
          (s) => s.role === sub.role && Number(s.row) === Number(sub.row) - 1
        );
        if (prevScenario) {
          const res = await fetch(
            `/api/task-progress?teamId=${teamNr}&scenarioCode=${prevScenario.code}`,
            { headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS } }
          );
          const data = await res.json();
          const isPrevDone = Array.isArray(data)
            ? data.some((entry) => entry.done)
            : data.data?.some((entry) => entry.done);
          if (!isPrevDone) {
            setError(
              "Scenario noch nicht verfügbar... zunächst vorheriges Scenario bearbeiten."
            );
            setCode("");
            return;
          }
        }
      } catch {
        setError("Serverfehler bei der Überprüfung des vorherigen Szenarios.");
        setCode("");
        return;
      }
    }

    // --- 4) Finale prüfen ---
    if (sub.isFinal || sub.title === "Übung Ende") {
      try {
        const res = await fetch(`/api/can-unlock-final?teamId=${teamNr}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.allowed) {
          setError("Abschlusslage noch nicht freigeschaltet.");
          setCode("");
          return;
        }
      } catch {
        setError("Serverfehler bei Freigabeprüfung.");
        setCode("");
        return;
      }
    }

    // --- 5) Sub-Szenario hinzufügen ---
    if (!activeScenarios.some((s) => s.code === sub.code)) {
      setActiveScenarios((prev) => [...prev, { ...sub, team: teamNr }]);
    }
    setExpandedCode(sub.code);
    setCode("");
  };

  return (
    <Layout>
      {/* Hauptinhalt */}
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 mx-auto">
        <form onSubmit={handleAddScenario} className="flex gap-2 mb-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={
              !loginCode
                ? "🔑 Teamcode eingeben (GF1-6, AT1-6, WT1-6)"
                : "➡️ Nächsten Szenario-Code (4-stellig) eingeben"
            }
            maxLength={loginCode ? 4 : 4}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button className="px-4 py-2 bg-slate-800 text-white rounded">
            {!loginCode ? "Start" : "Nächster Code"}
          </button>
        </form>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loginCode ? (
          <>
            <h2 className="text-2xl font-bold mb-4">🚒 Team {loginCode}</h2>
            {activeScenarios.length > 0 ? (
              <div className="space-y-6">
                {activeScenarios.map((s) => (
                  <ScenarioViewer
                    key={s.code}
                    scenario={s}
                    onBack={() => {}}
                    mode="team"
                    teamId={teamNr}
                    loginCode={loginCode}
                    expandedCode={expandedCode}
                    setExpandedCode={setExpandedCode}
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-500">
                Noch kein Szenario-Code für Team {loginCode} eingegeben
              </p>
            )}
          </>
        ) : (
          <p className="text-slate-500">Noch kein Team gewählt</p>
        )}

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

      {/* --- Hilfemenü unten rechts --- */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Hauptbutton ? / × */}
        <button
          onClick={() => setShowHelpers(!showHelpers)}
          className="w-12 h-12 rounded-full bg-slate-800 text-white text-2xl shadow-lg hover:bg-slate-700 flex items-center justify-center"
        >
          {showHelpers ? "×" : "?"}
        </button>

        {/* Unterbuttons */}
        {showHelpers && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg shadow-lg border">
            <ImageModalButton
              title="DMO"
              buttonLabel="DMO"
              imageSrc="/images/DMO.png"
              imageAlt="DMO"
              className="relative text-xs px-2 py-1 bg-orange-200 rounded shadow"
            />
            <ImageModalButton
              title="SC20 Funkgerät"
              buttonLabel="SC20"
              imageSrc="/images/SC20.png"
              imageAlt="Funkgerät"
              className="relative text-xs px-2 py-1 bg-orange-200 rounded shadow"
            />
            <ImageModalButton
              title="MELDEN"
              buttonLabel="MELDEN"
              imageSrc="/images/MELDEN.png"
              imageAlt="Melden"
              className="relative text-xs px-2 py-1 bg-orange-200 rounded shadow"
            />
            <FeuerwehrAlphabetModal />
          </div>
        )}
      </div>
    </Layout>
  );
}
