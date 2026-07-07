"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const revenueData = dashboard?.revenueTrend || [];

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("Dashboard:", data);

        setDashboard(data);
      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-10 text-slate-100">Loading dashboard...</div>;
  }

  if (!dashboard) {
    return (
      <div className="p-10 text-red-400">Failed to load dashboard data</div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* KPI ROW */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue",
            value: `$${dashboard.kpi.revenue}`,
            change: "+18%",
            up: true,
          },

          {
            label: "Payments",
            value: dashboard.kpi.payments,
            change: "+6%",
            up: true,
          },

          {
            label: "Pending",
            value: dashboard.kpi.pending,
            change: "-3%",
            up: false,
          },

          {
            label: "Organizations",
            value: dashboard.kpi.organizations,
            change: "+2%",
            up: true,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-xs text-slate-400">{kpi.label}</p>

            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-2xl font-bold">{kpi.value}</h3>

              <span
                className={`text-xs font-medium ${
                  kpi.up ? "text-green-400" : "text-red-400"
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-6">
          {/* REVENUE CHART */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold mb-4">Revenue Trend</h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.organizationGrowth}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="organizations"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LOWER GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* ACTIVITY */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold mb-4">Recent Activity</h2>

              <div className="space-y-3">
                {[
                  "EcoCash payment approved",
                  "New organization registered",
                  "Invoice generated",
                  "Payment delayed (OneMoney)",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl bg-slate-800/40 p-3"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <p className="text-sm text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ORGANIZATIONS GROWTH */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold mb-4">Organizations Growth</h2>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* SYSTEM HEALTH */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold mb-4">System Health</h2>

            <div className="space-y-3 text-sm">
              {[
                {
                  name: "API",
                  status: dashboard.systemHealth.api,
                  color:
                    dashboard.systemHealth.api === "Healthy" ?
                      "text-green-400"
                    : "text-red-400",
                },

                {
                  name: "Database",
                  status: dashboard.systemHealth.database,
                  color:
                    dashboard.systemHealth.database === "Healthy" ?
                      "text-green-400"
                    : "text-red-400",
                },

                {
                  name: "Payments",
                  status: dashboard.systemHealth.payments,
                  color:
                    dashboard.systemHealth.payments === "Healthy" ?
                      "text-green-400"
                    : "text-red-400",
                },
              ].map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="text-slate-300">{s.name}</span>
                  <span className={s.color}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>

            <div className="space-y-3">
              {["Approve Payments", "Create Invoice", "Add Organization"].map(
                (a) => (
                  <button
                    key={a}
                    className="w-full rounded-xl bg-slate-800 py-3 text-sm hover:bg-slate-700 transition"
                  >
                    {a}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* MINI STATS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold mb-4">Quick Stats</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="font-semibold">
                  {dashboard.quickStats.activeUsers}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Subscriptions</span>
                <span className="font-semibold text-green-400">
                  {dashboard.quickStats.subscriptions}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Trials</span>
                <span className="font-semibold">
                  {dashboard.quickStats.trials}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
