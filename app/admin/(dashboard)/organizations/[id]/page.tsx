"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// ================= TYPES =================

type Org = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  industry?: string;
  currency?: string;
  plan: "FREE" | "PRO";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt?: string;
  trialEndsAt?: string;
  isSetupComplete?: boolean;

  _count?: {
    users: number;
    customers: number;
    invoices: number;
    products: number;
    quotations: number;
    expenses: number;
    payments: number;
    subscriptionPayments: number;
  };

  users?: User[];
  invoices?: Invoice[];
  subscriptionPayments?: Payment[];
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type Invoice = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
};

type Payment = {
  id: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
};

// ================= UI COMPONENTS =================

function Badge({
  children,
  tone,
}: {
  children: any;
  tone: "green" | "yellow" | "red" | "blue";
}) {
  const styles = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${styles[tone]}`}>
      {children}
    </span>
  );
}

function KpiCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function TableCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>
      <div className="max-h-[320px] overflow-y-auto">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-6 text-sm text-slate-500">{text}</div>;
}

// ================= TABLES =================

function OrganizationTables({ org }: { org: Org }) {
  const users = org.users ?? [];
  const invoices = org.invoices ?? [];
  const payments = org.subscriptionPayments ?? [];

  return (
    <div className="space-y-6">
      <TableCard title="Recent Users">
        {users.length === 0 ?
          <EmptyState text="No users found" />
        : users.slice(0, 5).map((u) => (
            <div
              key={u.id}
              className="p-4 flex justify-between hover:bg-slate-800/20"
            >
              <div>
                <p className="text-sm text-white">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <span className="text-xs text-slate-500">{u.role}</span>
            </div>
          ))
        }
      </TableCard>

      <TableCard title="Recent Invoices">
        {invoices.length === 0 ?
          <EmptyState text="No invoices found" />
        : invoices.slice(0, 5).map((inv) => (
            <div key={inv.id} className="p-4 flex justify-between">
              <div>
                <p className="text-sm text-white">{inv.id}</p>
                <p className="text-xs text-slate-400">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-400">${inv.total}</p>
                <p className="text-xs text-slate-400">{inv.status}</p>
              </div>
            </div>
          ))
        }
      </TableCard>

      <TableCard title="Subscription Payments">
        {payments.length === 0 ?
          <EmptyState text="No payments found" />
        : payments.slice(0, 5).map((p) => (
            <div key={p.id} className="p-4 flex justify-between">
              <div>
                <p className="text-sm text-white">{p.reference}</p>
                <p className="text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-400">${p.amount}</p>
                <p className="text-xs text-slate-400">{p.status}</p>
              </div>
            </div>
          ))
        }
      </TableCard>
    </div>
  );
}

// ================= MAIN PAGE =================

export default function OrganizationDetailsPage() {
  const { id } = useParams();

  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/organizations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setOrg(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const kpis = useMemo(() => {
    return [
      { label: "Users", value: org?._count?.users ?? 0 },
      { label: "Customers", value: org?._count?.customers ?? 0 },
      { label: "Invoices", value: org?._count?.invoices ?? 0 },
      { label: "Products", value: org?._count?.products ?? 0 },
      { label: "Expenses", value: org?._count?.expenses ?? 0 },
      { label: "Payments", value: org?._count?.payments ?? 0 },
    ];
  }, [org]);

  const showToast = (msg: string) => {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className =
      "fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

  const updateOrg = async (data: any) => {
    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/organizations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setOrg((prev) => (prev ? { ...prev, ...data } : prev));
      showToast("Organization updated");
    } catch (err: any) {
      showToast(err.message || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  if (!org) {
    return <div className="p-6 text-red-400">Organization not found</div>;
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* HERO */}
      <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        <p className="text-sm text-slate-400">{org.email}</p>

        <div className="flex gap-2 mt-3">
          <Badge tone={org.plan === "PRO" ? "blue" : "yellow"}>
            {org.plan}
          </Badge>
          <Badge tone={org.status === "ACTIVE" ? "green" : "red"}>
            {org.status}
          </Badge>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} />
        ))}
      </div>

      {/* INFO + TABLES */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900">
          <h2 className="text-sm font-semibold">Info</h2>
          <p className="text-xs text-slate-400 mt-2">
            Industry: {org.industry}
          </p>
          <p className="text-xs text-slate-400">Currency: {org.currency}</p>
        </div>

        <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900">
          <h2 className="text-sm font-semibold">Subscription</h2>
          <p className="text-xs text-slate-400">Plan: {org.plan}</p>

          <button
            onClick={() => updateOrg({ plan: "PRO" })}
            disabled={actionLoading}
            className="mt-3 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg"
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* TABLES */}
      <OrganizationTables org={org} />
    </div>
  );
}
