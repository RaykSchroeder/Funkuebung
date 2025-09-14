import { useState } from "react";

export default function ScenarioViewer({ scenario, onBack }) {
  const [openImage, setOpenImage] = useState(null);

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold">{scenario.title}</h2>
      <p className="text-slate-700">{scenario.description}</p>

      {scenario.fileType === "image" && (
        <img
          src={scenario.file}
          alt={scenario.title}
          className="w-full max-w-md rounded shadow cursor-zoom-in"
          onClick={() => setOpenImage(scenario.file)} // 👈 Bild öffnen
        />
      )}

      {scenario.fileType === "pdf" && (
        <iframe
          src={scenario.file}
          title={scenario.title}
          className="w-full h-96 border rounded"
        />
      )}

      <ul className="mt-3 space-y-2">
        {scenario.tasks.map((t, i) => (
          <li key={i} className="bg-slate-100 p-2 rounded">
            {i + 1}. {t}
          </li>
        ))}
      </ul>

      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 border rounded bg-slate-100"
      >
        Neues Szenario
      </button>

      {/* Modal Overlay */}
      {openImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setOpenImage(null)} // Klick außerhalb = schließen
        >
          <img
            src={openImage}
            alt="Zoom"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()} // 👈 verhindert Schließen beim Bild-Klick
          />
        </div>
      )}
    </article>
  );
}
