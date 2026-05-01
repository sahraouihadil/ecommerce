/**
 * Header.jsx - Dashboard Page Header
 */

import { X, Menu } from "lucide-react";

export default function Header({ concept, setOpenBar, openBar }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpenBar(!openBar)}
          className="min-[600px]:hidden w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
        >
          {openBar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight truncate mr-4">
          {concept}
        </h1>
      </div>
    </header>
  );
}