// pages/statusboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import Link from "next/link";

export default function Statusboard() {
  const [progress, setProgress] = useState({});
  const teams = [1, 2, 3, 4, 5, 6];

  // Fortschritt einmal laden
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
    loadProgress(); // ✅ nur 1x beim ersten Render
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
        <p className="text-slate-600">Übersicht aller Teams (Stand beim Laden)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((teamId) => {
            const teamScenarios = scenarios.filter((s) => s.team === teamId);
            const teamProgress = progress[teamId] || [];

            return (
              <div
                key={teamId}
                className="border rounded-xl p-4 bg-white shadow"
              >
                <h2 className="text-xl font-semibold mb-2">🚒 Team {teamId}</h2>

                {teamScenarios.map((sc) => {
                  // erledigte Tasks zählen
                  const done = teamProgress.filter(
                    (p) => p.scenario_code === sc.code && p.done
                  ).length;
                  const total =
                    sc.tasks.length + (sc.solutionTasks?.length || 0);

                  return (
                    <div
                      key={sc.code}
                      className="p-3 mb-3 border rounded bg-slate-50 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sc.title}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Fortschritt: {done}/{total}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
