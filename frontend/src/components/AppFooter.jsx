import * as ReactRouterDom from "react-router-dom";

const { Link } = ReactRouterDom;

function AppFooter() {
  return (
    <footer className="rounded-2xl border border-[#f1f5f9] bg-white px-4 py-4 text-[11px] text-slate-500 shadow-[0_8px_20px_rgba(148,163,184,0.12)] sm:px-5 sm:py-4 sm:text-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright 2026, Dashboard UI. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/about" className="transition hover:text-slate-700">About</Link>
          <Link to="/license" className="transition hover:text-slate-700">License</Link>
          <Link to="/support" className="transition hover:text-slate-700">Support</Link>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
