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
      {/* Button (identisch wie ImageModalButton) */}
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-2 bg-orange-200 text-black rounded-lg shadow hover:bg-orange-300 w-24 text-center"
      >
        ABC
      </button>

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
