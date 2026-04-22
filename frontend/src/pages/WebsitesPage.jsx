import { useEffect, useState } from "react";
import PlatformLayout from "../layouts/PlatformLayout";
import { getUserSessionId } from "../lib/userAuth";
import { createUserWebsite, fetchUserWebsites } from "../lib/websitesApi";

function statusClasses(status) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "maintenance") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

const ADD_WEBSITE_INITIAL = {
  name: "",
  domain: "",
  techStack: "custom-html",
};

function AddWebsiteModal({ open, onClose, onSaved, userId }) {
  const [form, setForm] = useState(ADD_WEBSITE_INITIAL);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(ADD_WEBSITE_INITIAL);
      setError("");
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!userId) {
      setError("Missing user session");
      return;
    }
    try {
      setIsSubmitting(true);
      const website = await createUserWebsite(userId, {
        name: form.name.trim(),
        domain: form.domain.trim(),
        techStack: form.techStack,
      });
      onSaved(website);
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Could not create website");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/20 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Add website</h3>
            <p className="mt-1 text-sm text-slate-500">Create a website and link it to this account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Website name</label>
              <input className={inputClass} value={form.name} onChange={(ev) => setForm((prev) => ({ ...prev, name: ev.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Domain</label>
              <input className={inputClass} value={form.domain} onChange={(ev) => setForm((prev) => ({ ...prev, domain: ev.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Tech stack</label>
              <select className={inputClass} value={form.techStack} onChange={(ev) => setForm((prev) => ({ ...prev, techStack: ev.target.value }))}>
                <option value="custom-html">Custom HTML</option>
                <option value="wordpress">WordPress</option>
              </select>
            </div>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save website"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [userId, setUserId] = useState("");
  const totalWebsites = websites.length;
  const activeWebsites = websites.filter((site) => site.status === "active").length;
  const maintenanceWebsites = websites.filter((site) => site.status === "maintenance").length;
  const totalPosts = websites.reduce((sum, site) => sum + Number(site.posts || 0), 0);

  useEffect(() => {
    const sessionUserId = getUserSessionId();
    setUserId(sessionUserId || "");
    if (!sessionUserId) {
      setWebsites([]);
      setError("Login required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    fetchUserWebsites(sessionUserId)
      .then((sites) => {
        if (!cancelled) {
          setWebsites(sites);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setWebsites([]);
          setError(loadError.message || "Could not load websites");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PlatformLayout title="Websites">
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
            <p className="text-[11px] text-slate-400 sm:text-xs">Total Websites</p>
            <p className="text-xl font-bold text-slate-800 sm:text-2xl xl:text-[1.7rem]">{totalWebsites}</p>
          </article>
          <article className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
            <p className="text-[11px] text-slate-400 sm:text-xs">Active Websites</p>
            <p className="text-xl font-bold text-slate-800 sm:text-2xl xl:text-[1.7rem]">
              {activeWebsites} <span className="text-xs text-lime-500 sm:text-sm">Live</span>
            </p>
          </article>
          <article className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
            <p className="text-[11px] text-slate-400 sm:text-xs">Maintenance</p>
            <p className="text-xl font-bold text-slate-800 sm:text-2xl xl:text-[1.7rem]">
              {maintenanceWebsites} <span className="text-xs text-amber-500 sm:text-sm">Check</span>
            </p>
          </article>
          <article className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
            <p className="text-[11px] text-slate-400 sm:text-xs">Total Posts</p>
            <p className="text-xl font-bold text-slate-800 sm:text-2xl xl:text-[1.7rem]">{totalPosts}</p>
          </article>
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Connected websites</p>
            <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">{totalWebsites} websites</h2>
          </div>
          <button
            onClick={() => setShowAddWebsite(true)}
            className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-xs font-medium text-white transition hover:from-slate-600 hover:to-slate-700 sm:text-sm"
          >
            Add Website
          </button>
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Loading websites...</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!isLoading && !error && websites.length === 0 ? (
          <p className="text-sm text-slate-500">No websites found for this account.</p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {websites.map((site) => (
            <article
              key={site.id}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(148,163,184,0.2)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-800">{site.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{site.domain}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClasses(site.status)}`}>
                  {site.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-100/70 px-3 py-2">
                  <p className="text-slate-400">Tech stack</p>
                  <p className="mt-0.5 font-semibold text-slate-700 capitalize">{String(site.techStack || "n/a").replace("-", " ")}</p>
                </div>
                <div className="rounded-lg bg-slate-100/70 px-3 py-2">
                  <p className="text-slate-400">Posts</p>
                  <p className="mt-0.5 font-semibold text-slate-700">{site.posts}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Updated{" "}
                  {site.updatedAt
                    ? new Date(site.updatedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </p>
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
                  Manage
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <AddWebsiteModal
        open={showAddWebsite}
        onClose={() => setShowAddWebsite(false)}
        userId={userId}
        onSaved={(newWebsite) => {
          setWebsites((prev) => [newWebsite, ...prev]);
        }}
      />
    </PlatformLayout>
  );
}

export default WebsitesPage;
