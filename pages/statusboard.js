import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";

export default function Statusboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [progress, setProgress] = useState({});
  const [status, setStatus] = useState("Lade …");

  // 🔑 Passwort-Abfrage
  useEffect(() => {
    const pass = prompt("Admin-Passwort:");
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      alert("❌ Kein Zugriff");
      window.location.href = "/";
    }
  }, []);

  // Fortschritt für alle Teams laden
  useEffect(() => {
    if (!authenticated) return;

    async function loadAll() {
      try {
        const res = await fetch("/api/status-progress", {
          headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("Fehler beim Laden");
          return;
        }
        setProgress(data);
        setStatus("");
      } catch (e) {
        setStatus("Serverfehler");
      }
    }

    loadAll();
    const interval = setInterval(loadAll, 5000); // ⏱ alle 5s neu laden
    return () => clearInterval(interval);
  }, [authenticated]);

  if (!authenticated) {
    return (
      <Layout>
        <p className="p-6 text-center text-slate-500">⏳ Überprüfung …</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Live-Statusboard</h1>

        {status && <p className="text-slate-500">{status}</p>}

        {!status && (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((team) => {
              const teamScenarios = scenarios.filter((s) => s.team === team);
              const teamProgress = progress[team] || {};

              return (
                <div key={team} className="border rounded p-4 bg-slate-50">
                  <h2 className="font-semibold mb-2">🚒 Team {team}</h2>
                  <ul className="space-y-1">
                    {teamScenarios.map((s) => {
                      const total = s.tasks.length + (s.solutionTasks?.length || 0);
                      const done = teamProgress[s.code] || 0;

                      return (
                        <li key={s.code} className="flex justify-between">
                          <span>{s.title}</span>
                          <span>
                            {done}/{total} erledigt
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
