//components/FeedbackForm.js
import { useState } from "react";
import { Star } from "lucide-react";

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Nur Felder mitsenden, die auch gesetzt sind
    const feedbackData = {};
    if (rating > 0) feedbackData.rating = rating;
    if (message.trim()) feedbackData.message = message.trim();

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData),
    });

    if (res.ok) {
      setStatus("✅ Danke für dein Feedback!");
      setMessage("");
      setRating(0);
      setTimeout(() => setStatus(""), 3000);
    } else {
      setStatus("❌ Fehler beim Absenden.");
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white mt-8">
      <h2 className="text-lg font-bold mb-3 text-gray-800">Feedback geben</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Sterne-Bewertung */}
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-7 h-7 ${
                  (hover || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600">
            Bewertung: {rating} von 5 Sternen
          </p>
        )}

        {/* Textfeld */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
          placeholder="Dein Feedback (optional)..."
        />

        <button
          type="submit"
          className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          Absenden
        </button>
      </form>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
