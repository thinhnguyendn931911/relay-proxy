"use client";

import { useEffect, useState } from "react";
import PlanPageSkeleton from "./PlanPageSkeleton";

const PAID_PLAN = {
  displayName: "Paid",
  priceCents: 1000,
  monthlyTokenCap: 2_500_000,
  rpmLimit: 60,
  modelAccess: "All models",
};

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

function PlanStat({ label, value }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-card p-4">
      <div className="text-sm text-text-muted">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function PaidUpgradeCard({ onUpgrade }) {
  const benefits = [
    `${PAID_PLAN.monthlyTokenCap.toLocaleString()} monthly tokens`,
    `${PAID_PLAN.rpmLimit} requests per minute`,
    `${PAID_PLAN.modelAccess} included`,
    "Usage history and user-scoped API keys",
  ];

  return (
    <section className="rounded-xl border border-accent/30 bg-accent/10 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
            Recommended upgrade
          </div>
          <h2 className="text-2xl font-bold">Get more room with Paid</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            Keep the same endpoint and API keys, then raise your monthly token cap and request limit for production traffic.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-border-subtle bg-card p-4 text-left lg:min-w-48">
          <div className="text-sm text-text-muted">{PAID_PLAN.displayName}</div>
          <div className="mt-1 text-3xl font-bold">${(PAID_PLAN.priceCents / 100).toFixed(0)}</div>
          <div className="text-sm text-text-muted">per month</div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
            <span className="material-symbols-outlined text-[18px] text-accent">check_circle</span>
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onUpgrade}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:opacity-90"
      >
        Upgrade to Paid
      </button>
    </section>
  );
}

export default function PlanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/saas/plan", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PlanPageSkeleton />;

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

  const daysRemaining = subscription.currentPeriodEnd && currentTime
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd) - currentTime) / 86_400_000))
    : null;

  const isTrial = subscription.status === "trialing";
  const isPaid = plan.priceCents > 0;
  const startCheckout = () => {
    fetch("/api/stripe/checkout-session", { method: "POST" })
      .then((r) => r.json())
      .then((d) => { if (d.url) window.location.href = d.url; });
  };

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
        <PlanStat label="RPM Limit" value={plan.rpmLimit} />
        <PlanStat
          label="Model Access"
          value={plan.allowedModelPatterns.length === 0 ? "All models" : plan.allowedModelPatterns.join(", ")}
        />
      </div>

      {!isPaid && <PaidUpgradeCard onUpgrade={startCheckout} />}

      <div className="flex gap-3">
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
