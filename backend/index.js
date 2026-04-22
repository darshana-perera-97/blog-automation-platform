const http = require("http");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const USERS_FILE = path.join(__dirname, "data", "users.json");
const WEBSITES_FILE = path.join(__dirname, "data", "websites.json");
const PROMPTS_FILE = path.join(__dirname, "data", "prompts.json");
const SETTINGS_FILE = path.join(__dirname, "data", "settings.json");
const BLOGS_FILE = path.join(__dirname, "data", "blogs.json");
const ASSETS_DIR = path.join(__dirname, "data", "Assets");
const UPCOMING_BLOGS_FILE = path.join(__dirname, "data", "upcomingBlogs.json");
const BLOGS_TO_WRITE_FILE = path.join(__dirname, "data", "blogsToWrite.json");
const PLANS = new Set(["starter", "basic", "pro", "ultra"]);
const STATUSES = new Set(["active", "inactive"]);
const TECH_STACKS = new Set(["custom-html", "wordpress"]);
const BLOG_FREQUENCIES = new Set(["daily", "weekly", "bi-weekly", "monthly"]);
const FEATURED_IMAGE_SIZES = new Set(["1024x1024", "1536x1024", "1024x1536"]);
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const DEFAULT_BLOG_WORD_COUNT = 1200;

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function nextUserId(users) {
  const ids = users
    .map((u) => (typeof u.userId === "number" ? u.userId : parseInt(String(u.userId), 10)))
    .filter((n) => !Number.isNaN(n));
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
}

function readWebsites() {
  try {
    const raw = fs.readFileSync(WEBSITES_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeWebsites(websites) {
  const dir = path.dirname(WEBSITES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(WEBSITES_FILE, JSON.stringify(websites, null, 2), "utf8");
}

function nextWebsiteId(websites) {
  const ids = websites
    .map((w) => (typeof w.id === "number" ? w.id : parseInt(String(w.id), 10)))
    .filter((n) => !Number.isNaN(n));
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
}

function readPrompts() {
  try {
    const raw = fs.readFileSync(PROMPTS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writePrompts(prompts) {
  const dir = path.dirname(PROMPTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf8");
}

function readSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeSettings(settings) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
}

function readBlogs() {
  try {
    const raw = fs.readFileSync(BLOGS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeBlogs(blogs) {
  const dir = path.dirname(BLOGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf8");
}

function readUpcomingBlogs() {
  try {
    const raw = fs.readFileSync(UPCOMING_BLOGS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeUpcomingBlogs(items) {
  const dir = path.dirname(UPCOMING_BLOGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(UPCOMING_BLOGS_FILE, JSON.stringify(items, null, 2), "utf8");
}

function readBlogsToWrite() {
  try {
    const raw = fs.readFileSync(BLOGS_TO_WRITE_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeBlogsToWrite(items) {
  const dir = path.dirname(BLOGS_TO_WRITE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BLOGS_TO_WRITE_FILE, JSON.stringify(items, null, 2), "utf8");
}

function nextBlogId(blogs) {
  const ids = blogs
    .map((b) => (typeof b.id === "number" ? b.id : parseInt(String(b.id), 10)))
    .filter((n) => !Number.isNaN(n));
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
}

function normalizeFrequency(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (BLOG_FREQUENCIES.has(normalized)) {
    return normalized;
  }
  return "weekly";
}

function normalizeFeaturedImageSize(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (FEATURED_IMAGE_SIZES.has(normalized)) {
    return normalized;
  }
  return "1536x1024";
}

function normalizeBlogWordCount(value) {
  const parsed = parseInt(String(value || ""), 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_BLOG_WORD_COUNT;
  }
  if (parsed < 300) return 300;
  if (parsed > 4000) return 4000;
  return parsed;
}

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing on the backend environment");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function parseTitles(rawText) {
  return String(rawText || "")
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\d.]+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function normalizeWebsiteId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function sanitizeForFilename(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function maxWebsitesForPlan(plan) {
  const planNorm = String(plan || "").toLowerCase();
  if (planNorm === "ultra") return 5;
  if (planNorm === "pro") return 3;
  if (planNorm === "starter" || planNorm === "basic") return 1;
  return 1;
}

function isStarterExpired(user) {
  if (String(user?.plan || "").toLowerCase() !== "starter") return false;
  const createdAtMs = new Date(user?.createdAt || "").getTime();
  if (Number.isNaN(createdAtMs)) return false;
  const expiresAtMs = createdAtMs + 7 * 24 * 60 * 60 * 1000;
  return Date.now() > expiresAtMs;
}

function syncStarterExpiryStatus(users, user) {
  if (!user) return { user, statusChanged: false };
  if (!isStarterExpired(user)) return { user, statusChanged: false };

  const nextStatus = "inactive";
  if (String(user.status || "").toLowerCase() === nextStatus) {
    return { user, statusChanged: false };
  }

  const updatedUsers = users.map((u) =>
    String(u.userId) === String(user.userId) ? { ...u, status: nextStatus } : u
  );
  writeUsers(updatedUsers);
  const updatedUser = updatedUsers.find((u) => String(u.userId) === String(user.userId)) || user;
  return { user: updatedUser, statusChanged: true };
}

const PORT = process.env.PORT || 4321;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, "http://localhost");
  const pathname = requestUrl.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
    res.end(
      JSON.stringify({
        message: "Backend server is running",
      })
    );
    return;
  }

  if (req.method === "GET" && pathname === "/site-health") {
    res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
    res.end(
      JSON.stringify({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (req.method === "GET" && pathname === "/publisher/blog.js") {
    const script = `(function () {
  var currentScript = document.currentScript;
  var userId = currentScript && currentScript.getAttribute("data-user-id");
  var websiteId = currentScript && currentScript.getAttribute("data-website-id");
  var slug = currentScript && currentScript.getAttribute("data-slug");
  var apiBase = (currentScript && currentScript.getAttribute("data-api-base")) || "http://localhost:4321";
  var mountSelector = (currentScript && currentScript.getAttribute("data-mount")) || "body";
  var mountNode = document.querySelector(mountSelector) || document.body;

  if (!userId || !websiteId) {
    mountNode.innerHTML = "<p style=\\"font-family:Arial,sans-serif;color:#ef4444\\">Missing data-user-id or data-website-id on script tag.</p>";
    return;
  }

  var query = "?userId=" + encodeURIComponent(userId) + "&websiteId=" + encodeURIComponent(websiteId);
  if (slug) query += "&slug=" + encodeURIComponent(slug);

  fetch(apiBase + "/public/blogs/latest" + query)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || !data.blog) {
        mountNode.innerHTML = "<p style=\\"font-family:Arial,sans-serif;color:#64748b\\">No published blog found yet.</p>";
        return;
      }
      var blog = data.blog;
      var html = blog.content || "";
      html = html
        .replace(/^#\\s+(.+)$/gm, "<h1>$1</h1>")
        .replace(/^##\\s+(.+)$/gm, "<h2>$1</h2>")
        .replace(/^(?!<h1>|<h2>|\\s*$)(.+)$/gm, "<p>$1</p>");

      mountNode.innerHTML =
        "<article style=\\"max-width:850px;margin:24px auto;padding:24px;border:1px solid #e2e8f0;border-radius:18px;background:#fff;font-family:Inter,Arial,sans-serif;color:#1e293b;line-height:1.7\\">" +
        (blog.featuredImage ? "<img src='" + apiBase + "/" + blog.featuredImage + "' alt='Featured image' style='width:100%;border-radius:14px;margin-bottom:18px;object-fit:cover'/>" : "") +
        html +
        "</article>";
    })
    .catch(function () {
      mountNode.innerHTML = "<p style=\\"font-family:Arial,sans-serif;color:#ef4444\\">Failed to load published blog.</p>";
    });
})();`;

    res.writeHead(200, { "Content-Type": "application/javascript", ...corsHeaders });
    res.end(script);
    return;
  }

  if (req.method === "GET" && pathname === "/public/blogs/latest") {
    const userIdParam = requestUrl.searchParams.get("userId");
    const websiteIdParam = normalizeWebsiteId(requestUrl.searchParams.get("websiteId"));
    const slugParam = toSlug(requestUrl.searchParams.get("slug") || "");

    if (!userIdParam || websiteIdParam === null) {
      res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: false, message: "userId and websiteId are required" }));
      return;
    }

    const published = readBlogs()
      .filter(
        (item) =>
          String(item.userId) === String(userIdParam) &&
          normalizeWebsiteId(item.websiteId) === websiteIdParam &&
          String(item.status || "") === "published"
      )
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime());

    const blog = slugParam
      ? published.find((item) => toSlug(item.slug || item.title) === slugParam) || null
      : published[0] || null;

    res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
    res.end(JSON.stringify({ success: true, blog }));
    return;
  }

  const assetMatch = pathname.match(/^\/data\/Assets\/([^/]+)$/);
  if (req.method === "GET" && assetMatch) {
    const safeName = path.basename(assetMatch[1]);
    const filePath = path.join(ASSETS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: false, message: "Asset not found" }));
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".svg"
              ? "image/svg+xml"
              : "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, ...corsHeaders });
    res.end(fs.readFileSync(filePath));
    return;
  }

  if (req.method === "GET") {
    const userDetailMatch = pathname.match(/^\/admin\/users\/([^/]+)$/);
    if (userDetailMatch) {
      const idParam = userDetailMatch[1];
      const users = readUsers();
      const user = users.find((u) => String(u.userId) === String(idParam));
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ message: "User not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify(user));
      return;
    }

    const userWebsitesMatch = pathname.match(/^\/users\/([^/]+)\/websites$/);
    if (userWebsitesMatch) {
      const userIdParam = userWebsitesMatch[1];
      const users = readUsers();
      const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
      if (!rawUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "User not found" }));
        return;
      }
      const { user } = syncStarterExpiryStatus(users, rawUser);
      if (String(user.status || "").toLowerCase() !== "active") {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
        res.end(
          JSON.stringify({
            success: false,
            message: "Your account is inactive. Upgrade your plan to continue using website functions.",
          })
        );
        return;
      }

      const websites = readWebsites().filter((site) => String(site.userId) === String(userIdParam));
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: true, websites }));
      return;
    }

    const userPromptMatch = pathname.match(/^\/users\/([^/]+)\/prompts$/);
    if (userPromptMatch) {
      const userIdParam = userPromptMatch[1];
      const websiteIdParam = normalizeWebsiteId(requestUrl.searchParams.get("websiteId"));
      const users = readUsers();
      const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
      if (!rawUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "User not found" }));
        return;
      }
      const { user } = syncStarterExpiryStatus(users, rawUser);
      if (String(user.status || "").toLowerCase() !== "active") {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
        res.end(
          JSON.stringify({
            success: false,
            message: "Your account is inactive. Upgrade your plan to continue using prompt functions.",
          })
        );
        return;
      }

      const prompts = readPrompts();
      const prompt =
        prompts.find(
          (item) =>
            String(item.userId) === String(userIdParam) &&
            normalizeWebsiteId(item.websiteId) === websiteIdParam
        ) ||
        prompts.find((item) => String(item.userId) === String(userIdParam)) ||
        null;
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: true, prompt }));
      return;
    }

    const userSettingsMatch = pathname.match(/^\/users\/([^/]+)\/settings$/);
    if (userSettingsMatch) {
      const userIdParam = userSettingsMatch[1];
      const websiteIdParam = normalizeWebsiteId(requestUrl.searchParams.get("websiteId"));
      const users = readUsers();
      const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
      if (!rawUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "User not found" }));
        return;
      }
      const { user } = syncStarterExpiryStatus(users, rawUser);
      if (String(user.status || "").toLowerCase() !== "active") {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
        return;
      }

      const settings = readSettings();
      const rawSetting =
        settings.find(
          (item) =>
            String(item.userId) === String(userIdParam) &&
            normalizeWebsiteId(item.websiteId) === websiteIdParam
        ) || settings.find((item) => String(item.userId) === String(userIdParam));
      const setting = rawSetting
        ? {
            ...rawSetting,
            frequency: normalizeFrequency(rawSetting.frequency),
            featuredImageSize: normalizeFeaturedImageSize(rawSetting.featuredImageSize),
            blogWordCount: normalizeBlogWordCount(rawSetting.blogWordCount),
          }
        : {
            userId: Number(userIdParam),
            websiteId: websiteIdParam,
            frequency: "weekly",
            featuredImageSize: "1536x1024",
            blogWordCount: DEFAULT_BLOG_WORD_COUNT,
          };
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: true, setting }));
      return;
    }

    const userBlogsMatch = pathname.match(/^\/users\/([^/]+)\/blogs$/);
    if (userBlogsMatch) {
      const userIdParam = userBlogsMatch[1];
      const websiteIdParam = normalizeWebsiteId(requestUrl.searchParams.get("websiteId"));
      const users = readUsers();
      const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
      if (!rawUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "User not found" }));
        return;
      }
      const { user } = syncStarterExpiryStatus(users, rawUser);
      if (String(user.status || "").toLowerCase() !== "active") {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
        return;
      }

      const blogs = readBlogs()
        .filter(
          (item) =>
            String(item.userId) === String(userIdParam) &&
            (websiteIdParam === null || normalizeWebsiteId(item.websiteId) === websiteIdParam)
        )
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: true, blogs }));
      return;
    }

    const userUpcomingBlogsMatch = pathname.match(/^\/users\/([^/]+)\/blogs\/upcoming$/);
    if (userUpcomingBlogsMatch) {
      const userIdParam = userUpcomingBlogsMatch[1];
      const websiteIdParam = normalizeWebsiteId(requestUrl.searchParams.get("websiteId"));
      const users = readUsers();
      const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
      if (!rawUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "User not found" }));
        return;
      }
      const { user } = syncStarterExpiryStatus(users, rawUser);
      if (String(user.status || "").toLowerCase() !== "active") {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
        return;
      }

      const upcoming =
        readUpcomingBlogs().find(
          (item) =>
            String(item.userId) === String(userIdParam) &&
            (websiteIdParam === null || normalizeWebsiteId(item.websiteId) === websiteIdParam)
        ) ||
        null;
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: true, upcoming }));
      return;
    }

    const userBlogsToWriteMatch = pathname.match(/^\/users\/([^/]+)\/blogs\/to-write$/);
    if (userBlogsToWriteMatch) {
      const userIdParam = userBlogsToWriteMatch[1];
      const websiteIdParam = normalizeWebsiteId(requestUrl.searchParams.get("websiteId"));
      const users = readUsers();
      const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
      if (!rawUser) {
        res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "User not found" }));
        return;
      }
      const { user } = syncStarterExpiryStatus(users, rawUser);
      if (String(user.status || "").toLowerCase() !== "active") {
        res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
        return;
      }

      const items = readBlogsToWrite()
        .filter(
          (item) =>
            String(item.userId) === String(userIdParam) &&
            (websiteIdParam === null || normalizeWebsiteId(item.websiteId) === websiteIdParam)
        )
        .sort((a, b) => new Date(b.selectedAt || 0).getTime() - new Date(a.selectedAt || 0).getTime());
      res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
      res.end(JSON.stringify({ success: true, items }));
      return;
    }
  }

  if (req.method === "GET" && pathname === "/admin/users") {
    const users = readUsers();
    const safe = users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
    res.end(JSON.stringify(safe));
    return;
  }

  if (req.method === "POST" && pathname === "/admin/users") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const {
          username,
          email,
          contactNumber,
          password,
          passwordConfirm,
          plan,
          status,
        } = payload;

        if (!username || typeof username !== "string") {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Username is required" }));
          return;
        }
        if (!email || typeof email !== "string") {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Email is required" }));
          return;
        }
        if (!contactNumber || typeof contactNumber !== "string") {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Contact number is required" }));
          return;
        }
        if (!password || typeof password !== "string") {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Password is required" }));
          return;
        }
        if (password !== passwordConfirm) {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Passwords do not match" }));
          return;
        }
        const planNorm = String(plan || "").toLowerCase();
        const statusNorm = String(status || "").toLowerCase();
        if (!PLANS.has(planNorm)) {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Invalid plan" }));
          return;
        }
        if (!STATUSES.has(statusNorm)) {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Invalid status" }));
          return;
        }

        const users = readUsers();
        const emailLower = email.trim().toLowerCase();
        const usernameTrim = username.trim();
        const duplicate = users.some(
          (u) =>
            String(u.email || "").toLowerCase() === emailLower ||
            String(u.username || "").toLowerCase() === usernameTrim.toLowerCase()
        );
        if (duplicate) {
          res.writeHead(409, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Username or email already exists" }));
          return;
        }

        const userId = nextUserId(users);
        const newUser = {
          userId,
          username: usernameTrim,
          email: email.trim(),
          contactNumber: String(contactNumber).trim(),
          password,
          plan: planNorm,
          status: statusNorm,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        writeUsers(users);

        const { password: _p, ...created } = newUser;
        res.writeHead(201, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: true, user: created }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
        res.end(JSON.stringify({ success: false, message: "Invalid JSON body" }));
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/admin/login") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const isValidAdmin =
          payload.username === ADMIN_USERNAME && payload.password === ADMIN_PASSWORD;

        if (!isValidAdmin) {
          res.writeHead(401, { "Content-Type": "application/json", ...corsHeaders });
          res.end(
            JSON.stringify({
              success: false,
              message: "Invalid admin credentials",
            })
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
        res.end(
          JSON.stringify({
            success: true,
            message: "Admin login successful",
          })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
        res.end(
          JSON.stringify({
            success: false,
            message: "Invalid JSON body",
          })
        );
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/login") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const identifier = String(payload.username || payload.email || "")
          .trim()
          .toLowerCase();
        const password = String(payload.password || "");

        if (!identifier || !password) {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(
            JSON.stringify({
              success: false,
              message: "Email/username and password are required",
            })
          );
          return;
        }

        const users = readUsers();
        const matchedUser = users.find((user) => {
          const email = String(user.email || "").trim().toLowerCase();
          const username = String(user.username || "").trim().toLowerCase();
          return (email === identifier || username === identifier) && String(user.password || "") === password;
        });

        if (!matchedUser) {
          res.writeHead(401, { "Content-Type": "application/json", ...corsHeaders });
          res.end(
            JSON.stringify({
              success: false,
              message: "Invalid login credentials",
            })
          );
          return;
        }

        const { user: syncedUser } = syncStarterExpiryStatus(users, matchedUser);
        const isInactive = String(syncedUser.status || "").toLowerCase() !== "active";
        const isExpiredStarter = isStarterExpired(syncedUser);

        if (isInactive && !isExpiredStarter) {
          res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
          res.end(
            JSON.stringify({
              success: false,
              message: "Your account is inactive",
            })
          );
          return;
        }

        const { password: _password, ...safeUser } = syncedUser;
        res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
        res.end(
          JSON.stringify({
            success: true,
            message: isExpiredStarter
              ? "Login successful. Starter trial expired, features are limited until upgrade."
              : "Login successful",
            user: safeUser,
            planExpired: isExpiredStarter,
          })
        );
      } catch {
        res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
        res.end(
          JSON.stringify({
            success: false,
            message: "Invalid JSON body",
          })
        );
      }
    });
    return;
  }

  if (req.method === "PUT") {
    const userSettingsMatch = pathname.match(/^\/users\/([^/]+)\/settings$/);
    if (userSettingsMatch) {
      const userIdParam = userSettingsMatch[1];
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const users = readUsers();
          const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
          if (!rawUser) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
            return;
          }
          const { user } = syncStarterExpiryStatus(users, rawUser);
          if (String(user.status || "").toLowerCase() !== "active") {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
            return;
          }

          const payload = JSON.parse(body || "{}");
          const frequency = normalizeFrequency(payload.frequency);
          const websiteId = normalizeWebsiteId(payload.websiteId);
          const featuredImageSize = normalizeFeaturedImageSize(payload.featuredImageSize);
          const blogWordCount = normalizeBlogWordCount(payload.blogWordCount);

          const settings = readSettings();
          const existingIndex = settings.findIndex(
            (item) =>
              String(item.userId) === String(userIdParam) &&
              normalizeWebsiteId(item.websiteId) === websiteId
          );
          const nextSetting = {
            userId: Number(userIdParam),
            websiteId,
            frequency,
            featuredImageSize,
            blogWordCount,
            updatedAt: new Date().toISOString(),
          };

          if (existingIndex === -1) {
            settings.push({
              ...nextSetting,
              createdAt: new Date().toISOString(),
            });
          } else {
            settings[existingIndex] = {
              ...settings[existingIndex],
              ...nextSetting,
              createdAt: settings[existingIndex].createdAt || new Date().toISOString(),
            };
          }

          writeSettings(settings);
          const saved =
            settings.find(
              (item) =>
                String(item.userId) === String(userIdParam) &&
                normalizeWebsiteId(item.websiteId) === websiteId
            ) || null;
          res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: true, setting: saved }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Invalid JSON body" }));
        }
      });
      return;
    }

    const suggestionsMatch = pathname.match(/^\/users\/([^/]+)\/blogs\/suggestions$/);
    if (suggestionsMatch) {
      const userIdParam = suggestionsMatch[1];
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const users = readUsers();
          const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
          if (!rawUser) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
            return;
          }
          const { user } = syncStarterExpiryStatus(users, rawUser);
          if (String(user.status || "").toLowerCase() !== "active") {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
            return;
          }

          const payload = JSON.parse(body || "{}");
          const websiteId = payload.websiteId ? String(payload.websiteId) : "";
          const prompts = readPrompts();
          const promptData =
            prompts.find((item) => String(item.userId) === String(userIdParam)) || null;
          const settings = readSettings();
          const frequency =
            settings.find((item) => String(item.userId) === String(userIdParam))?.frequency || "weekly";
          const featuredImageSize = normalizeFeaturedImageSize(
            settings.find((item) => String(item.userId) === String(userIdParam))?.featuredImageSize
          );
          const websites = readWebsites();
          const chosenWebsite = websites.find(
            (site) =>
              String(site.userId) === String(userIdParam) &&
              (!websiteId || String(site.id) === websiteId)
          );

          const client = getOpenAiClient();
          const response = await client.responses.create({
            model: OPENAI_MODEL,
            input: [
              {
                role: "system",
                content:
                  "You create SEO-friendly blog titles. Return plain text with exactly 10 lines, each line one title and no numbering.",
              },
              {
                role: "user",
                content: `Generate next 10 blog titles for frequency: ${frequency}.
Website: ${chosenWebsite ? `${chosenWebsite.name} (${chosenWebsite.domain})` : "General"}
Master Prompt: ${promptData?.masterPrompt || "Not provided"}
Areas: ${Array.isArray(promptData?.areas) ? promptData.areas.join(", ") : "Not provided"}
Tone: ${promptData?.writingPattern?.tone || "Not provided"}
Pattern: ${promptData?.writingPattern?.pattern || "Not provided"}
Other requirements: ${promptData?.writingPattern?.requirements || "Not provided"}`,
              },
            ],
          });

          const outputText = response.output_text || "";
          let titles = parseTitles(outputText);
          if (titles.length < 10) {
            const fallback = [
              "How to Build a Repeatable Content Engine in 2026",
              "The Practical Guide to Topic Clusters for Organic Growth",
              "7 Blog Structures That Consistently Improve Read Time",
              "How to Turn Product Features into High-Intent Blog Posts",
              "A Weekly Workflow for Publishing SEO-Friendly Articles",
              "How to Find Blog Topics Your Audience Actually Searches",
              "Content Refresh Playbook: Update Old Posts for New Traffic",
              "How to Balance Thought Leadership with Conversion Content",
              "The Best Internal Linking Strategy for Growing Blogs",
              "From Idea to Draft: A Faster Process for Blog Production",
            ];
            titles = fallback.slice(0, 10);
          }

          const upcomingBlogs = readUpcomingBlogs();
          const existingIndex = upcomingBlogs.findIndex(
            (item) => String(item.userId) === String(userIdParam)
          );
          const nextUpcoming = {
            userId: Number(userIdParam),
            websiteId: chosenWebsite?.id ?? null,
            titles: titles.slice(0, 10),
            updatedAt: new Date().toISOString(),
          };
          if (existingIndex === -1) {
            upcomingBlogs.push({
              ...nextUpcoming,
              createdAt: new Date().toISOString(),
            });
          } else {
            upcomingBlogs[existingIndex] = {
              ...upcomingBlogs[existingIndex],
              ...nextUpcoming,
              createdAt: upcomingBlogs[existingIndex].createdAt || new Date().toISOString(),
            };
          }
          writeUpcomingBlogs(upcomingBlogs);

          res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: true, titles: titles.slice(0, 10) }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders });
          res.end(
            JSON.stringify({
              success: false,
              message: error.message || "Could not generate blog titles",
            })
          );
        }
      });
      return;
    }

    const createBlogMatch = pathname.match(/^\/users\/([^/]+)\/blogs\/create$/);
    if (createBlogMatch) {
      const userIdParam = createBlogMatch[1];
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const users = readUsers();
          const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
          if (!rawUser) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
            return;
          }
          const { user } = syncStarterExpiryStatus(users, rawUser);
          if (String(user.status || "").toLowerCase() !== "active") {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
            return;
          }

          const payload = JSON.parse(body || "{}");
          const title = String(payload.title || "").trim();
          const websiteId = normalizeWebsiteId(payload.websiteId);
          if (!title) {
            res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Title is required" }));
            return;
          }

          const blogsToWrite = readBlogsToWrite();
          blogsToWrite.push({
            userId: Number(userIdParam),
            websiteId,
            title,
            selectedAt: new Date().toISOString(),
          });
          writeBlogsToWrite(blogsToWrite);

          const prompts = readPrompts();
          const promptData =
            prompts.find(
              (item) =>
                String(item.userId) === String(userIdParam) &&
                normalizeWebsiteId(item.websiteId) === websiteId
            ) ||
            prompts.find((item) => String(item.userId) === String(userIdParam)) ||
            null;

          const settings = readSettings();
          const featuredImageSize = normalizeFeaturedImageSize(
            settings.find(
              (item) =>
                String(item.userId) === String(userIdParam) &&
                normalizeWebsiteId(item.websiteId) === websiteId
            )?.featuredImageSize
          );
          const blogWordCount = normalizeBlogWordCount(
            settings.find(
              (item) =>
                String(item.userId) === String(userIdParam) &&
                normalizeWebsiteId(item.websiteId) === websiteId
            )?.blogWordCount
          );

          const client = getOpenAiClient();
          const response = await client.responses.create({
            model: OPENAI_MODEL,
            input: [
              {
                role: "system",
                content:
                  "You are a senior blog writer. Return markdown only. Use this exact structure: 1) Blog title as H1, 2) Intro section heading as '## Intro' with one or more paragraphs, 3) Multiple H2 subtitles each with one or more paragraphs, 4) Final section heading as '## Conclusion' with one or more paragraphs.",
              },
              {
                role: "user",
                content: `Write a complete blog article for this title: "${title}".
Master Prompt: ${promptData?.masterPrompt || "Not provided"}
Areas: ${Array.isArray(promptData?.areas) ? promptData.areas.join(", ") : "Not provided"}
Tone: ${promptData?.writingPattern?.tone || "Not provided"}
Pattern: ${promptData?.writingPattern?.pattern || "Not provided"}
Other requirements: ${promptData?.writingPattern?.requirements || "Not provided"}
Target word count: ${blogWordCount} words
Keep final article approximately within ${Math.max(250, blogWordCount - 120)} to ${blogWordCount + 120} words.

Formatting requirements (must follow):
- First line must be '# ${title}'
- Then '## Intro'
- Then several '## <Sub title>' sections
- End with '## Conclusion'
- Under each section, write one or more paragraphs`,
              },
            ],
          });

          const content = String(response.output_text || "").trim();
          if (!content) {
            res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Model returned empty content" }));
            return;
          }

          const imagePrompt = `Create a premium featured image for a business blog post titled "${title}".
Style: modern editorial hero banner, clean composition, professional, high contrast subject, no logos.
Tone: ${promptData?.writingPattern?.tone || "Professional and trustworthy"}.
Avoid adding any readable text in the image.`;
          const imageResponse = await client.images.generate({
            model: OPENAI_IMAGE_MODEL,
            prompt: imagePrompt,
            size: featuredImageSize,
          });

          const imageBase64 = imageResponse?.data?.[0]?.b64_json;
          if (!imageBase64) {
            res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Could not generate featured image" }));
            return;
          }

          ensureDirectoryExists(ASSETS_DIR);
          const fileBase = sanitizeForFilename(title) || `blog-${Date.now()}`;
          const fileName = `${Date.now()}-${fileBase}.png`;
          const absoluteImagePath = path.join(ASSETS_DIR, fileName);
          fs.writeFileSync(absoluteImagePath, Buffer.from(imageBase64, "base64"));
          const relativeImagePath = path.join("data", "Assets", fileName).replaceAll("\\", "/");

          const blogs = readBlogs();
          const blog = {
            id: nextBlogId(blogs),
            userId: Number(userIdParam),
            websiteId,
            title,
            slug: toSlug(title),
            content,
            featuredImage: relativeImagePath,
            featuredImageSize,
            status: "created",
            createdAt: new Date().toISOString(),
          };
          blogs.push(blog);
          writeBlogs(blogs);

          res.writeHead(201, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: true, blog }));
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders });
          res.end(
            JSON.stringify({
              success: false,
              message: error.message || "Could not create blog",
            })
          );
        }
      });
      return;
    }

    const publishBlogMatch = pathname.match(/^\/users\/([^/]+)\/blogs\/([^/]+)\/publish$/);
    if (publishBlogMatch) {
      const userIdParam = publishBlogMatch[1];
      const blogIdParam = publishBlogMatch[2];
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const users = readUsers();
          const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
          if (!rawUser) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
            return;
          }
          const { user } = syncStarterExpiryStatus(users, rawUser);
          if (String(user.status || "").toLowerCase() !== "active") {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Your account is inactive." }));
            return;
          }

          const payload = JSON.parse(body || "{}");
          const websiteId = normalizeWebsiteId(payload.websiteId);
          const blogs = readBlogs();
          const blogIndex = blogs.findIndex(
            (item) =>
              String(item.id) === String(blogIdParam) &&
              String(item.userId) === String(userIdParam) &&
              (websiteId === null || normalizeWebsiteId(item.websiteId) === websiteId)
          );

          if (blogIndex === -1) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Blog not found" }));
            return;
          }

          blogs[blogIndex] = {
            ...blogs[blogIndex],
            slug: blogs[blogIndex].slug || toSlug(blogs[blogIndex].title),
            status: "published",
            publishedAt: new Date().toISOString(),
          };
          writeBlogs(blogs);

          res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: true, blog: blogs[blogIndex] }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Invalid JSON body" }));
        }
      });
      return;
    }
  }

  if (req.method === "POST") {
    const createWebsiteMatch = pathname.match(/^\/users\/([^/]+)\/websites$/);
    if (createWebsiteMatch) {
      const userIdParam = createWebsiteMatch[1];
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const users = readUsers();
          const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
          if (!rawUser) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
            return;
          }
          const { user } = syncStarterExpiryStatus(users, rawUser);
          if (String(user.status || "").toLowerCase() !== "active") {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(
              JSON.stringify({
                success: false,
                message: "Your account is inactive. Upgrade your plan to continue using website functions.",
              })
            );
            return;
          }

          const payload = JSON.parse(body || "{}");
          const name = String(payload.name || "").trim();
          const domain = String(payload.domain || "").trim();
          const techStack = String(payload.techStack || "").trim().toLowerCase();

          if (!name) {
            res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Website name is required" }));
            return;
          }
          if (!domain) {
            res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Domain is required" }));
            return;
          }
          if (!TECH_STACKS.has(techStack)) {
            res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Invalid tech stack" }));
            return;
          }

          const websites = readWebsites();
          const userWebsiteCount = websites.filter((w) => String(w.userId) === String(userIdParam)).length;
          const planLimit = maxWebsitesForPlan(user.plan);
          if (userWebsiteCount >= planLimit) {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(
              JSON.stringify({
                success: false,
                message: `Your ${String(user.plan || "starter")} plan allows only ${planLimit} website${planLimit > 1 ? "s" : ""}`,
              })
            );
            return;
          }

          const duplicate = websites.some(
            (w) => String(w.userId) === String(userIdParam) && String(w.domain || "").toLowerCase() === domain.toLowerCase()
          );
          if (duplicate) {
            res.writeHead(409, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "This domain already exists for the user" }));
            return;
          }

          const newWebsite = {
            id: nextWebsiteId(websites),
            userId: Number(userIdParam),
            name,
            domain,
            techStack,
            status: "active",
            plan: "starter",
            posts: 0,
            updatedAt: new Date().toISOString(),
          };

          websites.push(newWebsite);
          writeWebsites(websites);

          res.writeHead(201, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: true, website: newWebsite }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Invalid JSON body" }));
        }
      });
      return;
    }

    const userPromptMatch = pathname.match(/^\/users\/([^/]+)\/prompts$/);
    if (userPromptMatch) {
      const userIdParam = userPromptMatch[1];
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const users = readUsers();
          const rawUser = users.find((u) => String(u.userId) === String(userIdParam));
          if (!rawUser) {
            res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "User not found" }));
            return;
          }
          const { user } = syncStarterExpiryStatus(users, rawUser);
          if (String(user.status || "").toLowerCase() !== "active") {
            res.writeHead(403, { "Content-Type": "application/json", ...corsHeaders });
            res.end(
              JSON.stringify({
                success: false,
                message: "Your account is inactive. Upgrade your plan to continue using prompt functions.",
              })
            );
            return;
          }

          const payload = JSON.parse(body || "{}");
          const masterPrompt = String(payload.masterPrompt || "").trim();
          const websiteId = normalizeWebsiteId(payload.websiteId);
          const rawAreas = Array.isArray(payload.areas) ? payload.areas : [];
          const areas = rawAreas
            .map((item) => String(item || "").trim())
            .filter(Boolean);
          const writingPattern = {
            tone: String(payload?.writingPattern?.tone || "").trim(),
            pattern: String(payload?.writingPattern?.pattern || "").trim(),
            requirements: String(payload?.writingPattern?.requirements || "").trim(),
          };

          if (!masterPrompt) {
            res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "Master prompt is required" }));
            return;
          }
          if (areas.length === 0) {
            res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
            res.end(JSON.stringify({ success: false, message: "At least one area is required" }));
            return;
          }

          const prompts = readPrompts();
          const existingIndex = prompts.findIndex(
            (item) =>
              String(item.userId) === String(userIdParam) &&
              normalizeWebsiteId(item.websiteId) === websiteId
          );

          const nextPrompt = {
            userId: Number(userIdParam),
            websiteId,
            masterPrompt,
            areas,
            writingPattern,
            updatedAt: new Date().toISOString(),
          };

          if (existingIndex === -1) {
            prompts.push({
              ...nextPrompt,
              createdAt: new Date().toISOString(),
            });
          } else {
            prompts[existingIndex] = {
              ...prompts[existingIndex],
              ...nextPrompt,
              createdAt: prompts[existingIndex].createdAt || new Date().toISOString(),
            };
          }

          writePrompts(prompts);
          const savedPrompt =
            prompts.find(
              (item) =>
                String(item.userId) === String(userIdParam) &&
                normalizeWebsiteId(item.websiteId) === websiteId
            ) || null;

          res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: true, prompt: savedPrompt }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json", ...corsHeaders });
          res.end(JSON.stringify({ success: false, message: "Invalid JSON body" }));
        }
      });
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
  res.end(
    JSON.stringify({
      error: "Not Found",
    })
  );
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
