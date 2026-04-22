import { useState } from "react";
import * as ReactRouterDom from "react-router-dom";
import BrandIcon from "./BrandIcon";
import { isAdminAuthenticated, setAdminSession } from "../lib/adminAuth";
import { isUserAuthenticated, setUserSession } from "../lib/userAuth";

const { Navigate, useNavigate } = ReactRouterDom;

function AuthLoginPage({ title, subtitle, isAdmin = false }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ kind: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAdmin && isAdminAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (!isAdmin && isUserAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus({ kind: "", message: "" });

      const endpoint = isAdmin ? "http://localhost:4321/admin/login" : "http://localhost:4321/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus({ kind: "error", message: result.message || "Login failed" });
        return;
      }

      if (isAdmin) {
        setAdminSession();
      } else {
        const userId = result?.user?.userId;
        if (userId === undefined || userId === null || userId === "") {
          setStatus({ kind: "error", message: "Login succeeded but user ID is missing" });
          return;
        }
        setUserSession(userId);
      }

      setStatus({ kind: "success", message: result.message || "Login successful" });
      navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
    } catch {
      setStatus({ kind: "error", message: "Unable to reach backend server" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#a5dcff] via-[#d8efff] to-[#f5fbff] px-4 py-10">
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-[100%] bg-white/70 blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-[58%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
      <div className="pointer-events-none absolute left-1/2 top-[58%] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/55 bg-white/78 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.15)] backdrop-blur-xl sm:p-7">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 via-emerald-500 to-green-600 text-white shadow-sm">
          <BrandIcon className="h-5 w-5" />
        </div>

        <p className="mt-4 text-center text-xl font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-center text-xs text-slate-500 sm:text-sm">{subtitle}</p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{isAdmin ? "Username" : "Email"}</label>
            <input
              type={isAdmin ? "text" : "email"}
              placeholder={isAdmin ? "Enter admin username" : "you@company.com"}
              className="w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-200" />
              Remember me
            </label>
            <button type="button" className="text-xs text-slate-500 transition hover:text-slate-700">Forgot password?</button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:from-slate-600 hover:to-slate-700"
          >
            {isSubmitting ? "Signing in..." : "Get Started"}
          </button>
        </form>

        {status.message ? (
          <p
            className={`mt-3 text-center text-xs ${
              status.kind === "error"
                ? "text-rose-500"
                : status.kind === "success"
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default AuthLoginPage;
