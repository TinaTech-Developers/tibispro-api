"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// ================= TYPES =================

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "STAFF";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

type ApiResponse = {
  users: User[];
  total: number;
};

// ================= UTIL =================

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 400) {
  let timer: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ================= BADGE =================

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "red" | "yellow" | "blue";
}) {
  const styles = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${styles[tone]}`}>
      {children}
    </span>
  );
}

// ================= MAIN =================

export default function UsersModule() {
  const { id: orgId } = useParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const limit = 10;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!orgId) return; // ✅ FIXED

    fetchUsers();
  }, [orgId, page, roleFilter, statusFilter]);

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    if (!orgId) return;

    setLoading(true);

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      role: roleFilter,
      status: statusFilter,
    });

    const res = await fetch(
      `/api/admin/organizations/${orgId}/users?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data: ApiResponse = await res.json();

    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    if (orgId) fetchUsers();
  }, [orgId, page, roleFilter, statusFilter]);

  // debounce search
  const setSearchDebounced = useMemo(
    () => debounce((val: string) => setSearch(val), 400),
    [],
  );

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // ================= BULK =================

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelected(users.map((u) => u.id));
  };

  const clearSelection = () => setSelected([]);

  const bulkUpdate = async (status: "ACTIVE" | "SUSPENDED") => {
    await fetch(`/api/admin/users/bulk`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: selected, status }),
    });

    setUsers((prev) =>
      prev.map((u) => (selected.includes(u.id) ? { ...u, status } : u)),
    );

    clearSelection();
  };

  // ================= SINGLE ACTIONS =================

  const updateUserStatus = async (userId: string, status: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: status as any } : u)),
    );
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user permanently?")) return;

    await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // ================= UI =================

  return (
    <div className="space-y-4 text-white mt-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Users</h2>

        <button
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg"
        >
          + Invite User
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="grid md:grid-cols-4 gap-3">
        <input
          placeholder="Search users..."
          onChange={(e) => setSearchDebounced(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg"
        />

        <select
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
          <option value="USER">User</option>
        </select>

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-2 py-1 bg-slate-800 rounded"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="text-xs px-2 py-1 bg-slate-800 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
          <span className="text-sm">{selected.length} selected</span>

          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdate("ACTIVE")}
              className="text-xs px-3 py-1 bg-green-600/20 text-green-400 rounded"
            >
              Activate
            </button>

            <button
              onClick={() => bulkUpdate("SUSPENDED")}
              className="text-xs px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded"
            >
              Suspend
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ?
          <div className="p-6 text-slate-400">Loading...</div>
        : users.length === 0 ?
          <div className="p-6 text-slate-500">No users found</div>
        : users.map((u) => (
            <div
              key={u.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/20"
            >
              {/* SELECT */}
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => toggleSelect(u.id)}
              />

              {/* INFO */}
              <div className="flex-1 ml-3">
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>

              {/* BADGES */}
              <div className="flex gap-2">
                <Badge
                  tone={
                    u.role === "ADMIN" ? "blue"
                    : u.role === "STAFF" ?
                      "yellow"
                    : "green"
                  }
                >
                  {u.role}
                </Badge>

                <Badge tone={u.status === "ACTIVE" ? "green" : "red"}>
                  {u.status}
                </Badge>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 ml-4">
                {u.status === "ACTIVE" ?
                  <button
                    onClick={() => updateUserStatus(u.id, "SUSPENDED")}
                    className="text-xs px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded"
                  >
                    Suspend
                  </button>
                : <button
                    onClick={() => updateUserStatus(u.id, "ACTIVE")}
                    className="text-xs px-3 py-1 bg-green-600/20 text-green-400 rounded"
                  >
                    Activate
                  </button>
                }

                <button
                  onClick={() => deleteUser(u.id)}
                  className="text-xs px-3 py-1 bg-red-600/20 text-red-400 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm text-slate-400">
        <p>
          Page {page} • {total} users
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-slate-800 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-slate-800 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* INVITE MODAL (placeholder) */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-[400px]">
            <h3 className="text-lg font-semibold mb-3">Invite User</h3>

            <input
              placeholder="Email"
              className="w-full mb-3 px-3 py-2 bg-slate-800 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-3 py-1 text-sm"
              >
                Cancel
              </button>

              <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
