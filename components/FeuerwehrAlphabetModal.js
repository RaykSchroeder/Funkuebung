import { useState } from "react";
import { X } from "lucide-react";

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

export default function FeuerwehrAlphabetModal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 text-center">
      {/* Button */}
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🆘 Feuerwehr-ABC
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📖 Feuerwehralphabet</h2>
              <button
                className="text-gray-600 hover:text-red-600"
                onClick={() => setOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <table className="w-full border-collapse">
              <tbody>
                {alphabet.map(([letter, word]) => (
                  <tr key={letter} className="border-b">
                    <td className="px-2 py-1 font-bold">{letter}</td>
                    <td className="px-2 py-1">{word}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
