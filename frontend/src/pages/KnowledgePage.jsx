import { useEffect, useMemo, useState } from "react";
import PlatformLayout from "../layouts/PlatformLayout";
import { getUserSessionId } from "../lib/userAuth";
import { fetchUserPrompt, saveUserPrompt } from "../lib/promptsApi";
import { getSelectedWebsiteScope, subscribeWebsiteScope } from "../lib/websiteScope";

function parseAreasInput(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function KnowledgePage() {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [savedPrompt, setSavedPrompt] = useState(null);
  const [masterPrompt, setMasterPrompt] = useState("");
  const [areasText, setAreasText] = useState("");
  const [tone, setTone] = useState("");
  const [pattern, setPattern] = useState("");
  const [requirements, setRequirements] = useState("");
  const [websiteId, setWebsiteId] = useState("");

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

    fetchUserPrompt(sessionUserId, websiteId)
      .then((prompt) => {
        if (cancelled) return;
        setSavedPrompt(prompt);
        if (prompt) {
          setMasterPrompt(prompt.masterPrompt || "");
          setAreasText(Array.isArray(prompt.areas) ? prompt.areas.join("\n") : "");
          setTone(prompt?.writingPattern?.tone || "");
          setPattern(prompt?.writingPattern?.pattern || "");
          setRequirements(prompt?.writingPattern?.requirements || "");
          setIsEditing(false);
        } else {
          setMasterPrompt("");
          setAreasText("");
          setTone("");
          setPattern("");
          setRequirements("");
          setIsEditing(true);
        }
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError.message || "Could not load knowledge prompt");
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

  const parsedAreas = useMemo(() => parseAreasInput(areasText), [areasText]);

  const handleSave = async () => {
    setError("");
    if (!userId) {
      setError("Login required");
      return;
    }
    if (!masterPrompt.trim()) {
      setError("Master prompt is required");
      return;
    }
    if (parsedAreas.length === 0) {
      setError("Add at least one area to be covered");
      return;
    }

    try {
      setIsSaving(true);
      const saved = await saveUserPrompt(userId, {
        websiteId: websiteId || null,
        masterPrompt: masterPrompt.trim(),
        areas: parsedAreas,
        writingPattern: {
          tone: tone.trim(),
          pattern: pattern.trim(),
          requirements: requirements.trim(),
        },
      });
      setSavedPrompt(saved);
      setMasterPrompt(saved?.masterPrompt || masterPrompt.trim());
      setAreasText(Array.isArray(saved?.areas) ? saved.areas.join("\n") : parsedAreas.join("\n"));
      setTone(saved?.writingPattern?.tone || tone.trim());
      setPattern(saved?.writingPattern?.pattern || pattern.trim());
      setRequirements(saved?.writingPattern?.requirements || requirements.trim());
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Could not save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    if (savedPrompt) {
      setMasterPrompt(savedPrompt.masterPrompt || "");
      setAreasText(Array.isArray(savedPrompt.areas) ? savedPrompt.areas.join("\n") : "");
      setTone(savedPrompt?.writingPattern?.tone || "");
      setPattern(savedPrompt?.writingPattern?.pattern || "");
      setRequirements(savedPrompt?.writingPattern?.requirements || "");
      setIsEditing(false);
      setError("");
      return;
    }
    setMasterPrompt("");
    setAreasText("");
    setTone("");
    setPattern("");
    setRequirements("");
    setError("");
  };

  return (
    <PlatformLayout title="Knowledge">
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Writing guidance</p>
            <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">Master Prompt & Coverage Areas</h2>
          </div>
          {savedPrompt && !isEditing ? (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              Edit
            </button>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Loading prompt...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

        {!isLoading ? (
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">Master Prompt</label>
                  <textarea
                    rows={7}
                    value={masterPrompt}
                    onChange={(event) => setMasterPrompt(event.target.value)}
                    placeholder="Describe tone, brand voice, SEO expectations, structure, and quality rules."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 sm:text-sm">Areas To Be Covered (one per line)</label>
                  <textarea
                    rows={6}
                    value={areasText}
                    onChange={(event) => setAreasText(event.target.value)}
                    placeholder={"Industry trends\nHow-to tutorials\nProduct comparisons"}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">Blog Writing Pattern</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm">Tone</label>
                      <input
                        type="text"
                        value={tone}
                        onChange={(event) => setTone(event.target.value)}
                        placeholder="Professional, conversational, authoritative..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm">Pattern</label>
                      <input
                        type="text"
                        value={pattern}
                        onChange={(event) => setPattern(event.target.value)}
                        placeholder="Problem-Solution, AIDA, Listicle..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-600 sm:text-sm">Other Required Data</label>
                      <textarea
                        rows={4}
                        value={requirements}
                        onChange={(event) => setRequirements(event.target.value)}
                        placeholder="Must include CTA style, target audience, internal linking rules, word-count ranges, etc."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Prompt"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <article className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">Master Prompt</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{savedPrompt?.masterPrompt || "No prompt saved yet."}</p>
                </article>

                <article className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">Areas To Cover</p>
                  {Array.isArray(savedPrompt?.areas) && savedPrompt.areas.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {savedPrompt.areas.map((area) => (
                        <li key={area}>{area}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No areas saved yet.</p>
                  )}
                </article>

                <article className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4 shadow-[0_10px_26px_rgba(148,163,184,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">Blog Writing Pattern</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-100/70 px-3 py-2">
                      <p className="text-[11px] text-slate-400 sm:text-xs">Tone</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-700">{savedPrompt?.writingPattern?.tone || "Not set"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-100/70 px-3 py-2">
                      <p className="text-[11px] text-slate-400 sm:text-xs">Pattern</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-700">{savedPrompt?.writingPattern?.pattern || "Not set"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-100/70 px-3 py-2 sm:col-span-2">
                      <p className="text-[11px] text-slate-400 sm:text-xs">Other Required Data</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{savedPrompt?.writingPattern?.requirements || "Not set"}</p>
                    </div>
                  </div>
                </article>
              </>
            )}
          </div>
        ) : null}
      </section>
    </PlatformLayout>
  );
}

export default KnowledgePage;
