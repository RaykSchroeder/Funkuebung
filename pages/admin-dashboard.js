// pages/admin-dashboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ScenarioViewer from "../components/ScenarioViewer";
import Link from "next/link";
import scenarios from "../data/scenarios";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState("menu");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  // Passwort-Abfrage
  useEffect(() => {
    const pass = prompt("Admin-Passwort:");
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      alert("❌ Kein Zugriff");
      window.location.href = "/";
    }
  }, []);

  // Feedback laden
  useEffect(() => {
    if (view !== "feedback") return;

    async function load() {
      const res = await fetch("/api/feedback", {
        headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
      });
      if (res.status === 401) {
        setStatus("Nicht berechtigt.");
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setStatus("");
    }

    load();
  }, [view]);

  if (!authenticated) {
    return (
      <Layout>
        <p className="p-6 text-center text-slate-500">⏳ Überprüfung …</p>
      </Layout>
    );
  }

  // Hauptmenü
  if (view === "menu")
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6 space-y-4">
          <Link
            href="/"
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </Link>

          <h1 className="text-2xl font-bold mb-4">⚙️ Admin-Dashboard</h1>

          {/* Buttons */}
          <button
            onClick={() => setView("feedback")}
            className="block w-full px-4 py-2 border rounded bg-slate-100"
          >
            📋 Feedbacks
          </button>

          <Link
            href="/statusboard"
            className="block w-full px-4 py-2 border rounded bg-slate-100 text-center"
          >
            📊 Statusboard
          </Link>

          <h2 className="mt-4 font-semibold">Szenarien</h2>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[1, 2, 3, 4, 5, 6].map((t) => (
              <button
                key={t}
                onClick={() => setView(`team${t}`)}
                className="px-4 py-2 border rounded bg-slate-100"
              >
                Team {t}
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );

  // Feedback-Ansicht
  if (view === "feedback")
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">📋 Feedbacks</h1>

          {status && <p className="text-slate-500">{status}</p>}
          {!status && items.length === 0 && (
            <p className="text-slate-500">Noch kein Feedback vorhanden</p>
          )}
          {!status && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((f) => (
                <li key={f.id} className="p-3 border rounded bg-slate-100">
                  <p className="font-medium whitespace-pre-wrap">{f.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(f.created_at ?? f.date).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Layout>
    );

  // Team-Ansicht
  if (view.startsWith("team")) {
    const teamNr = parseInt(view.replace("team", ""), 10);

    // Hauptszenario für Team X finden
    const mainScenario = scenarios.find((s) => s.team === teamNr);

    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">Team {teamNr} – Szenarien</h1>

          {/* Hauptszenario */}
          {mainScenario && (
            <ScenarioViewer
              key={mainScenario.code}
              scenario={mainScenario}
              onBack={() => {}}
              mode="admin"
              teamId={teamNr}
            />
          )}

          {/* Unter-Szenarien */}
          {mainScenario?.subScenarios?.map((sub) => (
            <ScenarioViewer
              key={sub.code}
              scenario={{ ...sub, team: teamNr }}
              onBack={() => {}}
              mode="admin"
              teamId={teamNr}
            />
          ))}
        </div>
      </Layout>
    );
  }
}
// pages/admin-dashboard.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ScenarioViewer from "../components/ScenarioViewer";
import Link from "next/link";
import scenarios from "../data/scenarios";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState("menu");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  // Passwort-Abfrage
  useEffect(() => {
    const pass = prompt("Admin-Passwort:");
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthenticated(true);
    } else {
      alert("❌ Kein Zugriff");
      window.location.href = "/";
    }
  }, []);

  // Feedback laden
  useEffect(() => {
    if (view !== "feedback") return;

    async function load() {
      const res = await fetch("/api/feedback", {
        headers: { "x-admin-pass": process.env.NEXT_PUBLIC_ADMIN_PASS },
      });
      if (res.status === 401) {
        setStatus("Nicht berechtigt.");
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setStatus("");
    }

    load();
  }, [view]);

  if (!authenticated) {
    return (
      <Layout>
        <p className="p-6 text-center text-slate-500">⏳ Überprüfung …</p>
      </Layout>
    );
  }

  // Hauptmenü
  if (view === "menu")
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6 space-y-4">
          <Link
            href="/"
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </Link>

          <h1 className="text-2xl font-bold mb-4">⚙️ Admin-Dashboard</h1>

          {/* Buttons */}
          <button
            onClick={() => setView("feedback")}
            className="block w-full px-4 py-2 border rounded bg-slate-100"
          >
            📋 Feedbacks
          </button>

          <Link
            href="/statusboard"
            className="block w-full px-4 py-2 border rounded bg-slate-100 text-center"
          >
            📊 Statusboard
          </Link>

          <h2 className="mt-4 font-semibold">Szenarien</h2>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[1, 2, 3, 4, 5, 6].map((t) => (
              <button
                key={t}
                onClick={() => setView(`team${t}`)}
                className="px-4 py-2 border rounded bg-slate-100"
              >
                Team {t}
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );

  // Feedback-Ansicht
  if (view === "feedback")
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">📋 Feedbacks</h1>

          {status && <p className="text-slate-500">{status}</p>}
          {!status && items.length === 0 && (
            <p className="text-slate-500">Noch kein Feedback vorhanden</p>
          )}
          {!status && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((f) => (
                <li key={f.id} className="p-3 border rounded bg-slate-100">
                  <p className="font-medium whitespace-pre-wrap">{f.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(f.created_at ?? f.date).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Layout>
    );

  // Team-Ansicht
  if (view.startsWith("team")) {
    const teamNr = parseInt(view.replace("team", ""), 10);

    // Hauptszenario für Team X finden
    const mainScenario = scenarios.find((s) => s.team === teamNr);

    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
          <button
            onClick={() => setView("menu")}
            className="text-red-600 hover:underline flex items-center mb-4"
          >
            <span className="mr-2">⬅️</span> Zurück
          </button>

          <h1 className="text-2xl font-bold mb-4">Team {teamNr} – Szenarien</h1>

          {/* Hauptszenario */}
          {mainScenario && (
            <ScenarioViewer
              key={mainScenario.code}
              scenario={mainScenario}
              onBack={() => {}}
              mode="admin"
              teamId={teamNr}
            />
          )}

          {/* Unter-Szenarien */}
          {mainScenario?.subScenarios?.map((sub) => (
            <ScenarioViewer
              key={sub.code}
              scenario={{ ...sub, team: teamNr }}
              onBack={() => {}}
              mode="admin"
              teamId={teamNr}
            />
          ))}
        </div>
      </Layout>
    );
  }
}
