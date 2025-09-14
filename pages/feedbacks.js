// pages/feedbacks.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function FeedbacksPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Lade …");

  useEffect(() => {
    async function load() {
      const pass = prompt("Admin-Passwort:");
      if (pass === null) {
        setStatus("Abgebrochen.");
        return;
      }
      const res = await fetch("/api/feedback", {
        headers: { "x-admin-pass": pass },
      });
      if (res.status === 401) {
        alert("❌ Falsches Passwort");
        setStatus("Nicht berechtigt.");
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setStatus("");
    }
    load();
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
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
}
