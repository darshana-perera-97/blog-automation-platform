import { useEffect, useState } from "react";
import PlatformLayout from "../layouts/PlatformLayout";
import {
  fetchBlogsToWrite,
  fetchUpcomingBlogs,
  fetchUserBlogs,
  publishBlog,
} from "../lib/blogsApi";
import { getUserSessionId } from "../lib/userAuth";
import { getSelectedWebsiteScope, subscribeWebsiteScope } from "../lib/websiteScope";

const API_BASE = "http://localhost:4321";

function buildOutline(title) {
  return [
    `Introduction: Why "${title}" matters now`,
    "Current challenges and missed opportunities",
    "Step-by-step implementation plan",
    "Real-world example or mini case study",
    "Action checklist and conclusion",
  ];
}

function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [blogsToWrite, setBlogsToWrite] = useState([]);
  const [activeTab, setActiveTab] = useState("to-publish");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [websiteId, setWebsiteId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [publishingBlogId, setPublishingBlogId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeWebsiteScope((nextWebsiteId) => {
      setWebsiteId(nextWebsiteId || "");
    });
    setWebsiteId(getSelectedWebsiteScope());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sessionUserId = getUserSessionId();

    if (!sessionUserId) {
      setError("Login required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    Promise.all([
      fetchUserBlogs(sessionUserId, websiteId),
      fetchUpcomingBlogs(sessionUserId, websiteId),
      fetchBlogsToWrite(sessionUserId, websiteId),
    ])
      .then(([userBlogs, upcomingData, toWrite]) => {
        if (cancelled) return;
        setBlogs(userBlogs);
        setUpcoming(upcomingData);
        setBlogsToWrite(toWrite);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError.message || "Could not load blogs page data");
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

  const closeBlogModal = () => {
    setSelectedBlog(null);
  };

  const createdBlogs = blogs.filter((blog) => String(blog.status || "published") === "created");
  const publishedBlogs = blogs.filter((blog) => String(blog.status || "published") !== "created");

  const handlePublishBlog = async (blogId) => {
    const sessionUserId = getUserSessionId();
    if (!sessionUserId) {
      setError("Login required");
      return;
    }
    try {
      setPublishingBlogId(String(blogId));
      const updated = await publishBlog(sessionUserId, blogId, { websiteId: websiteId || null });
      if (!updated) return;
      setBlogs((prev) =>
        prev.map((item) => (String(item.id) === String(blogId) ? updated : item))
      );
    } catch (publishError) {
      setError(publishError.message || "Could not publish blog");
    } finally {
      setPublishingBlogId("");
    }
  };

  return (
    <PlatformLayout title="Blogs">
      <section className="mb-4 rounded-3xl border border-[#f1f5f9] bg-white p-4 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("to-publish")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition sm:text-sm ${
              activeTab === "to-publish"
                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            To Publish
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("created")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition sm:text-sm ${
              activeTab === "created"
                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Created
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition sm:text-sm ${
              activeTab === "published"
                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Published
          </button>
        </div>
      </section>

      {activeTab === "to-publish" ? (
        <>
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <div className="mb-4">
          <p className="text-sm text-slate-500">Pipeline cards</p>
          <h3 className="text-lg font-semibold text-slate-800 sm:text-xl">Upcoming + To Write</h3>
        </div>
        {(!upcoming?.titles?.length && blogsToWrite.length === 0) ? (
          <p className="text-sm text-slate-500">No upcoming items found.</p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(upcoming?.titles || []).map((title, index) => (
            <article
              key={`upcoming-${title}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-[#eef2ff]/40 p-4 shadow-[0_14px_35px_rgba(15,23,42,0.08)] ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:p-5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-200/40 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">Upcoming Idea #{index + 1}</p>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white">Draft</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 sm:text-base">{title}</p>
              </div>
              <ul className="relative mt-4 list-disc space-y-1.5 pl-5 text-xs text-slate-600 sm:text-sm">
                {buildOutline(title).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
          {blogsToWrite.map((item) => (
            <article
              key={`to-write-${item.selectedAt}-${item.title}`}
              className="group relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-white p-4 shadow-[0_14px_35px_rgba(16,185,129,0.12)] ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(16,185,129,0.18)] sm:p-5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-200/45 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600 sm:text-xs">Selected To Write</p>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white">Queued</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 sm:text-base">{item.title}</p>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 sm:text-xs">
                {item.selectedAt
                  ? new Date(item.selectedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-xs text-slate-600 sm:text-sm">
                {buildOutline(item.title).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
        </>
      ) : activeTab === "created" ? (
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <div className="mb-4">
          <p className="text-sm text-slate-500">Review queue</p>
          <h3 className="text-lg font-semibold text-slate-800 sm:text-xl">Created</h3>
        </div>
        {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {createdBlogs.length === 0 ? <p className="text-sm text-slate-500">No created blogs to review.</p> : null}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {createdBlogs.map((blog) => (
            <article
              key={blog.id}
              className="group relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-white to-white p-4 shadow-[0_14px_35px_rgba(251,191,36,0.12)] ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(251,191,36,0.18)] sm:p-5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-200/45 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-semibold text-white">Created</span>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 sm:text-base">{blog.title}</p>
              </div>
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">{blog.content}</p>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handlePublishBlog(blog.id)}
                  disabled={publishingBlogId === String(blog.id)}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-60 sm:text-sm"
                >
                  {publishingBlogId === String(blog.id) ? "Publishing..." : "Publish"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : (
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <div className="mb-4">
          <p className="text-sm text-slate-500">Generated output</p>
          <h3 className="text-lg font-semibold text-slate-800 sm:text-xl">Published</h3>
        </div>
        {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {publishedBlogs.length === 0 ? <p className="text-sm text-slate-500">No published blogs yet.</p> : null}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {publishedBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-[#eef2ff]/35 p-4 shadow-[0_14px_35px_rgba(15,23,42,0.08)] ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:p-5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-100/50 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white">Published</span>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 sm:text-base">{blog.title}</p>
              </div>
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">{blog.content}</p>
            </article>
          ))}
        </div>
      </section>
      )}

      {selectedBlog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            onClick={closeBlogModal}
            aria-label="Close details"
          />
          <article className="modal-thin-scrollbar relative z-10 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/80 bg-white p-5 shadow-2xl shadow-slate-900/20 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-xs">Published Blog</p>
                <h3 className="mt-1 text-lg font-semibold leading-7 text-slate-800 sm:text-xl">{selectedBlog.title}</h3>
                <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                  {selectedBlog.createdAt
                    ? new Date(selectedBlog.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBlogModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedBlog.featuredImage ? (
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60">
                <img
                  src={`${API_BASE}/${selectedBlog.featuredImage}`}
                  alt={selectedBlog.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{selectedBlog.content}</pre>
            </div>
          </article>
        </div>
      ) : null}
    </PlatformLayout>
  );
}

export default BlogsPage;
