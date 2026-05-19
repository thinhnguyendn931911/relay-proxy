"use client";

import { useEffect, useState } from "react";

function formatDate(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

function TokenBar({ day, maxTokens }) {
  const total = day.promptTokens + day.completionTokens;
  const pct = maxTokens > 0 ? Math.min((total / maxTokens) * 100, 100) : 0;
  const label = day.day?.slice(5);
  return (
    <div className="flex flex-col items-center gap-1" title={`${label}: ${total.toLocaleString()} tokens`}>
      <div className="relative h-24 w-6 rounded bg-border-subtle">
        <div
          className="absolute bottom-0 w-full rounded bg-accent transition-all"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}

export default function UsagePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/usage", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load usage data</div>;

  const { period = {}, daily = [], recent = [] } = data;
  const totalTokens = (period.promptTokens ?? 0) + (period.completionTokens ?? 0);
  const maxDay = Math.max(1, ...daily.map((d) => (d.promptTokens ?? 0) + (d.completionTokens ?? 0)));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Usage</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-sm text-text-muted">Total Tokens</div>
          <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-sm text-text-muted">Requests</div>
          <div className="text-2xl font-bold">{(period.requests ?? 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-sm text-text-muted">Period</div>
          <div className="text-2xl font-bold">{period.key ? `${period.key.slice(0, 4)}/${period.key.slice(4)}` : "-"}</div>
        </div>
      </div>

      {daily.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-muted">Daily Tokens</h2>
          <div className="flex items-end gap-1 overflow-x-auto pb-2">
            {daily.map((d) => (
              <TokenBar key={d.day} day={d} maxTokens={maxDay} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border-subtle bg-card">
        <h2 className="border-b border-border-subtle px-4 py-3 text-sm font-semibold text-text-muted">Recent Requests</h2>
        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">No requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Model</th>
                  <th className="px-4 py-2">Prompt</th>
                  <th className="px-4 py-2">Completion</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-2 text-text-muted">{formatDate(r.timestamp)}</td>
                    <td className="px-4 py-2">{r.model || "-"}</td>
                    <td className="px-4 py-2">{r.promptTokens}</td>
                    <td className="px-4 py-2">{r.completionTokens}</td>
                    <td className="px-4 py-2">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
