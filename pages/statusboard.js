import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";
import Link from "next/link";

export default function Statusboard() {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const teams = [1, 2, 3, 4, 5, 6];
  const excludeFinal = true; // Letztes Sub-Szenario (Übungsende) ignorieren

  async function loadProgress() {
    setLoading(true);
    try {
      const res = await fetch("/api/status-progress", {
        headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data || {});
        setLastUpdated(new Date());
      } else {
        console.error("Status-API Fehler:", data);
        setProgress({});
      }
    } catch (e) {
      console.error("Status-API Exception:", e);
      setProgress({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgress();
  }, []);

  function getTrafficLight(done, total) {
    if (total === 0) return "⚪️";
    if (done === 0) return "🔴";
    if (done < total) return "🟡";
    return "🟢";
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin-dashboard"
            className="text-red-600 hover:underline flex items-center"
          >
            <span className="mr-2">⬅️</span> Zurück zum Admin-Dashboard
          </Link>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-slate-500">
                Stand: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadProgress}
              disabled={loading}
              className="px-3 py-2 border rounded bg-slate-100 hover:bg-slate-200"
            >
              {loading ? "Aktualisiere…" : "🔄 Aktualisieren"}
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold">📊 Statusboard</h1>
        <p className="text-slate-600">
          Szenario-Fortschritt und Lösungs-Fortschritt je Team
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((teamId) => {
            const teamScenarios = scenarios.filter((s) => s.team === teamId);

            // Sub-Szenarien pro Team, letztes ggf. ignorieren
            const allSubs = teamScenarios.flatMap((s) => {
              if (!s.subScenarios) return [];
              return excludeFinal
                ? s.subScenarios.slice(0, -1) // letztes ignorieren
                : s.subScenarios;
            });

            // Szenario-Fortschritt
            const subTotal = allSubs.length;
            const subDone = allSubs.filter((sub) => {
              const entry = progress[String(teamId)]?.[String(sub.code)];
              return entry && (entry.task > 0 || entry.solution > 0);
            }).length;

            // Lösungs-Fortschritt
            const allSolutions = allSubs.reduce(
              (sum, sub) => sum + (sub.solutionTasks?.length || 0),
              0
            );
            const doneSolutions = allSubs.reduce((sum, sub) => {
              const entry = progress[String(teamId)]?.[String(sub.code)];
              return sum + (entry?.solution || 0);
            }, 0);

            return (
              <div
                key={teamId}
                className="border rounded-xl p-4 bg-white shadow"
              >
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

                <div className="p-3 mb-1 border rounded bg-slate-50 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">✅ Lösungen</span>
                    <span className="text-sm text-slate-600">
                      {doneSolutions}/{allSolutions}
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
