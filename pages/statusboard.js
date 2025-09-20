import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import Link from "next/link";

export default function Statusboard() {
  const [progress, setProgress] = useState({});
  const teams = [1, 2, 3, 4, 5, 6];

  async function loadProgress() {
    const res = await fetch("/api/task-progress", {
      headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
    });
    const data = await res.json();
    setProgress(data);
  }

  useEffect(() => {
    loadProgress();
  }, []);

  // Ampel anhand Szenario-Fortschritt
  function getTrafficLight(done, total) {
    if (done === 0) return "🔴";
    if (done < total) return "🟡";
    return "🟢";
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Zurück */}
        <Link
          href="/admin-dashboard"
          className="text-red-600 hover:underline flex items-center mb-4"
        >
          <span className="mr-2">⬅️</span> Zurück zum Admin-Dashboard
        </Link>

        <h1 className="text-3xl font-bold">📊 Statusboard</h1>
        <p className="text-slate-600">Übersicht aller Teams</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((teamId) => {
            const teamScenarios = scenarios.filter((s) => s.team === teamId);

            // Sub-Szenarien sammeln
            const allSubs = teamScenarios.flatMap((s) => s.subScenarios || []);

            // Szenario-Fortschritt
            const subTotal = allSubs.length;
            const subDone = allSubs.filter((sub) => {
              const doneTasks = progress[teamId]?.[sub.code] || 0;
              return doneTasks > 0;
            }).length;

            // Aufgaben-Fortschritt
            const allTasks = allSubs.reduce(
              (sum, sub) => sum + sub.tasks.length + (sub.solutionTasks?.length || 0),
              0
            );
            const doneTasks = allSubs.reduce(
              (sum, sub) => sum + (progress[teamId]?.[sub.code] || 0),
              0
            );

            return (
              <div key={teamId} className="border rounded-xl p-4 bg-white shadow">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">🚒 Team {teamId}</h2>
                  <span className="text-2xl">
                    {getTrafficLight(subDone, subTotal)}
                  </span>
                </div>

                <div className="p-3 mb-3 border rounded bg-slate-50 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">📌 Szenarien</span>
                    <span className="text-sm text-slate-600">
                      {subDone}/{subTotal}
                    </span>
                  </div>
                </div>

                <div className="p-3 mb-3 border rounded bg-slate-50 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">✅ Aufgaben</span>
                    <span className="text-sm text-slate-600">
                      {doneTasks}/{allTasks}
                    </span>
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
