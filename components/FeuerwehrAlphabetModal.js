import { useState } from "react";
import { X } from "lucide-react";

export default function FeuerwehrAlphabetModal() {
  const [open, setOpen] = useState(false);

  const alphabet = [
    ["A", "Anton"],
    ["B", "Berta"],
    ["C", "Cäsar"],
    ["D", "Dora"],
    ["E", "Emil"],
    ["F", "Friedrich"],
    ["G", "Gustav"],
    ["H", "Heinrich"],
    ["I", "Ida"],
    ["J", "Julius"],
    ["K", "Kaufmann"],
    ["L", "Ludwig"],
    ["M", "Martha"],
    ["N", "Nordpol"],
    ["O", "Otto"],
    ["P", "Paula"],
    ["Q", "Quelle"],
    ["R", "Richard"],
    ["S", "Samuel"],
    ["T", "Theodor"],
    ["U", "Ulrich"],
    ["V", "Viktor"],
    ["W", "Wilhelm"],
    ["X", "Xanthippe"],
    ["Y", "Ypsilon"],
    ["Z", "Zacharias"],
  ];

  return (
    <>
      {/* Button unten rechts */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        >
          📖 ABC
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Schließen-Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
              onClick={() => setOpen(false)}
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4">Feuerwehralphabet</h2>
            <ul className="space-y-2">
              {alphabet.map(([letter, word]) => (
                <li key={letter} className="flex justify-between border-b pb-1">
                  <span className="font-bold">{letter}</span>
                  <span>{word}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
