import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const statCards = [
  { label: "Today`s Money", value: "$53,000", delta: "+55%" },
  { label: "New Clients", value: "+3,462", delta: "-2%" },
  { label: "Today`s Users", value: "2,300", delta: "+3%" },
  { label: "Sales", value: "$103,430", delta: "+5%" },
];

const countries = [
  { country: "United States", sales: "2,500", value: "$230,900", bounce: "29.9%" },
  { country: "Germany", sales: "3,900", value: "$440,000", bounce: "40.22%" },
  { country: "Great Britain", sales: "1,400", value: "$190,700", bounce: "23.44%" },
  { country: "Brazil", sales: "562", value: "$143,900", bounce: "32.14%" },
];

const activeUsersData = [
  { day: "Mon", users: 230 },
  { day: "Tue", users: 410 },
  { day: "Wed", users: 280 },
  { day: "Thu", users: 510 },
  { day: "Fri", users: 390 },
  { day: "Sat", users: 310 },
  { day: "Sun", users: 470 },
];

const salesOverviewData = [
  { month: "Apr", growth: 120, baseline: 100 },
  { month: "May", growth: 260, baseline: 150 },
  { month: "Jun", growth: 210, baseline: 180 },
  { month: "Jul", growth: 420, baseline: 260 },
  { month: "Aug", growth: 320, baseline: 290 },
  { month: "Sep", growth: 380, baseline: 310 },
  { month: "Oct", growth: 290, baseline: 270 },
  { month: "Nov", growth: 460, baseline: 350 },
];

const quickActions = [
  { title: "Create Report", subtitle: "Generate weekly insights", color: "from-[#eef2ff] to-[#f5f3ff]" },
  { title: "Invite Member", subtitle: "Add teammates to workspace", color: "from-[#ecfeff] to-[#eff6ff]" },
  { title: "Start Campaign", subtitle: "Launch marketing flow", color: "from-[#ecfdf5] to-[#f0fdf4]" },
];

const tasks = [
  { label: "Finalize Q2 product roadmap", status: "In review", done: false },
  { label: "Publish onboarding tutorial", status: "Done", done: true },
  { label: "Prepare investor metrics", status: "Pending", done: false },
  { label: "Audit conversion funnel", status: "Done", done: true },
];

const transactions = [
  { name: "Dribbble Pro", date: "21 APR 2026", amount: "-$239.00", type: "debit" },
  { name: "Stripe Payout", date: "20 APR 2026", amount: "+$1,240.00", type: "credit" },
  { name: "AWS Billing", date: "19 APR 2026", amount: "-$332.50", type: "debit" },
  { name: "Client Deposit", date: "18 APR 2026", amount: "+$3,800.00", type: "credit" },
];

function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f8fafc_40%,_#f1f5f9_100%)] text-slate-700">
      <div className="mx-auto max-w-[1450px] p-4">
        <aside className="fixed left-4 top-4 h-[calc(100vh-2rem)] w-[240px] overflow-y-auto rounded-3xl border border-[#f1f5f9] bg-white p-5 shadow-[0_15px_35px_rgba(148,163,184,0.18)]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 via-emerald-500 to-green-600 text-sm font-bold text-white">S</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Soft UI Dashboard PRO</p>
              <p className="text-sm font-semibold text-slate-700">Pages / Default</p>
            </div>
          </div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-slate-400">Pages</p>
          <nav className="space-y-2 text-sm">
            <button className="w-full rounded-xl bg-gradient-to-r from-[#f8fafc] to-[#eef2ff] px-3 py-2 text-left font-semibold text-slate-700 shadow-sm ring-1 ring-[#e2e8f0]">Dashboards</button>
            <button className="w-full rounded-xl px-3 py-2 text-left text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">Pages</button>
            <button className="w-full rounded-xl px-3 py-2 text-left text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">Applications</button>
            <button className="w-full rounded-xl px-3 py-2 text-left text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">Ecommerce</button>
            <button className="w-full rounded-xl px-3 py-2 text-left text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">Authentication</button>
          </nav>
          <div className="mt-10 rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#ffffff] to-[#f8fafc] p-4 text-slate-700 shadow-sm">
            <p className="text-sm font-semibold">Need Help?</p>
            <p className="mt-1 text-xs text-slate-500">Please check our docs</p>
            <button className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-xs font-bold text-white transition hover:bg-slate-700">DOCUMENTATION</button>
          </div>
        </aside>

        <main className="ml-[260px] space-y-5">
          <header className="fixed left-[280px] right-4 top-4 z-40 flex items-center justify-between rounded-2xl border border-[#f1f5f9] bg-white px-6 py-4 shadow-[0_15px_35px_rgba(148,163,184,0.18)]">
            <div>
              <p className="text-xs text-slate-400">Pages / Default</p>
              <h1 className="text-2xl font-bold text-slate-800">General Statistics</h1>
            </div>
            <div className="flex items-center gap-3">
              <input className="rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2" placeholder="Type here..." />
              <button className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:from-slate-600 hover:to-slate-700">Sign in</button>
            </div>
          </header>

          <div className="grid grid-cols-[1.15fr_1fr] gap-5 pt-24">
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((item) => (
                  <article key={item.label} className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(148,163,184,0.24)]">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {item.value} <span className="text-sm text-lime-500">{item.delta}</span>
                    </p>
                  </article>
                ))}
              </div>

              <div className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">Sales by Country</h2>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-slate-400">
                      <th className="pb-2">Country</th>
                      <th className="pb-2">Sales</th>
                      <th className="pb-2">Value</th>
                      <th className="pb-2">Bounce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {countries.map((item) => (
                      <tr key={item.country}>
                        <td className="py-2">{item.country}</td>
                        <td className="py-2">{item.sales}</td>
                        <td className="py-2">{item.value}</td>
                        <td className="py-2">{item.bounce}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#eef2ff] p-4 text-slate-700 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeUsersData} barCategoryGap={18}>
                      <XAxis dataKey="day" hide />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                        contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#334155" }}
                        labelStyle={{ color: "#64748b" }}
                      />
                      <Bar dataKey="users" fill="#94a3b8" radius={[8, 8, 8, 8]} maxBarSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2">
                  <p className="text-lg font-semibold">Active Users</p>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-slate-500">
                    <p>Users <span className="block text-base text-slate-700">36K</span></p>
                    <p>Clicks <span className="block text-base text-slate-700">2m</span></p>
                    <p>Sales <span className="block text-base text-slate-700">435$</span></p>
                    <p>Items <span className="block text-base text-slate-700">43</span></p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-[#f1f5f9] bg-white shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sky-100/60 blur-2xl" />
                <div className="absolute -left-10 bottom-8 h-32 w-32 rounded-full bg-indigo-100/60 blur-2xl" />
                <div
                  className="h-72 w-72 rounded-full"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(100,116,139,0.28) 1px, transparent 1px), linear-gradient(180deg, rgba(148,163,184,.35) 0%, rgba(148,163,184,.08) 100%)",
                    backgroundSize: "8px 8px, 100% 100%",
                    boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.3)",
                  }}
                />
              </div>

              <div className="rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <p className="text-sm font-semibold text-slate-700">Sales overview</p>
                <p className="mb-2 text-xs text-lime-500">(+4%) more in 2026</p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesOverviewData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e879f9" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#e879f9" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                        labelStyle={{ color: "#334155" }}
                      />
                      <Area type="monotone" dataKey="growth" fill="url(#growthFill)" stroke="none" />
                      <Line type="monotone" dataKey="growth" stroke="#d946ef" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="baseline" stroke="#334155" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <section className="col-span-2 space-y-5">
              <div className="rounded-2xl border border-[#f1f5f9] bg-white p-5 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">Quick Actions</h3>
                  <button className="text-xs font-medium text-slate-400">Manage</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      className={`rounded-2xl bg-gradient-to-br p-4 text-left text-slate-700 ring-1 ring-[#e2e8f0] shadow-[0_8px_20px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(148,163,184,0.22)] ${action.color}`}
                    >
                      <p className="text-sm font-semibold">{action.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{action.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#f1f5f9] bg-white p-5 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">Recent Transactions</h3>
                  <p className="text-xs text-slate-400">Updated 5 minutes ago</p>
                </div>
                <div className="space-y-3">
                  {transactions.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-slate-200 hover:shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.date}</p>
                      </div>
                      <p className={`text-sm font-semibold ${item.type === "credit" ? "text-emerald-500" : "text-rose-500"}`}>
                        {item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-[#f1f5f9] bg-white p-5 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">Project Progress</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">83%</span>
                </div>
                <div className="mb-2 h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 w-5/6 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500" />
                </div>
                <p className="text-xs text-slate-400">12 of 15 milestones complete</p>
              </div>

              <div className="rounded-2xl border border-[#f1f5f9] bg-white p-5 shadow-[0_10px_26px_rgba(148,163,184,0.14)]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">Team Tasks</h3>
                  <button className="text-xs font-medium text-slate-400">View all</button>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.label} className="rounded-xl border border-slate-100 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-700">{task.label}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            task.done ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
