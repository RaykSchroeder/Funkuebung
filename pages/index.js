import { useState } from "react";
import ScenarioViewer from "../components/ScenarioViewer";
import FeedbackForm from "../components/FeedbackForm";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import FeuerwehrAlphabetModal from "../components/FeuerwehrAlphabetModal";

export default function Home() {
  const [code, setCode] = useState("");
  const [activeScenarios, setActiveScenarios] = useState([]); // nur Subs
  const [teamNr, setTeamNr] = useState(null); // merkt sich das Team (Zahl)
  const [loginCode, setLoginCode] = useState(null); // merkt sich den Login (GF/AT/WT)
  const [error, setError] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null);

  const handleAddScenario = async (e) => {
    e.preventDefault();
    setError(null);

    const cleaned = code.trim().toUpperCase();

    // --- 1) Login (Teamcode) ---
    if (!loginCode) {
      if (
        !/^GF[1-6]$/.test(cleaned) &&
        !/^AT[1-6]$/.test(cleaned) &&
        !/^WT[1-6]$/.test(cleaned)
      ) {
        setError("Bitte eine gültige Team-Kennung eingeben (GF1-6, AT1-6 oder WT1-6).");
        return;
      }
      setLoginCode(cleaned);
      setTeamNr(Number(cleaned.replace(/\D/g, ""))); // Zahl extrahieren
      setCode("");
      return;
    }

    // --- 2) Sub-Szenario (nur 4-stellig erlaubt) ---
    if (!/^\d{4}$/.test(cleaned)) {
      setError("Bitte einen gültigen 4-stelligen Szenario-Code eingeben.");
      return;
    }

    const mainScenario = scenarios.find((s) => s.team === teamNr);
    const sub = mainScenario?.subScenarios?.find((sub) => sub.code === cleaned);

    if (!sub) {
      // Prüfen: gibt es den Code überhaupt in einem anderen Team?
      const anywhere = scenarios.some((s) =>
        s.subScenarios?.some((sub) => sub.code === cleaned)
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

    // --- 3) Finale prüfen ---
    if (sub.isFinal || sub.title === "Übung Ende") {
      try {
        const res = await fetch(`/api/can-unlock-final?teamId=${teamNr}`);
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

    // --- 4) Sub-Szenario hinzufügen (nur einmal) ---
    if (!activeScenarios.some((s) => s.code === sub.code)) {
      setActiveScenarios((prev) => [...prev, { ...sub, team: teamNr }]);
    }

    setExpandedCode(sub.code);
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
              !loginCode
                ? "🔑 Teamcode eingeben (GF1-6, AT1-6, WT1-6)"
                : "➡️ Nächsten Szenario-Code (4-stellig) eingeben"
            }
            maxLength={loginCode ? 4 : 4} // erlaubt auch AT1, WT1
            className="flex-1 border px-3 py-2 rounded"
          />
          <button className="px-4 py-2 bg-slate-800 text-white rounded">
            {!loginCode ? "Start" : "Nächster Code"}
          </button>
        </form>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Wenn Team gewählt */}
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
                    loginCode={loginCode} // 🔑 neu: Login weitergeben
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
