// pages/statusboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import Link from "next/link";

export default function Statusboard() {
  const [progress, setProgress] = useState({});
  const teams = [1, 2, 3, 4, 5, 6];

  // Fortschritt laden
  async function loadProgress() {
    const results = {};
    for (const teamId of teams) {
      const res = await fetch(`/api/task-progress?teamId=${teamId}`, {
        headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
      });
      const data = await res.json();
      results[teamId] = data;
    }
    setProgress(results);
  }

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Zurück-Button */}
        <Link
          href="/admin-dashboard"
          className="text-red-600 hover:underline flex items-center mb-4"
        >
          <span className="mr-2">⬅️</span> Zurück zum Admin-Dashboard
        </Link>

        <h1 className="text-3xl font-bold">📊 Statusboard</h1>
        <p className="text-slate-600">
          Übersicht aller Teams (aktualisiert automatisch alle 10 Sekunden)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((teamId) => {
            const teamScenarios = scenarios.filter((s) => s.team === teamId);
            const teamProgress = progress[teamId] || [];

            // Nur Sub-Szenarien (ohne Final)
            const subScenarios = teamScenarios.flatMap((sc) =>
              sc.subScenarios?.filter((sub) => !sub.isFinal) || []
            );

            const y = subScenarios.length;
            const x = subScenarios.filter((sub) =>
              teamProgress.some(
                (p) => p.scenario_code === sub.code && p.done === true
              )
            ).length;

            const j = subScenarios.reduce(
              (acc, sub) => acc + (sub.solutionTasks?.length || 0),
              0
            );

            const i = subScenarios.reduce((acc, sub) => {
              const doneSolutions = teamProgress.filter(
                (p) =>
                  p.scenario_code === sub.code &&
                  p.type === "solution" &&
                  p.done === true
              ).length;
              return acc + doneSolutions;
            }, 0);

            // Ampel-Status berechnen
            let statusIcon = "🔴";
            if (x > 0 && (x < y || i < j)) statusIcon = "🟡";
            if (x === y && i === j && y > 0) statusIcon = "🟢";

            return (
              <div
                key={teamId}
                className="border rounded-xl p-4 bg-white shadow"
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {statusIcon} Team {teamId}
                </h2>

                <div className="p-3 mb-3 border rounded bg-slate-50 shadow-sm">
                  <div className="font-medium">Sub-Szenarien</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {x} von {y} bearbeitet
                  </div>
                </div>

                <div className="p-3 mb-3 border rounded bg-slate-50 shadow-sm">
                  <div className="font-medium">Lösungstasks</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {i} von {j} erledigt
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
