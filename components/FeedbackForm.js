import { useState } from "react";

export default function FeedbackForm() {
  const [open, setOpen] = useState(false);
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
    } else {
      setStatus("❌ Fehler beim Absenden.");
    }
  };

  return (
    <div className="mt-6">
      {/* Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          Feedback geben
        </button>
      )}

      {/* Formular */}
      {open && (
        <div className="p-4 border rounded-xl shadow-md bg-white">
          <h2 className="text-lg font-bold mb-2">Dein Feedback</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Schreib uns dein Feedback..."
              required
            />
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Absenden
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </form>
          {status && <p className="mt-2 text-sm">{status}</p>}
        </div>
      )}
    </div>
  );
}
