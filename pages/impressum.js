// pages/impressum.js
import Link from "next/link";
import Layout from "../components/Layout";

export default function Impressum() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6 space-y-4">
        {/* 🔙 Zurück-Pfeil */}
        <Link
          href="/"
          className="text-red-600 hover:underline flex items-center mb-4"
        >
          <span className="mr-2">⬅️</span> Zurück
        </Link>

        <h1 className="text-2xl font-bold">Inpressum</h1>
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
    </Layout>
  );
}
