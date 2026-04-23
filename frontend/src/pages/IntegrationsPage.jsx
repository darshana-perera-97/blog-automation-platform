import { useEffect, useMemo, useState } from "react";
import PlatformLayout from "../layouts/PlatformLayout";
import { fetchUserBlogs } from "../lib/blogsApi";
import { getUserSessionId } from "../lib/userAuth";
import { getSelectedWebsiteScope, subscribeWebsiteScope } from "../lib/websiteScope";
import { fetchUserWebsites } from "../lib/websitesApi";

function stripMarkdown(value) {
  return String(value || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function buildExcerpt(markdown) {
  const plain = stripMarkdown(markdown).replace(/\s+/g, " ").trim();
  if (!plain) return "";
  return plain.length > 180 ? `${plain.slice(0, 177)}...` : plain;
}

function buildWebsiteIntegrationFiles(site, blogs) {
  const published = blogs
    .filter((item) => String(item.status || "") === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt || 0).getTime() -
        new Date(a.publishedAt || a.createdAt || 0).getTime()
    );

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${site.name} Blogs</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 16px; }
    h1 { margin: 0 0 8px; }
    .meta { margin: 0 0 24px; color: #64748b; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .card-link { color: inherit; text-decoration: none; display: block; cursor: pointer; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); transition: transform 0.15s ease; }
    .card-link:hover .card { transform: translateY(-2px); }
    .thumb { width: 100%; height: 160px; object-fit: cover; background: #e2e8f0; display: block; }
    .content { padding: 14px; }
    .title { margin: 0 0 8px; font-size: 18px; line-height: 1.35; }
    .excerpt { margin: 0 0 12px; color: #475569; font-size: 14px; line-height: 1.5; }
    .date { margin: 0; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <main class="container">
    <h1>${site.name} Blogs</h1>
    <p class="meta">Domain: ${site.domain}</p>
    <section class="grid" id="blog-grid"></section>
  </main>
  <script>
    const apiBase = "http://localhost:4321";
    const userId = "${site.userId}";
    const websiteId = "${site.id}";
    const grid = document.getElementById("blog-grid");
    const toAssetUrl = (value) => {
      if (!value) return "";
      if (/^https?:\\/\\//i.test(value)) return value;
      const normalized = String(value).startsWith("/") ? String(value) : \`/\${value}\`;
      return \`\${apiBase}\${normalized}\`;
    };
    fetch(\`\${apiBase}/public/blogs/published?userId=\${encodeURIComponent(userId)}&websiteId=\${encodeURIComponent(websiteId)}\`)
      .then((res) => res.json())
      .then((data) => {
        const blogs = Array.isArray(data?.blogs) ? data.blogs : [];
        if (!blogs.length) {
          grid.innerHTML = "<p style=\\"grid-column:1/-1;color:#64748b\\">No published blogs yet.</p>";
          return;
        }
        grid.innerHTML = blogs.map((blog) => \`
          <a class="card-link" href="./blog.html?slug=\${encodeURIComponent(blog.slug || "")}&userId=\${encodeURIComponent(userId)}&websiteId=\${encodeURIComponent(websiteId)}&apiBase=\${encodeURIComponent(apiBase)}">
            <article class="card">
              \${blog.featuredImage ? \`<img class="thumb" src="\${toAssetUrl(blog.featuredImage)}" alt="\${blog.title}" />\` : ""}
              <div class="content">
                <h2 class="title">\${blog.title || ""}</h2>
                <p class="excerpt">\${blog.excerpt || ""}</p>
                <p class="date">\${blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ""}</p>
              </div>
            </article>
          </a>
        \`).join("");
      })
      .catch(() => {
        grid.innerHTML = "<p style=\\"grid-column:1/-1;color:#ef4444\\">Failed to load blogs from backend API.</p>";
      });

    grid.addEventListener("click", (event) => {
      const card = event.target.closest(".card-link");
      if (!card) return;
      const href = card.getAttribute("href");
      if (!href) return;
      window.location.href = href;
    });
  </script>
</body>
</html>`;

  const singleBlogHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${site.name} Blog</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; }
    .container { max-width: 860px; margin: 0 auto; padding: 28px 16px 48px; }
    .back { display: inline-block; margin-bottom: 18px; color: #334155; text-decoration: none; font-size: 14px; }
    .hero { width: 100%; border-radius: 12px; margin: 0 0 20px; object-fit: cover; }
    article { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; line-height: 1.7; }
    h1,h2,h3 { line-height: 1.35; color: #0f172a; }
    p, li { color: #1e293b; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <main class="container">
    <a class="back" href="./index.html">← Back to all blogs</a>
    <div id="blog-root"></div>
  </main>
  <script>
    const root = document.getElementById("blog-root");
    const params = new URLSearchParams(window.location.search);
    const apiBase = params.get("apiBase") || "http://localhost:4321";
    const userId = params.get("userId") || "${site.userId}";
    const websiteId = params.get("websiteId") || "${site.id}";
    const slug = params.get("slug") || "";

    const toAssetUrl = (value) => {
      if (!value) return "";
      if (/^https?:\\/\\//i.test(value)) return value;
      const normalized = String(value).startsWith("/") ? String(value) : \`/\${value}\`;
      return \`\${apiBase}\${normalized}\`;
    };

    const mdToHtml = (markdown) => {
      const lines = String(markdown || "").split("\\n");
      const html = [];
      let inList = false;
      lines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) {
          if (inList) {
            html.push("</ul>");
            inList = false;
          }
          return;
        }
        if (/^###\\s+/.test(line)) {
          if (inList) { html.push("</ul>"); inList = false; }
          html.push(\`<h3>\${line.replace(/^###\\s+/, "")}</h3>\`);
          return;
        }
        if (/^##\\s+/.test(line)) {
          if (inList) { html.push("</ul>"); inList = false; }
          html.push(\`<h2>\${line.replace(/^##\\s+/, "")}</h2>\`);
          return;
        }
        if (/^#\\s+/.test(line)) {
          if (inList) { html.push("</ul>"); inList = false; }
          html.push(\`<h1>\${line.replace(/^#\\s+/, "")}</h1>\`);
          return;
        }
        if (/^[-*]\\s+/.test(line)) {
          if (!inList) {
            html.push("<ul>");
            inList = true;
          }
          html.push(\`<li>\${line.replace(/^[-*]\\s+/, "")}</li>\`);
          return;
        }
        if (inList) { html.push("</ul>"); inList = false; }
        html.push(\`<p>\${line}</p>\`);
      });
      if (inList) html.push("</ul>");
      return html.join("");
    };

    if (!slug) {
      root.innerHTML = "<p style=\\"color:#ef4444\\">Blog slug missing in URL.</p>";
    } else {
      fetch(\`\${apiBase}/public/blogs/latest?userId=\${encodeURIComponent(userId)}&websiteId=\${encodeURIComponent(websiteId)}&slug=\${encodeURIComponent(slug)}\`)
        .then((res) => res.json())
        .then((data) => {
          const blog = data?.blog;
          if (!blog) {
            root.innerHTML = "<p style=\\"color:#64748b\\">Blog not found. Check slug/userId/websiteId params.</p>";
            return;
          }
          root.innerHTML = \`
            \${blog.featuredImage ? \`<img class="hero" src="\${toAssetUrl(blog.featuredImage)}" alt="\${blog.title || ""}" />\` : ""}
            <article>\${mdToHtml(blog.content || "")}</article>
          \`;
        })
        .catch(() => {
          root.innerHTML = "<p style=\\"color:#ef4444\\">Failed to load blog from backend API.</p>";
        });
    }
  </script>
</body>
</html>`;

  return { indexHtml, singleBlogHtml, publishedCount: published.length };
}

function IntegrationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeWebsiteScope((nextWebsiteId) => {
      setSelectedWebsiteId(nextWebsiteId || "");
    });
    setSelectedWebsiteId(getSelectedWebsiteScope());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const userId = getUserSessionId();
    if (!userId) {
      setError("Login required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    fetchUserWebsites(userId)
      .then(async (websites) => {
        const siteToShow = selectedWebsiteId
          ? websites.filter((site) => String(site.id) === String(selectedWebsiteId))
          : [];
        const withBlogs = await Promise.all(siteToShow.map(async (site) => ({ site, blogs: await fetchUserBlogs(userId, site.id) })));
        if (cancelled) return;
        setItems(withBlogs);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setItems([]);
        setError(loadError.message || "Could not load integrations data");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWebsiteId]);

  const cards = useMemo(
    () =>
      items.map(({ site, blogs }) => {
        const files = buildWebsiteIntegrationFiles(site, blogs);
        return { site, ...files };
      }),
    [items]
  );

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard failures on unsupported environments.
    }
  };

  return (
    <PlatformLayout title="Intergrations">
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">Website HTML Integrations</h2>
        <p className="mt-1 text-sm text-slate-500">
          For each website, create a <code>blogs</code> folder on your host and paste both <code>index.html</code> and <code>blog.html</code> files.
        </p>

        {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading websites...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        {!isLoading && !error && !selectedWebsiteId ? (
          <p className="mt-4 text-sm text-slate-500">Select a website from sidebar Website Scope to view its integration code.</p>
        ) : null}
        {!isLoading && !error && selectedWebsiteId && cards.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Selected website not found or inaccessible.</p>
        ) : null}

        <div className="mt-4 space-y-4">
          {cards.map((item) => (
            <article key={item.site.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{item.site.name}</h3>
                  <p className="text-xs text-slate-500">
                    {item.site.domain} | Published blogs: {item.publishedCount}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-600">File: /blogs/index.html</p>
                  <button
                    type="button"
                    onClick={() => copyText(item.indexHtml)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
                  >
                    Copy
                  </button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-slate-100">{item.indexHtml}</pre>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-600">File: /blogs/blog.html</p>
                  <button
                    type="button"
                    onClick={() => copyText(item.singleBlogHtml)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
                  >
                    Copy
                  </button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-slate-100">{item.singleBlogHtml}</pre>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PlatformLayout>
  );
}

export default IntegrationsPage;
