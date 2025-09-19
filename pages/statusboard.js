// pages/statusboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import scenarios from "../data/scenarios";

export default function Statusboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [expanded, setExpanded] = useState({});

  // Passwort-Abfrage
  useEffect(() => {
    const pass = prompt("Admin-Passwort (leer lassen für Team-Ansicht):");
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false); // Teams ohne Passwort
    }
  }, []);

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
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
              {/* Hauptszenario */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => authenticated && toggleExpand(key)}
              >
                <h2 className="text-xl font-semibold">
                  Team {team}: {mainScenario.title}
                </h2>
              </div>

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
                    onClick={() => authenticated && toggleExpand(subKey)}
                  >
                    <h3 className="font-medium">{sub.title}</h3>
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
