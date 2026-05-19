"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page, status });
    if (search) qs.set("q", search);
    fetch(`/api/saas/users?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-4 px-1 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Users ({total})</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-lg border border-border-subtle bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-border-subtle bg-card px-3 py-1.5 text-sm outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card">
        {loading ? (
          <div className="py-12 text-center text-sm text-text-muted">Loading...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Sub Status</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-hover">
                    <td className="px-4 py-2">
                      <Link href={`/dashboard/users/${u.id}`} className="text-accent hover:underline">
                        {u.email}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.status === "active" ? "bg-green-500/10 text-green-500" :
                        u.status === "suspended" ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-text-muted">{u.planName || "-"}</td>
                    <td className="px-4 py-2 text-text-muted capitalize">{u.subscriptionStatus || "-"}</td>
                    <td className="px-4 py-2 text-text-muted">{u.isOperator ? "Operator" : "User"}</td>
                    <td className="px-4 py-2 text-text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border-subtle px-3 py-1 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-text-muted">Page {page} of {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border-subtle px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
