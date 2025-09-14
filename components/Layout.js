// components/Layout.js
import Link from "next/link";
//test
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-red-700 text-white shadow">
        <div className="flex items-center space-x-2">
          <img
            src="/images/FFImsum.png"
            alt="FF Imsum Wappen"
            className="h-12 w-auto"
          />
          <span className="font-bold">Feuerwehr Geestland - OT Imsum – Funkübung 2025</span>
        </div>

        <div>
          <img
            src="/images/FFGeestland.jpg"
            alt="Stadt Geestland Wappen"
            className="h-12 w-auto"
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-4">{children}</main>

      {/* FOOTER */}
      <footer className="p-4 bg-slate-100 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Freiwillige Feuerwehr Imsum ·{" "}
        <Link href="/inpressum" className="underline hover:text-slate-700">
          Impressum
        </Link>
      </footer>
    </div>
  );
}
