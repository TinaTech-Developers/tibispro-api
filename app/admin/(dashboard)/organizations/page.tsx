"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Org = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plan: "FREE" | "PRO";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count?: {
    users: number;
    customers: number;
    invoices: number;
  };
};

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchOrgs = async () => {
    setLoading(true);

    const res = await fetch("/api/admin/organizations", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setOrgs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const filtered = useMemo(() => {
    return orgs.filter((o) => {
      const s = search.toLowerCase();

      return (
        o.name?.toLowerCase().includes(s) ||
        o.email?.toLowerCase().includes(s) ||
        o.phone?.toLowerCase().includes(s)
      );
    });
  }, [orgs, search]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Organizations</h1>
        <p className="text-sm text-slate-400">
          Manage all registered businesses
        </p>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search organizations..."
        className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
      />

      {/* TABLE */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="p-4 border-b border-slate-800 flex justify-between">
          <p className="text-sm text-slate-300">All Organizations</p>
          <p className="text-xs text-slate-500">{filtered.length} total</p>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {loading ?
            <div className="p-6 text-slate-400">Loading...</div>
          : filtered.length === 0 ?
            <div className="p-6 text-slate-400">No organizations found</div>
          : filtered.map((o) => (
              <Link
                href={`/admin/organizations/${o.id}`}
                key={o.id}
                className="p-4 border-b border-slate-800 flex justify-between hover:bg-slate-800/20"
              >
                <div>
                  <p className="font-medium">{o.name}</p>
                  <p className="text-xs text-slate-400">
                    {o.email} • {o.phone}
                  </p>

                  <div className="text-xs text-slate-500 mt-1 space-x-3">
                    <span>Users: {o._count?.users ?? 0}</span>
                    <span>Invoices: {o._count?.invoices ?? 0}</span>
                    <span>Customers: {o._count?.customers ?? 0}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">{o.plan}</p>
                  <p className="text-xs text-slate-400">{o.status}</p>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
}
