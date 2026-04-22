import { useEffect, useState } from "react";
import PlatformLayout from "../layouts/PlatformLayout";
import { getUserSessionId } from "../lib/userAuth";
import { fetchUserSettings, saveUserSettings } from "../lib/settingsApi";
import { getSelectedWebsiteScope, subscribeWebsiteScope } from "../lib/websiteScope";

const FREQUENCY_OPTIONS = ["daily", "weekly", "bi-weekly", "monthly"];
const FEATURED_IMAGE_SIZE_OPTIONS = [
  { value: "1536x1024", label: "Landscape (1536 x 1024)" },
  { value: "1024x1024", label: "Square (1024 x 1024)" },
  { value: "1024x1536", label: "Portrait (1024 x 1536)" },
];

function SettingsPage() {
  const [userId, setUserId] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [featuredImageSize, setFeaturedImageSize] = useState("1536x1024");
  const [blogWordCount, setBlogWordCount] = useState(1200);
  const [websiteId, setWebsiteId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeWebsiteScope((nextWebsiteId) => {
      setWebsiteId(nextWebsiteId || "");
    });
    setWebsiteId(getSelectedWebsiteScope());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sessionUserId = getUserSessionId();
    setUserId(sessionUserId || "");

    if (!sessionUserId) {
      setError("Login required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    fetchUserSettings(sessionUserId, websiteId)
      .then((setting) => {
        if (cancelled) return;
        setFrequency(setting.frequency || "weekly");
        setFeaturedImageSize(setting.featuredImageSize || "1536x1024");
        setBlogWordCount(Number(setting.blogWordCount) || 1200);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError.message || "Could not load settings");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");
    if (!userId) {
      setError("Login required");
      return;
    }
    try {
      setIsSaving(true);
      const saved = await saveUserSettings(userId, {
        websiteId: websiteId || null,
        frequency,
        featuredImageSize,
        blogWordCount,
      });
      setFrequency(saved?.frequency || frequency);
      setFeaturedImageSize(saved?.featuredImageSize || featuredImageSize);
      setBlogWordCount(Number(saved?.blogWordCount) || blogWordCount);
      setSuccessMessage("Settings updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Could not save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PlatformLayout title="Settings">
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Publishing preferences</p>
            <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">Blog Generation Preferences</h2>
            <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
              Settings are scoped to the currently selected website from the sidebar.
            </p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm sm:text-xs">
            Website Scoped
          </span>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-sm text-slate-500">Loading settings...</p>
          </div>
        ) : null}

        {error ? (
          <div className="mb-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-3">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        ) : null}

        {!isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-[#f1f5f9] bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-xs">Publishing Cadence</p>
              <label className="mt-3 mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">
                Blog idea generation frequency
              </label>
              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-slate-500 sm:text-xs">
                Controls how often next-title recommendations are planned.
              </p>
            </article>

            <article className="rounded-2xl border border-[#f1f5f9] bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-xs">Content Length</p>
              <label className="mt-3 mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">
                Target blog word count
              </label>
              <input
                type="number"
                min={300}
                max={4000}
                step={50}
                value={blogWordCount}
                onChange={(event) => setBlogWordCount(Number(event.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-2 text-[11px] text-slate-500 sm:text-xs">
                OpenAI uses this value when generating each blog draft.
              </p>
            </article>

            <article className="rounded-2xl border border-[#f1f5f9] bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-xs">Visual Assets</p>
              <label className="mt-3 mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">
                Featured image size
              </label>
              <select
                value={featuredImageSize}
                onChange={(event) => setFeaturedImageSize(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                {FEATURED_IMAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-slate-500 sm:text-xs">
                Used for generated blog featured images in the Assets folder.
              </p>
            </article>
          </div>
        ) : null}

        {!isLoading ? (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        ) : null}
      </section>
    </PlatformLayout>
  );
}

export default SettingsPage;
