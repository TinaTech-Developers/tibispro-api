"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "PENDING" | "PAID" | "FAILED";

type Payment = {
  id: string;
  businessName: string;
  phoneNumber: string;
  reference: string;
  amount: number;
  status: Status;
  createdAt?: string;
  organization: {
    name: string;
  };
};

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        console.warn("No token found");
        return;
      }

      console.log("TOKEN:", token);

      setLoading(true);

      const res = await fetch("/api/admin/subscription-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("DATA:", data);

      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const updateStatus = async (id: string, status: Status) => {
    try {
      setUpdatingId(id);

      await fetch(`/api/admin/subscription-payments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔍 FILTERED DATA
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();

    return payments.filter((p) => {
      const orgName = p.organization?.name ?? "";
      const reference = p.reference ?? "";
      const phone = p.phoneNumber ?? "";

      const matchesSearch =
        orgName.toLowerCase().includes(searchLower) ||
        reference.toLowerCase().includes(searchLower) ||
        phone.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]); // 📊 KPIs
  const kpis = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => p.status === "PENDING").length;
    const approved = payments.filter((p) => p.status === "PAID").length;
    const failed = payments.filter((p) => p.status === "FAILED").length;
    const revenue = payments
      .filter((p) => p.status === "PAID")
      .reduce((a, b) => a + b.amount, 0);

    return { total, pending, approved, failed, revenue };
  }, [payments]);

  return (
    <div className="space-y-6 text-slate-100 ">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Subscriptions</h1>
        <p className="text-sm text-slate-400">
          Manage all subscription payments
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: kpis.total },
          { label: "Pending", value: kpis.pending },
          { label: "Approved", value: kpis.approved },
          { label: "Failed", value: kpis.failed },
          { label: "Revenue", value: `$${kpis.revenue}` },
        ].map((k, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <p className="text-xs text-slate-400">{k.label}</p>
            <p className="text-lg font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business or reference..."
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex justify-between">
          <p className="text-sm text-slate-300">Subscriptions</p>
          <p className="text-xs text-slate-500">{filtered.length} records</p>
        </div>

        {/* TABLE BODY */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ?
            <div className="p-6 text-sm text-slate-400">Loading...</div>
          : filtered.length === 0 ?
            <div className="p-6 text-sm text-slate-400">No data found</div>
          : filtered.map((p) => (
              <div
                key={p.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 hover:bg-slate-800/20"
              >
                {/* LEFT */}
                <div>
                  <p className="font-medium">{p.organization.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.phoneNumber} • {p.reference}
                  </p>
                </div>

                {/* MIDDLE */}
                <div className="text-left md:text-right">
                  <p className="font-semibold text-green-400">${p.amount}</p>
                  <StatusBadge status={p.status} />
                </div>

                {/* ACTIONS */}
                {p.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      disabled={updatingId === p.id}
                      onClick={() => updateStatus(p.id, "PAID")}
                      className="px-3 py-1 text-xs rounded bg-green-600/20 text-green-400"
                    >
                      Approve
                    </button>

                    <button
                      disabled={updatingId === p.id}
                      onClick={() => updateStatus(p.id, "FAILED")}
                      className="px-3 py-1 text-xs rounded bg-red-600/20 text-red-400"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
