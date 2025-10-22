import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

export default function ImageModalButton({
  title = "Info",
  buttonLabel = "📷 Bild",
  imageSrc = "/images/placeholder.jpg",
  imageAlt = "Bild",
  className = "fixed bottom-6 right-6", // Positionierung (Tailwind)
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className={className}>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <ImageIcon size={18} />
          {buttonLabel}
        </button>
      </div>

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
            {/* Close */}
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
