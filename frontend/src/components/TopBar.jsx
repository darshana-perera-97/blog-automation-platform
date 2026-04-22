import * as ReactRouterDom from "react-router-dom";

const { Link } = ReactRouterDom;

function TopBar({ title, onLogout }) {
  return (
    <header className="sticky top-3 z-20 flex flex-col gap-3 rounded-2xl border border-[#f1f5f9] bg-white px-4 py-4 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:px-5 md:flex-row md:items-center md:justify-between md:gap-4 lg:top-5 lg:px-6">
      <div>
        <p className="text-[11px] text-slate-400 sm:text-xs">Admin</p>
        <h1 className="text-lg font-bold text-slate-800 sm:text-2xl xl:text-[1.75rem]">{title}</h1>
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center md:gap-3">
        <input className="w-full rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2 text-xs outline-none ring-indigo-200 transition focus:ring-2 sm:w-64 sm:text-sm md:w-72" placeholder="Type here..." />
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-center text-xs font-medium text-white transition hover:from-slate-600 hover:to-slate-700 sm:text-sm"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-center text-xs font-medium text-white transition hover:from-slate-600 hover:to-slate-700 sm:text-sm"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export default TopBar;
