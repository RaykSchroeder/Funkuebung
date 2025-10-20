import { useEffect, useMemo, useState } from "react";
import ScenarioViewer from "./ScenarioViewer";

// Hilfsfunktion für Rollenzuordnung (gleich wie in ScenarioViewer)
function getRoleFromLogin(teamId, loginCode) {
  if (/^GF[1-6]$/.test(loginCode)) return loginCode;
  if (/^AT[1-6]$/.test(loginCode)) return loginCode;
  if (/^WT[1-6]$/.test(loginCode)) return loginCode;
  return null;
}

/**
 * Rendert nur freigeschaltete Szenarien nach row-Reihenfolge.
 * Das nächste Szenario wird erst angezeigt,
 * wenn beim vorherigen mindestens eine "solution" abgehakt wurde.
 */
export default function ScenarioList({
  scenarios,
  teamId,
  loginCode,
  mode = "team",
  expandedCode,
  setExpandedCode,
}) {
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;
  const [progressByScenario, setProgressByScenario] = useState({});
  const [loading, setLoading] = useState(true);

  // Rolle aus Login ermitteln
  const userRole = useMemo(() => getRoleFromLogin(teamId, loginCode), [teamId, loginCode]);

  // Szenarien nach Rolle und Reihenfolge filtern/sortieren
  const roleScenariosSorted = useMemo(() => {
    return (scenarios || [])
      .filter((s) => !userRole || !s.role || s.role === userRole)
      .sort((a, b) => Number(a.row) - Number(b.row));
  }, [scenarios, userRole]);

  // Fortschritt einmalig laden (alle Szenarien)
  useEffect(() => {
    let isMounted = true;
    async function loadAllProgress() {
      try {
        const res = await fetch(`/api/task-progress?teamId=${teamId}&scenarioCode=*`, {
          headers: { "x-admin-pass": adminPass },
        });
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok) {
          setProgressByScenario(data || {});
        } else {
          console.error("Fehler beim Laden des Fortschritts:", data);
          setProgressByScenario({});
        }
      } catch (e) {
        console.error("Fehler bei loadAllProgress:", e);
        setProgressByScenario({});
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAllProgress();
    return () => {
      isMounted = false;
    };
  }, [teamId, adminPass]);

  // Berechnen, welche Szenarien erlaubt sind
  const allowedCodes = useMemo(() => {
    if (loading || roleScenariosSorted.length === 0) return new Set();

    const allowed = new Set();
    allowed.add(roleScenariosSorted[0].code); // Erstes Szenario immer erlaubt

    for (let i = 1; i < roleScenariosSorted.length; i++) {
      const prev = roleScenariosSorted[i - 1];
      const prevEntries = progressByScenario[prev.code] || [];
      const hasAnySolution = prevEntries.some(
        (e) => e.type === "solution" && e.done === true
      );

      if (hasAnySolution) {
        allowed.add(roleScenariosSorted[i].code);
      } else {
        break; // Stop: alles danach unsichtbar
      }
    }

    return allowed;
  }, [loading, roleScenariosSorted, progressByScenario]);

  if (loading) {
    return <p className="text-slate-500">Lade Szenarien …</p>;
  }

  return (
    <div className="space-y-4">
      {roleScenariosSorted
        .filter((s) => allowedCodes.has(s.code))
        .map((scenario) => (
          <ScenarioViewer
            key={scenario.code}
            scenario={scenario}
            teamId={teamId}
            loginCode={loginCode}
            mode={mode}
            expandedCode={expandedCode}
            setExpandedCode={setExpandedCode}
          />
        ))}
    </div>
  );
}
