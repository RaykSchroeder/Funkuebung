// pages/statusboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import Link from "next/link";

export default function Statusboard() {
  const [progress, setProgress] = useState({});
  const teams = [1, 2, 3, 4, 5, 6];

  async function loadProgress() {
    try {
      const res = await fetch("/api/status-progress", {
        headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data);
      } else {
        console.error("❌ Fehler bei loadProgress:", data);
      }
    } catch (err) {
      console.error("❌ Serverfehler:", err);
    }
  }

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            const teamProgress = progress[teamId] || {};

            // Zähler vorbereiten
            let subsTotal = 0;
            let subsDone = 0;
            let solutionsTotal = 0;
            let solutionsDone = 0;

            teamScenarios.forEach((sc) => {
              sc.subScenarios?.forEach((sub) => {
                if (!sub.isFinal) {
                  subsTotal++;
                  const solvedCount = teamProgress[sub.code] || 0;
                  if (solvedCount > 0) subsDone++;
                  solutionsTotal += (sub.solutionTasks?.length || 0);
                  solutionsDone += solvedCount;
                }
              });
            });

            // Ampel-Logik anhand Sub-Szenarien
            let statusColor = "bg-red-500";
            if (subsDone > 0 && subsDone < subsTotal) statusColor = "bg-yellow-400";
            if (subsDone === subsTotal && subsTotal > 0) statusColor = "bg-green-500";

            return (
              <div
                key={teamId}
                className="border rounded-xl p-4 bg-white shadow flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-2">🚒 Team {teamId}</h2>
                  <p className="text-slate-700 text-sm mb-1">
                    {subsDone}/{subsTotal} Sub-Szenarien bearbeitet
                  </p>
                  <p className="text-slate-700 text-sm">
                    {solutionsDone}/{solutionsTotal} Lösungen erledigt
                  </p>
                </div>

                {/* Ampel-Kreis */}
                <div
                  className={`w-6 h-6 rounded-full shadow ${statusColor}`}
                  title={`Status für Team ${teamId}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
