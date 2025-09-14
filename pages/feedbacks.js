import { useEffect, useState } from "react";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    async function loadFeedbacks() {
      const res = await fetch("/api/feedback");
      const data = await res.json();

      // 👉 neueste zuerst
      setFeedbacks(data.reverse());
    }
    loadFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">📋 Feedbacks</h1>
        {feedbacks.length === 0 ? (
          <p className="text-slate-500">Noch kein Feedback vorhanden</p>
        ) : (
          <ul className="space-y-3">
            {feedbacks.map((f) => (
              <li
                key={f.id}
                className="p-3 border rounded bg-slate-100 text-slate-800"
              >
                <p className="font-medium">{f.message}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(f.date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
