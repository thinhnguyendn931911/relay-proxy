"use client";

import { useEffect, useState } from "react";

function PlanCard({ plan, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setForm({
      displayName: plan.displayName,
      monthlyTokenCap: plan.monthlyTokenCap,
      rpmLimit: plan.rpmLimit,
      priceCents: plan.priceCents,
      allowedModelPatterns: plan.allowedModelPatterns.join(", "),
    });
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      const patterns = form.allowedModelPatterns
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const r = await fetch(`/api/saas/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          monthlyTokenCap: Number(form.monthlyTokenCap),
          rpmLimit: Number(form.rpmLimit),
          priceCents: Number(form.priceCents),
          allowedModelPatterns: patterns,
        }),
      });
      if (r.ok) {
        setEditing(false);
        onSave();
      } else {
        alert((await r.json()).error || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{plan.displayName}</h3>
          <span className="text-xs text-text-muted">{plan.slug}</span>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="rounded-lg border border-border-subtle px-3 py-1.5 text-sm hover:bg-hover"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <Field label="Display Name" value={form.displayName} onChange={(v) => setForm({ ...form, displayName: v })} />
          <Field label="Monthly Token Cap" type="number" value={form.monthlyTokenCap} onChange={(v) => setForm({ ...form, monthlyTokenCap: v })} />
          <Field label="RPM Limit" type="number" value={form.rpmLimit} onChange={(v) => setForm({ ...form, rpmLimit: v })} />
          <Field label="Price (cents)" type="number" value={form.priceCents} onChange={(v) => setForm({ ...form, priceCents: v })} />
          <Field label="Allowed Model Patterns (comma-separated)" value={form.allowedModelPatterns} onChange={(v) => setForm({ ...form, allowedModelPatterns: v })} />
          <div className="flex gap-2 pt-2">
            <button
              disabled={saving}
              onClick={save}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-hover"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-text-muted">Monthly Token Cap</dt>
          <dd>{plan.monthlyTokenCap.toLocaleString()}</dd>
          <dt className="text-text-muted">RPM Limit</dt>
          <dd>{plan.rpmLimit}</dd>
          <dt className="text-text-muted">Price</dt>
          <dd>{plan.priceCents === 0 ? "Free" : `$${(plan.priceCents / 100).toFixed(2)}/mo`}</dd>
          <dt className="text-text-muted">Model Patterns</dt>
          <dd>{plan.allowedModelPatterns.length === 0 ? "All models" : plan.allowedModelPatterns.join(", ")}</dd>
          <dt className="text-text-muted">Stripe Price ID</dt>
          <dd className="font-mono text-xs">{plan.stripePriceId || "-"}</dd>
        </dl>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border-subtle bg-bg px-3 py-1.5 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/saas/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 px-1 sm:px-0">
      <h2 className="text-lg font-semibold">Plans</h2>
      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} onSave={load} />
      ))}
    </div>
  );
}
