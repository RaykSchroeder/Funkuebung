// pages/statusboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";

export default function Statusboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [expanded, setExpanded] = useState({}); // Steuerung für Auf-/Zuklappen
  const [timers, setTimers] = useState({}); // Timer für Admins

  // Passwort-Abfrage
  useEffect(() => {
    const pass = prompt("Admin-Passwort (leer lassen für Team-Ansicht):");
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false); // Teams ohne Passwort
    }
  }, []);

  // Timer für Admins
  useEffect(() => {
    if (!authenticated) return; // Nur Admins sehen Timer

    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] += 1;
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [authenticated]);

  // Hilfsfunktion: Sekunden → mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    if (authenticated && !timers[key]) {
      setTimers((prev) => ({ ...prev, [key]: 0 })); // Timer starten
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          📊 Statusboard ({authenticated ? "Admin" : "Team"})
        </h1>

        {[1, 2, 3, 4, 5, 6].map((team) => {
          const mainScenario = scenarios.find((s) => s.team === team);
          if (!mainScenario) return null;

          const key = `team${team}-main`;

          return (
            <div key={team} className="mb-6 border rounded-lg p-4 bg-slate-50">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(key)}
              >
                <h2 className="text-xl font-semibold">
                  Team {team}: {mainScenario.title}
                </h2>
                {authenticated && (
                  <span className="text-slate-600">
                    ⏱ {timers[key] ? formatTime(timers[key]) : "00:00"}
                  </span>
                )}
              </div>

              {/* Hauptszenario-Inhalt */}
              {(expanded[key] || !authenticated) && (
                <div className="mt-2 text-slate-700">
                  <p>{mainScenario.description}</p>
                </div>
              )}

              {/* Sub-Szenarien */}
              {mainScenario.subScenarios?.map((sub, i) => {
                const subKey = `team${team}-sub${i}`;
                return (
                  <div
                    key={i}
                    className="ml-6 mt-2 border-l-2 pl-4 cursor-pointer"
                    onClick={() => toggleExpand(subKey)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{sub.title}</h3>
                      {authenticated && (
                        <span className="text-slate-600">
                          ⏱ {timers[subKey] ? formatTime(timers[subKey]) : "00:00"}
                        </span>
                      )}
                    </div>

                    {(expanded[subKey] || !authenticated) && (
                      <p className="text-slate-600 mt-1">{sub.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
