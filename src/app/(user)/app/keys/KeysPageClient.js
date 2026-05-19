"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input } from "@/shared/components";

function formatDate(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function KeysPageClient() {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadKeys() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/saas/keys", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load keys");
      setKeys(data.keys || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function createKey(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setCreatedKey(null);
    try {
      const res = await fetch("/api/saas/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      setCreatedKey(data.key);
      setName("");
      await loadKeys();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(id) {
    setError("");
    const res = await fetch(`/api/saas/keys/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to revoke key");
      return;
    }
    await loadKeys();
  }

  async function copyKey(value) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <main className="min-h-screen bg-bg text-text-main">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">API Keys</h1>
            <p className="text-sm text-text-muted">Create and revoke user-scoped keys.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {createdKey?.key && (
          <Card title="New Key" subtitle="Shown once" icon="key">
            <div className="flex flex-col gap-3 sm:flex-row">
              <code className="min-w-0 flex-1 rounded-[8px] border border-border-subtle bg-bg px-3 py-2 text-sm break-all">
                {createdKey.key}
              </code>
              <Button type="button" variant="secondary" icon="content_copy" onClick={() => copyKey(createdKey.key)}>
                Copy
              </Button>
            </div>
          </Card>
        )}

        <Card title="Create Key" icon="add">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={createKey}>
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production key"
              required
              className="flex-1"
            />
            <div className="flex items-end">
              <Button type="submit" loading={saving} disabled={!name.trim()}>
                Create
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Keys" icon="vpn_key">
          {loading ? (
            <div className="py-8 text-center text-sm text-text-muted">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">No keys yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-border-subtle text-xs uppercase text-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Created</th>
                    <th className="px-3 py-2 font-semibold">Last Used</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-3 py-3 font-medium">{key.name}</td>
                      <td className="px-3 py-3 text-text-muted">{formatDate(key.createdAt)}</td>
                      <td className="px-3 py-3 text-text-muted">{formatDate(key.lastUsedAt)}</td>
                      <td className="px-3 py-3">
                        <span className={key.revokedAt ? "text-red-500" : "text-green-600"}>
                          {key.revokedAt ? "Revoked" : "Active"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          icon="block"
                          disabled={Boolean(key.revokedAt)}
                          onClick={() => revokeKey(key.id)}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
