import { useEffect, useMemo, useState } from "react";
import ScenarioViewer from "./ScenarioViewer";

// gleiche Funktion wie in ScenarioViewer
function getRoleFromLogin(teamId, loginCode) {
  if (/^GF[1-6]$/.test(loginCode)) return loginCode;
  if (/^AT[1-6]$/.test(loginCode)) return loginCode;
  if (/^WT[1-6]$/.test(loginCode)) return loginCode;
  return null;
}

/**
 * Props:
 * - scenarios: Array aller Roh-Szenarien (mit {code, role, row, ...})
 * - teamId: Zahl/String
 * - loginCode: z.B. "AT1"
 * - mode: "team" | "admin" (hier i.d.R. "team")
 * - expandedCode, setExpandedCode: wie gehabt
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
  const [progressByScenario, setProgressByScenario] = useState({}); // { [scenario_code]: [entries...] }
  const [loading, setLoading] = useState(true);

  // Nur Szenarien der eigenen Rolle + nach row sortiert
  const userRole = useMemo(() => getRoleFromLogin(teamId, loginCode), [teamId, loginCode]);

  const roleScenariosSorted = useMemo(() => {
    return (scenarios || [])
      .filter(s => !userRole || !s.role || s.role === userRole)
      .sort((a, b) => Number(a.row) - Number(b.row));
  }, [scenarios, userRole]);

  // Progress einmal laden (alle Szenarien)
  useEffect(() => {
    let isMounted = true;
    async function loadAllProgress() {
      try {
        const res = await fetch(`/api/task-progress?teamId=${teamId}&scenarioCode=*`, {
          headers: { "x-admin-pass": adminPass }, // folgt deinem bisherigen Muster
        });
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok) {
          setProgressByScenario(data || {});
        } else {
          console.error("Progress-Fehler:", data);
          setProgressByScenario({});
        }
      } catch (e) {
        console.error("Progress-Load Fehler:", e);
        setProgressByScenario({});
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAllProgress();
    return () => { isMounted = false; };
  }, [teamId, adminPass]);

  // Ermitteln, welche Szenarien freigeschaltet sind:
  // Regel: erstes (kleinstes row) ist erlaubt; jedes nächste nur, wenn beim direkten Vorgänger
  // mindestens eine solution als done=true vorliegt.
  const allowedCodes = useMemo(() => {
    if (loading || roleScenariosSorted.length === 0) return new Set();

    const allowed = new Set();
    // Start mit der kleinsten row
    allowed.add(roleScenariosSorted[0].code);

    for (let i = 1; i < roleScenariosSorted.length; i++) {
      const prev = roleScenariosSorted[i - 1];
      const prevEntries = progressByScenario[prev.code] || [];
      const hasAnySolution = prevEntries.some(
        (e) => e.type === "solution" && e.done === true
      );
      if (hasAnySolution) {
        allowed.add(roleScenariosSorted[i].code);
      } else {
        // Sobald eins gesperrt ist, brechen wir ab (alles dahinter unsichtbar)
        break;
      }
    }
    return allowed;
  }, [loading, roleScenariosSorted, progressByScenario]);

  if (loading) {
    return <p className="text-slate-500">Lade Fortschritt…</p>;
  }

  return (
    <div className="space-y-4">
      {roleScenariosSorted
        .filter(s => allowedCodes.has(s.code)) // 👈 nur erlaubte anzeigen
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
