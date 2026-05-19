"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      fetch(`/api/saas/users/${id}`).then((r) => r.json()),
      fetch("/api/saas/plans").then((r) => r.json()),
    ])
      .then(([userData, planData]) => {
        setData(userData);
        setPlans(planData.plans || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function act(body) {
    setActing(true);
    try {
      const r = await fetch(`/api/saas/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) load();
      else alert((await r.json()).error || "Action failed");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;
  if (!data?.user) return <div className="p-8 text-center text-red-500">User not found</div>;

  const { user, subscription, usage, activeKeys } = data;
  const totalTokens = usage.promptTokens + usage.completionTokens;

  return (
    <div className="flex flex-col gap-6 px-1 sm:px-0">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/users")} className="text-sm text-accent hover:underline">
          &larr; Users
        </button>
        <h2 className="text-lg font-semibold">{user.email}</h2>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          user.status === "active" ? "bg-green-500/10 text-green-500" :
          user.status === "suspended" ? "bg-red-500/10 text-red-500" :
          "bg-yellow-500/10 text-yellow-500"
        }`}>
          {user.status}
        </span>
        {user.isOperator && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            Operator
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Monthly Tokens</div>
          <div className="text-xl font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Requests</div>
          <div className="text-xl font-bold">{usage.requests.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Active Keys</div>
          <div className="text-xl font-bold">{activeKeys}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-xs text-text-muted">Plan</div>
          <div className="text-xl font-bold">{subscription?.planName || "None"}</div>
          {subscription && (
            <div className="text-xs text-text-muted capitalize">{subscription.status}</div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {user.status === "active" && (
            <button
              disabled={acting}
              onClick={() => act({ action: "suspend" })}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-50"
            >
              Suspend User
            </button>
          )}
          {user.status === "suspended" && (
            <button
              disabled={acting}
              onClick={() => act({ action: "reactivate" })}
              className="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500 hover:bg-green-500/20 disabled:opacity-50"
            >
              Reactivate User
            </button>
          )}
          <button
            disabled={acting}
            onClick={() => act({ action: "reset_trial" })}
            className="rounded-lg bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-500/20 disabled:opacity-50"
          >
            Reset Trial
          </button>
          {subscription && plans.length > 0 && (
            <select
              disabled={acting}
              onChange={(e) => {
                if (e.target.value) act({ action: "override_plan", planId: e.target.value });
                e.target.value = "";
              }}
              defaultValue=""
              className="rounded-lg border border-border-subtle bg-card px-3 py-2 text-sm outline-none"
            >
              <option value="" disabled>Override Plan...</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6">
        <h3 className="mb-2 text-sm font-semibold">Details</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-text-muted">User ID</dt>
          <dd className="font-mono text-xs">{user.id}</dd>
          <dt className="text-text-muted">Joined</dt>
          <dd>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</dd>
          {subscription && (
            <>
              <dt className="text-text-muted">Period Ends</dt>
              <dd>{subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleString() : "-"}</dd>
              <dt className="text-text-muted">Stripe Customer</dt>
              <dd className="font-mono text-xs">{subscription.stripeCustomerId || "-"}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
