import * as ReactRouterDom from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getUserSessionId } from "../lib/userAuth";
import { fetchUserWebsites } from "../lib/websitesApi";
import BrandIcon from "./BrandIcon";

const { Link, useLocation } = ReactRouterDom;

const sidebarLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Websites", to: "/websites" },
  { label: "Intergrations", to: "/intergrations" },
  { label: "Knowledge", to: "/knowledge" },
  { label: "Blogs", to: "/blogs" },
  { label: "Settings", to: "/settings" },
];

function Sidebar() {
  const location = useLocation();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const integrationIndex = sidebarLinks.findIndex((item) => item.to === "/intergrations");
  const linksBeforeIntegrations = useMemo(
    () => (integrationIndex === -1 ? sidebarLinks : sidebarLinks.slice(0, integrationIndex)),
    [integrationIndex]
  );
  const linksFromIntegrations = useMemo(
    () => (integrationIndex === -1 ? [] : sidebarLinks.slice(integrationIndex)),
    [integrationIndex]
  );

  useEffect(() => {
    const userId = getUserSessionId();
    if (!userId) {
      setWebsites([]);
      setSelectedWebsite("");
      setIsLoadingWebsites(false);
      return;
    }

    let cancelled = false;
    setIsLoadingWebsites(true);
    fetchUserWebsites(userId)
      .then((sites) => {
        if (cancelled) return;
        setWebsites(sites);
        if (sites[0]?.id != null) {
          setSelectedWebsite(String(sites[0].id));
        } else {
          setSelectedWebsite("");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setWebsites([]);
        setSelectedWebsite("");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingWebsites(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="sticky top-3 z-30 mb-4 h-auto w-full overflow-y-auto rounded-3xl border border-[#f1f5f9] bg-white p-4 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-5 lg:fixed lg:left-5 lg:top-5 lg:mb-0 lg:h-[calc(100vh-2.5rem)] lg:w-[240px]">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 via-emerald-500 to-green-600 text-white shadow-sm sm:h-11 sm:w-11">
          <BrandIcon />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 sm:text-base">AI Bloger</p>
          <p className="text-[8px] uppercase tracking-widest text-slate-400 sm:text-[9px]">Powered by NexgenAI</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Admin</p>
        </div>
      </div>
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:text-xs">Pages</p>
      <nav className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 sm:text-sm lg:grid-cols-1 lg:space-y-2 lg:gap-0">
        {linksBeforeIntegrations.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`w-full rounded-xl px-3 py-2 text-left transition ${
                isActive
                  ? "bg-gradient-to-r from-[#f8fafc] to-[#eef2ff] font-semibold text-slate-700 shadow-sm ring-1 ring-[#e2e8f0]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="col-span-full rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-[#eef2ff]/65 p-3 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-white/70 lg:mt-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Website scope</p>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-medium text-white">{websites.length} Total</span>
          </div>

          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">Select Website</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v8.25A2.25 2.25 0 006.75 20.25h10.5A2.25 2.25 0 0019.5 18V9.75"
                />
              </svg>
            </div>
            <select
              value={selectedWebsite}
              onChange={(event) => setSelectedWebsite(event.target.value)}
              disabled={isLoadingWebsites || websites.length === 0}
              className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white/95 py-2.5 pl-9 pr-9 text-[11px] font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-slate-400 sm:text-xs"
            >
              {isLoadingWebsites ? <option>Loading websites...</option> : null}
              {!isLoadingWebsites && websites.length === 0 ? <option>No websites available</option> : null}
              {!isLoadingWebsites
                ? websites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.domain})
                    </option>
                  ))
                : null}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25L12 15.75 4.5 8.25" />
              </svg>
            </div>
          </div>
        </div>

        {linksFromIntegrations.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`w-full rounded-xl px-3 py-2 text-left transition ${
                isActive
                  ? "bg-gradient-to-r from-[#f8fafc] to-[#eef2ff] font-semibold text-slate-700 shadow-sm ring-1 ring-[#e2e8f0]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#ffffff] to-[#f8fafc] p-4 text-slate-700 shadow-sm sm:mt-6 lg:mt-10">
        <p className="text-sm font-semibold sm:text-base">Need Help?</p>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Please check our docs</p>
        <button className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-[10px] font-bold text-white transition hover:bg-slate-700 sm:text-xs">DOCUMENTATION</button>
      </div>
    </aside>
  );
}

export default Sidebar;
