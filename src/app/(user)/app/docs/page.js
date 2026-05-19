"use client";

import { useState } from "react";

function CodeBlock({ title, code }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-card">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
        <span className="text-sm font-semibold">{title}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-muted hover:bg-hover"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">{code}</pre>
    </div>
  );
}

export default function DocsPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Quick Start</h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure your AI client to use this proxy. Replace <code>sk_user_...</code> with your API key from the Keys page.
        </p>
      </div>

      <CodeBlock
        title="Cursor"
        code={`// Settings → Models → OpenAI API Key
// Base URL:
${baseUrl}/v1

// API Key:
sk_user_YOUR_KEY_HERE`}
      />

      <CodeBlock
        title="Claude Code"
        code={`# In your terminal:
export ANTHROPIC_BASE_URL="${baseUrl}/v1"
export ANTHROPIC_API_KEY="sk_user_YOUR_KEY_HERE"

# Then run claude as usual
claude`}
      />

      <CodeBlock
        title="Cline (VS Code)"
        code={`// Settings → Cline → API Provider: OpenAI Compatible
// Base URL:
${baseUrl}/v1

// API Key:
sk_user_YOUR_KEY_HERE`}
      />

      <CodeBlock
        title="OpenAI SDK (Python)"
        code={`from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}/v1",
    api_key="sk_user_YOUR_KEY_HERE",
)

response = client.chat.completions.create(
    model="provider/model-name",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`}
      />

      <CodeBlock
        title="curl"
        code={`curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer sk_user_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "provider/model-name",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
      />
    </main>
  );
}
