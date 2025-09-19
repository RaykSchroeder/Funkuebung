// pages/statusboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";

export default function Statusboard() {
  const [progress, setProgress] = useState({});
  const [timers, setTimers] = useState({});
  const [tick, setTick] = useState(0); // erzwingt Re-Render für Timer

  // Alle Teams 1–6
  const teams = [1, 2, 3, 4, 5, 6];

  // Fortschritt laden
  useEffect(() => {
    async function load() {
      const results = {};
      for (const teamId of teams) {
        const res = await fetch(`/api/task-progress?teamId=${teamId}&scenarioCode=*`, {
          headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
        });
        const data = await res.json();
        results[teamId] = data;
      }
      setProgress(results);
    }
    load();
  }, []);

  // Timer aktualisieren
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1); // jede Sekunde re-render
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hilfsfunktion für Timer
  function formatTime(start) {
    if (!start) return "--:--";
    const diff = Math.floor((Date.now() - start) / 1000);
    const m = String(Math.floor(diff / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // Timer setzen, wenn ein Team ein Szenario beginnt
  function ensureTimer(teamId, scenarioCode) {
    setTimers((prev) => {
      if (!prev[teamId]) prev[teamId] = {};
      if (!prev[teamId][scenarioCode]) {
        prev = { ...prev, [teamId]: { ...prev[teamId], [scenarioCode]: Date.now() } };
      }
      return prev;
    });
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">📊 Statusboard</h1>
        <p className="text-slate-600">Übersicht aller Teams mit Timer pro Szenario</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((teamId) => {
            const teamScenarios = scenarios.filter((s) => s.team === teamId);
            const teamProgress = progress[teamId] || [];

            return (
              <div key={teamId} className="border rounded-xl p-4 bg-white shadow">
                <h2 className="text-xl font-semibold mb-2">🚒 Team {teamId}</h2>

                {teamScenarios.map((sc) => {
                  ensureTimer(teamId, sc.code); // Timer starten

                  // erledigte Tasks zählen
                  const done = teamProgress.filter(
                    (p) => p.scenario_code === sc.code && p.done
                  ).length;
                  const total = sc.tasks.length + (sc.solutionTasks?.length || 0);

                  return (
                    <div
                      key={sc.code}
                      className="p-3 mb-3 border rounded bg-slate-50 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sc.title}</span>
                        <span className="text-sm text-slate-500">
                          ⏱ {formatTime(timers[teamId]?.[sc.code])}
                        </span>
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
