import { useState } from "react";
import { X } from "lucide-react";

export default function ImageModalButton({
  title = "Info",
  buttonLabel = "Bild",
  imageSrc = "/images/placeholder.jpg",
  imageAlt = "Bild",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button (gleiches Design wie ABC) */}
      <button
        onClick={() => setOpen(true)}
        className={`text-xs px-3 py-2 bg-orange-200 text-black rounded-lg shadow hover:bg-orange-300 w-24 text-center ${className}`}
      >
        {buttonLabel}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Schließen */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-3">{title}</h2>

            {/* Bild */}
            <div className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-auto rounded-lg border"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
