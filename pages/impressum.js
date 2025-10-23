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

        <h1 className="text-2xl font-bold text-center text-red-700 mb-4">
          📜 Impressum
        </h1>

        <p>
          <strong>Angaben gemäß § 5 TMG</strong>
        </p>

        <p>
          Förderverein der Freiwilligen Feuerwehr Stadt Geestland – Ortswehr
          Imsum – e.V.
          <br />
          Alte Bahnhofstraße 36
          <br />
          27607 Geestland
        </p>

        <p>
          <strong>Vereinsregister:</strong> VR 200467
          <br />
          <strong>Registergericht:</strong> Amtsgericht Tostedt
        </p>

        <p>
          <strong>Vertreten durch:</strong>
          <br />
          Ortsbrandmeister Thomas von Holten
          <br />
          stv. Ortsbrandmeister Henning Pyrek
        </p>

        <p>
          <strong>Kontakt:</strong>
          <br />
          <a
            href="mailto:ortsbrandmeister@feuerwehr-imsum.de"
            className="text-blue-600 hover:underline"
          >
            ortsbrandmeister@feuerwehr-imsum.de
          </a>
        </p>

        <hr className="my-4 border-gray-300" />

        <p className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Förderverein der Freiwilligen Feuerwehr
          Stadt Geestland – Ortswehr Imsum – e.V.
        </p>
      </div>
    </Layout>
  );
}
