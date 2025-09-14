// pages/impressum.js
import Link from "next/link";

export default function Impressum() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 p-6 bg-white shadow rounded-xl">
      {/* 🔙 Zurück-Pfeil */}
      <Link href="/" className="text-red-600 hover:underline flex items-center mb-4">
        <span className="mr-2">⬅️</span> Zurück
      </Link>

      <h1 className="text-2xl font-bold">Impressum</h1>
      <p>Feuerwehr Stadt Geestland - OT Imsum</p>
      <p>Vertreten durch: [TvH, Wehrführer]</p>
      <p>Verantwortliche Funkübung: [TM, Funkwart]</p>
      <p>Technischer Support: [RS, Kinderwart AD]</p>
      <p>Auch mit dabei: [TS, Alles, aber nichts richtig]</p>
      <p>Adresse: [Straße: Alte Bahnhofstraße, PLZ: 27607]</p>
      <p>Telefon: [112]</p>
      <p>E-Mail: [ichbinboss@geestland.de]</p>
      <p>Stadt Geestland</p>
    </div>
  );
}
