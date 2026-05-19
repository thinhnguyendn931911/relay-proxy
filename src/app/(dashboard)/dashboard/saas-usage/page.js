"use client";

import { useEffect, useState } from "react";

export default function SaasUsagePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/usage-aggregate")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const totalTokens = data.totals.promptTokens + data.totals.completionTokens;
  const period = `${data.period.slice(0, 4)}/${data.period.slice(4)}`;

  return (
    <div className="flex flex-col gap-6 px-1 sm:px-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">SaaS Usage</h2>
        <span className="text-sm text-text-muted">Period: {period}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Total Tokens</div>
          <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Requests</div>
          <div className="text-2xl font-bold">{data.totals.requests.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Total Users</div>
          <div className="text-2xl font-bold">{data.userCount}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Active Subs</div>
          <div className="text-2xl font-bold">{data.activeSubscriptions}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card">
        <h3 className="border-b border-border-subtle px-4 py-3 text-sm font-semibold text-text-muted">
          Top Users by Token Usage
        </h3>
        {data.topUsers.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">No usage yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Tokens</th>
                  <th className="px-4 py-2">Requests</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((u) => (
                  <tr key={u.userId} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.totalTokens.toLocaleString()}</td>
                    <td className="px-4 py-2">{u.requests.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border-subtle bg-card">
        <h3 className="border-b border-border-subtle px-4 py-3 text-sm font-semibold text-text-muted">
          Provider Breakdown
        </h3>
        {data.providerBreakdown.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">No usage yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Provider</th>
                  <th className="px-4 py-2">Requests</th>
                  <th className="px-4 py-2">Prompt Tokens</th>
                  <th className="px-4 py-2">Completion Tokens</th>
                </tr>
              </thead>
              <tbody>
                {data.providerBreakdown.map((p) => (
                  <tr key={p.provider} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-2 font-medium">{p.provider}</td>
                    <td className="px-4 py-2">{p.requests.toLocaleString()}</td>
                    <td className="px-4 py-2">{p.promptTokens.toLocaleString()}</td>
                    <td className="px-4 py-2">{p.completionTokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
