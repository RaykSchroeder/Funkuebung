import { useState } from "react";
import { Send } from "lucide-react";
import { RefreshCcw, X } from "lucide-react";


export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      setStatus("✅ Danke für dein Feedback!");
      setMessage("");
      setTimeout(() => setStatus(""), 3000);
    } else {
      setStatus("❌ Fehler beim Absenden.");
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white mt-8">
      <h2 className="text-lg font-bold mb-3 text-gray-800">Feedback geben</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
          placeholder="Dein Feedback..."
          required
        />
        <button
          type="submit"
          className="mt-3 px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 flex items-center gap-2"
        >
          <Send size={18} /> Absenden
        </button>
      </form>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
