"use client";

import { useEffect, useState } from "react";

function ProgressBar({ used, cap }) {
  const pct = cap > 0 ? Math.min((used / cap) * 100, 100) : 0;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-border-subtle">
      <div
        className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : "bg-accent"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function PlanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/plan", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;

  const { subscription, plan, usage } = data || {};

  if (!subscription || !plan) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Plan</h1>
        <div className="rounded-xl border border-border-subtle bg-card p-6 text-center text-text-muted">
          No active subscription found.
        </div>
      </main>
    );
  }

  const daysRemaining = subscription.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd) - Date.now()) / 86_400_000))
    : null;

  const isTrial = subscription.status === "trialing";
  const isPaid = plan.priceCents > 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Plan</h1>

      <div className="rounded-xl border border-border-subtle bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{plan.displayName}</h2>
            <p className="text-sm text-text-muted">
              Status: <span className="font-medium capitalize">{subscription.status}</span>
              {daysRemaining !== null && isTrial && (
                <> &middot; {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining</>
              )}
            </p>
          </div>
          {isPaid && plan.priceCents > 0 && (
            <span className="text-lg font-semibold">${(plan.priceCents / 100).toFixed(2)}/mo</span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-muted">Token Usage</h3>
        <div className="mb-2 flex justify-between text-sm">
          <span>{(usage?.totalTokensUsed ?? 0).toLocaleString()} used</span>
          <span>{plan.monthlyTokenCap.toLocaleString()} cap</span>
        </div>
        <ProgressBar used={usage?.totalTokensUsed ?? 0} cap={plan.monthlyTokenCap} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-sm text-text-muted">RPM Limit</div>
          <div className="text-xl font-bold">{plan.rpmLimit}</div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-card p-4">
          <div className="text-sm text-text-muted">Model Access</div>
          <div className="text-xl font-bold">
            {plan.allowedModelPatterns.length === 0 ? "All models" : plan.allowedModelPatterns.join(", ")}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!isPaid && (
          <button
            onClick={() => {
              fetch("/api/stripe/checkout-session", { method: "POST" })
                .then((r) => r.json())
                .then((d) => { if (d.url) window.location.href = d.url; });
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Upgrade to Paid
          </button>
        )}
        {isPaid && subscription.stripeCustomerId && (
          <button
            onClick={() => {
              fetch("/api/stripe/portal-session", { method: "POST" })
                .then((r) => r.json())
                .then((d) => { if (d.url) window.location.href = d.url; });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium hover:bg-hover"
          >
            Manage Subscription
          </button>
        )}
      </div>
    </main>
  );
}
