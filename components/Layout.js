// components/Layout.js
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-red-700 text-white shadow">
        <div className="flex items-center space-x-2">
          <img
            src="/images/FFImsum.jpg"
            alt="FF Imsum Wappen"
            className="h-12 w-auto"
          />
          <span className="font-bold">FF Imsum – Funkübung</span>
        </div>

        <div>
          <img
            src="/images/FFGeestalnd.jpg"
            alt="Stadt Geestland Wappen"
            className="h-12 w-auto"
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-4">{children}</main>

      {/* FOOTER */}
      <footer className="p-4 bg-slate-100 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Freiwillige Feuerwehr Imsum
      </footer>
    </div>
  );
}
