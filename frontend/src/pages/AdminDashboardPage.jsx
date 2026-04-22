import { useCallback, useEffect, useState } from "react";
import * as ReactRouterDom from "react-router-dom";
import BrandIcon from "../components/BrandIcon";
import { clearAdminSession } from "../lib/adminAuth";

const { useNavigate } = ReactRouterDom;

const API_BASE = "http://localhost:4321";

function MetricCard({ label, value, delta, accent }) {
  const isPositive = delta.startsWith("+");
  const isNegative = delta.startsWith("-");
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] ${accent.ring}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.bar}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">{value}</p>
          <p
            className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
              isPositive ? "text-emerald-600" : isNegative ? "text-rose-500" : "text-slate-500"
            }`}
          >
            <span aria-hidden>{isPositive ? "↑" : isNegative ? "↓" : "—"}</span>
            {delta}
            <span className="font-normal text-slate-400">vs last period</span>
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner ring-1 ring-white/60 ${accent.iconBg}`}
          aria-hidden
        >
          <span className={accent.iconColor}>{accent.icon}</span>
        </div>
      </div>
    </article>
  );
}

function UserDetailsModal({ user, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user?.userId) {
      setDetail(null);
      setLoadError("");
      setShowPassword(false);
      return;
    }
    let cancelled = false;
    setDetail(null);
    setLoadError("");
    setShowPassword(false);

    fetch(`${API_BASE}/admin/users/${user.userId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Not found");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load full user record.");
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const display = detail || user;

  const rows = [
    { key: "userId", label: "User ID", value: display.userId },
    { key: "username", label: "Username", value: display.username },
    { key: "email", label: "Email", value: display.email },
    { key: "contactNumber", label: "Contact number", value: display.contactNumber },
    { key: "plan", label: "Plan", value: display.plan },
    { key: "status", label: "Status", value: display.status },
    {
      key: "createdAt",
      label: "Created at",
      value:
        display.createdAt != null
          ? new Date(display.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "—",
    },
  ];

  const passwordValue = detail?.password ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/25 sm:p-8">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600/90">User record</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">All saved fields</h3>
            <p className="mt-1 text-sm text-slate-500">Full profile including password (toggle visibility).</p>
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

        {loadError ? <p className="mt-6 text-center text-sm text-rose-600">{loadError}</p> : null}

        <dl className="mt-6 space-y-0 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50">
          {rows.map(({ key, label, value }) => (
            <div key={key} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
              <dd className="text-sm font-medium text-slate-900 sm:text-right">
                {key === "plan" || key === "status" ? (
                  <span className="capitalize">{value ?? "—"}</span>
                ) : (
                  <span className="break-all">{value ?? "—"}</span>
                )}
              </dd>
            </div>
          ))}
          <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Password</dt>
            <dd className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-[65%]">
              <span className={`truncate font-mono text-sm ${showPassword ? "text-slate-900" : "tracking-widest text-slate-600"}`}>
                {detail ? (showPassword ? passwordValue || "—" : "•".repeat(Math.min(passwordValue.length || 8, 24))) : "—"}
              </span>
              <button
                type="button"
                disabled={!detail || !passwordValue}
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function TabPanel({ activeTab, tabContent, users, onOpenAddUser, onViewUser }) {
  const content = tabContent[activeTab];
  const isUsers = activeTab === "Users";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50/40 to-[#eef2ff]/30 p-6 shadow-inner">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600/80">Focus area</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{content.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isUsers ? (
              <button
                type="button"
                onClick={onOpenAddUser}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 sm:text-sm"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add user
              </button>
            ) : null}
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white shadow-sm">Live snapshot</span>
          </div>
        </div>
        <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">{content.description}</p>

        {isUsers ? (
          <div className="relative mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              Saved users ({users.length})
            </p>
            {users.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                No users yet. Click &quot;Add user&quot; to create one.
              </p>
            ) : (
              <ul className="space-y-3">
                {users.map((u) => (
                  <li
                    key={u.userId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] text-xs font-bold text-slate-700 ring-1 ring-slate-200/80">
                        #{u.userId}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{u.username}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-600">{u.plan}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200/80 text-slate-600"
                        }`}
                      >
                        {u.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => onViewUser(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-900"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View all
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <ul className="relative mt-6 space-y-3">
            {content.rows.map((row, index) => (
              <li
                key={row}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition hover:border-slate-200 hover:shadow-md"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] text-xs font-bold text-slate-600 ring-1 ring-slate-200/80">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-700">{row}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const ADD_USER_INITIAL = {
  username: "",
  email: "",
  contactNumber: "",
  password: "",
  passwordConfirm: "",
  plan: "starter",
  status: "active",
};

function AddUserModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(ADD_USER_INITIAL);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...ADD_USER_INITIAL });
      setError("");
    }
  }, [open]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          contactNumber: form.contactNumber.trim(),
          password: form.password,
          passwordConfirm: form.passwordConfirm,
          plan: form.plan,
          status: form.status,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save user.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/20 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Add user</h3>
            <p className="mt-1 text-sm text-slate-500">Create a workspace account with plan and status.</p>
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
              <label className="text-xs font-medium text-slate-600">Username</label>
              <input className={inputClass} value={form.username} onChange={(ev) => update("username", ev.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input className={inputClass} type="email" value={form.email} onChange={(ev) => update("email", ev.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Contact number</label>
              <input className={inputClass} type="tel" value={form.contactNumber} onChange={(ev) => update("contactNumber", ev.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input className={inputClass} type="password" value={form.password} onChange={(ev) => update("password", ev.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Re-enter password</label>
              <input
                className={inputClass}
                type="password"
                value={form.passwordConfirm}
                onChange={(ev) => update("passwordConfirm", ev.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Plan</label>
              <select className={inputClass} value={form.plan} onChange={(ev) => update("plan", ev.target.value)}>
                <option value="starter">Starter</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Status</label>
              <select className={inputClass} value={form.status} onChange={(ev) => update("status", ev.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/users`);
      if (!response.ok) return;
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalUsersDisplay = users.length.toLocaleString();

  const analyticsCards = [
    {
      label: "Total Users",
      value: totalUsersDisplay,
      delta: "+8.2%",
      accent: {
        bar: "from-emerald-400 via-teal-500 to-emerald-600",
        ring: "ring-1 ring-emerald-500/10",
        iconBg: "from-emerald-50 to-teal-100/80",
        iconColor: "text-emerald-600",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
    },
    {
      label: "Active Websites",
      value: "312",
      delta: "+4.1%",
      accent: {
        bar: "from-sky-400 via-blue-500 to-indigo-500",
        ring: "ring-1 ring-sky-500/10",
        iconBg: "from-sky-50 to-indigo-50",
        iconColor: "text-sky-600",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        ),
      },
    },
    {
      label: "Monthly Revenue",
      value: "$12,480",
      delta: "+11.4%",
      accent: {
        bar: "from-violet-400 via-fuchsia-500 to-purple-600",
        ring: "ring-1 ring-violet-500/10",
        iconBg: "from-violet-50 to-fuchsia-50",
        iconColor: "text-violet-600",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        ),
      },
    },
    {
      label: "Pending Tickets",
      value: "19",
      delta: "-6.0%",
      accent: {
        bar: "from-amber-400 via-orange-400 to-rose-400",
        ring: "ring-1 ring-amber-500/10",
        iconBg: "from-amber-50 to-orange-50",
        iconColor: "text-amber-600",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        ),
      },
    },
  ];

  const tabContent = {
    Users: {
      title: "Users",
      description: "Manage user access, roles, and account health from the admin panel.",
      rows: ["New signups this week: 42", "Admins: 3", "Suspended accounts: 2"],
    },
    Websites: {
      title: "Websites",
      description: "Review connected websites, publishing status, and sync health.",
      rows: ["Live websites: 287", "Draft environments: 25", "Sync issues: 4"],
    },
    Payments: {
      title: "Payments",
      description: "Track subscriptions, payment flow status, and recent transactions.",
      rows: ["Successful payments today: 58", "Failed charges: 3", "Refunds this month: 7"],
    },
  };

  const tabs = ["Users", "Websites", "Payments"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,_#e0f2fe_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4 py-5 text-slate-700 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/15 blur-[90px]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/85 px-5 py-4 shadow-[0_8px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 via-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-white/50">
              <BrandIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">AI Bloger</p>
                <span className="rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  Admin
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Powered by NexgenAI · Control center</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              clearAdminSession();
              navigate("/admin/login");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </nav>

        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Overview</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Platform analytics</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">High-signal metrics and operational areas for your workspace.</p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {analyticsCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200/60 bg-white/70 p-1 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur-sm">
          <div className="rounded-[1.35rem] bg-gradient-to-b from-white to-slate-50/50 p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Management</h2>
              </div>
              <div className="inline-flex rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 shadow-inner">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-white text-slate-900 shadow-md shadow-slate-200/50 ring-1 ring-slate-200/80"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {isActive ? (
                        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                      ) : null}
                      <span className="relative">{tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <TabPanel
              activeTab={activeTab}
              tabContent={tabContent}
              users={users}
              onOpenAddUser={() => setShowAddUser(true)}
              onViewUser={setDetailUser}
            />
          </div>
        </section>
      </div>

      <UserDetailsModal user={detailUser} onClose={() => setDetailUser(null)} />
      <AddUserModal open={showAddUser} onClose={() => setShowAddUser(false)} onSaved={loadUsers} />
    </div>
  );
}

export default AdminDashboardPage;
