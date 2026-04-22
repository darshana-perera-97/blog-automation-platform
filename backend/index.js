const http = require("http");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const USERS_FILE = path.join(__dirname, "data", "users.json");
const WEBSITES_FILE = path.join(__dirname, "data", "websites.json");
const PLANS = new Set(["starter", "basic", "pro", "ultra"]);
const STATUSES = new Set(["active", "inactive"]);
const TECH_STACKS = new Set(["custom-html", "wordpress"]);

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
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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
