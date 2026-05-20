<div align="center">
  <img src="./images/relay-ai.png?1" alt="Relay AI Dashboard" width="800"/>
  
  # Relay AI - SaaS AI Gateway & Token Saver
  
  **Run a hosted AI gateway for coding teams: user API keys, plan quotas, Stripe billing, operator controls, RTK token savings, and provider fallback.**
  
  **Connect Claude Code, Cursor, Antigravity, Copilot, Codex, Gemini, OpenCode, Cline, OpenClaw, and other OpenAI-compatible tools to 40+ AI providers and 100+ models.**
  
  [![Docker Pulls](https://img.shields.io/docker/pulls/decolua/relay-proxy.svg?logo=docker&label=Docker%20pulls)](https://hub.docker.com/r/decolua/relay-proxy)
  [![License](https://img.shields.io/github/license/thinhnguyendn931911/relay-proxy.svg)](https://github.com/thinhnguyendn931911/relay-proxy/blob/main/LICENSE)

  [Quick Start](#-quick-start) | [SaaS Product](#-saas-product) | [Features](#-key-features) | [Setup](#-setup-guide)

  [Tieng Viet](./i18n/README.vi.md) | [Chinese](./i18n/README.zh-CN.md) | [Japanese](./i18n/README.ja-JP.md)
</div>

---

## Why Relay AI?

**Ship an AI gateway people can actually use, pay for, and operate:**

- Teams need one endpoint for many AI coding tools
- Subscription quotas, API keys, and model access get hard to manage
- Tool outputs (`git diff`, `grep`, `ls`...) burn tokens fast
- Public deployments need sign-in, user-scoped keys, quotas, and billing
- Operators need visibility into users, plans, usage, and abuse controls

**Relay AI solves this:**

- **SaaS-ready gateway** - Clerk auth, per-user API keys, plan quotas, RPM limits, and Stripe billing
- **RTK Token Saver** - Auto-compress tool_result content and save 20-40% tokens per request
- **Smart routing** - Subscription -> Cheap -> Free fallback with provider quota tracking
- **Operator control** - Manage users, plans, usage, suspension, trials, and production operations
- **Universal endpoint** - OpenAI-compatible API for Claude Code, Codex, Cursor, Cline, and more

---

## How It Works

```
+--------------+
|  Your CLI    |  (Claude Code, Codex, OpenClaw, Cursor, Cline...)
|   Tool       |
+------+-------+
       | http://localhost:20128/v1
       v
+---------------------------------------------+
|       Relay AI SaaS Gateway / Smart Router  |
|  * Clerk auth + user-scoped API keys        |
|  * Plans, quotas, RPM limits, Stripe billing|
|  * RTK Token Saver (cut tool_result tokens) |
|  * Format translation (OpenAI <-> Claude)   |
|  * User and provider quota tracking         |
|  * Auto token refresh                       |
+------+--------------------------------------+
       |
       +--> [Tier 1: SUBSCRIPTION] Claude Code, Codex, GitHub Copilot
       |    v quota exhausted
       +--> [Tier 2: CHEAP] GLM ($0.6/1M), MiniMax ($0.2/1M)
       |    v budget limit
       +--> [Tier 3: FREE] Kiro, OpenCode Free, Vertex ($300 credits)

Result: Never stop coding, minimal cost + 20-40% token savings via RTK
```

---

## Quick Start

Choose the path that matches how you want to run Relay AI.

### Hosted SaaS user

**1. Sign in to the hosted app**

Open your deployment and sign in with Clerk:

```
https://your-domain.com/sign-in
```

**2. Create a user API key**

Go to `/app/keys`, create a user-scoped `sk_user_...` key, and copy it once.

**3. Configure your AI coding tool**

```
Claude Code/Codex/OpenClaw/Cursor/Cline Settings:
  Endpoint: https://your-domain.com/v1
  API Key: sk_user_...
  Model: kr/claude-sonnet-4.5
```

Use `/app/usage` to monitor tokens and requests, `/app/plan` to view quota and billing, and `/app/docs` for client snippets.

### Local development

```bash
cp .env.example .env
npm install
PORT=20128 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run dev
```

Default local URLs:
- Landing page: `http://localhost:20128`
- User app: `http://localhost:20128/app/keys`
- Operator dashboard: `http://localhost:20128/dashboard`
- OpenAI-compatible API: `http://localhost:20128/v1`

Local development can use SQLite fallback. Hosted SaaS deployments should use Postgres, Clerk, and Stripe.

### Production

```bash
npm install
npm run build
PORT=20128 HOSTNAME=0.0.0.0 NODE_ENV=production npm run start
```

For hosted SaaS, configure `DATABASE_URL`, Clerk keys, Stripe keys, secure secrets, reverse proxy/TLS, and backups before opening signup.

---

## SaaS Product

Relay AI can run as a hosted SaaS gateway in front of your provider accounts and model routing rules.

| Area | Capability |
|------|------------|
| **Authentication** | Clerk sign-in/sign-up, protected `/app/*` user routes, operator-gated `/dashboard/*` routes |
| **User API keys** | Per-user `sk_user_...` keys with HMAC storage, create/list/revoke lifecycle, and one-time plaintext display |
| **Usage controls** | Monthly token caps, plan-based model gating, per-user RPM limits, suspended-user blocking |
| **Billing** | Stripe Checkout for upgrades, Stripe Customer Portal for paid users, subscription webhook sync |
| **User dashboard** | `/app/keys`, `/app/usage`, `/app/plan`, and `/app/docs` for self-serve onboarding |
| **Operator admin** | User management, suspension/reactivation, operator promotion, plan editing, aggregate usage views |
| **Data layer** | Postgres multi-tenant mode with SQLite fallback for local/private installs |
| **Operations** | `/api/health`, VPS/Node process deployment, reverse proxy/TLS, trial expiration, and backup guidance |

### End-User Workflow

1. Sign in or sign up through Clerk.
2. Open `/app/keys` and create a user API key.
3. Configure your AI tool with `https://your-domain/v1` and the generated key.
4. Use `/app/usage` to track requests and token consumption.
5. Use `/app/plan` to view plan limits, upgrade through Stripe Checkout, or open Stripe Customer Portal.
6. Use `/app/docs` for ready-to-copy client snippets.

### Operator Workflow

1. Deploy with Postgres, Clerk, Stripe, and secure production secrets.
2. Let the first synced Clerk user become the initial operator before public signup opens.
3. Configure provider accounts, model combos, plans, quotas, and RPM limits.
4. Manage users from `/dashboard/users`, plans from `/dashboard/plans`, and aggregate usage from `/dashboard/usage`.
5. Monitor `/api/health`, run trial expiration on schedule, and keep Postgres backups off-box.

---

## Video Guides

<div align="center">

<table>
  <tr>
    <td align="center" width="320">
      <a href="https://www.youtube.com/watch?v=raEyZPg5xE0">
        <img src="https://img.youtube.com/vi/raEyZPg5xE0/maxresdefault.jpg" alt="Relay AI Setup Tutorial" width="300"/>
      </a><br/>
      <b>English</b><br/>
      <sub>Relay AI + Claude Code FREE Setup<br/>by <a href="https://www.youtube.com/@BuildAIWithHamid">Build AI With Hamid</a></sub>
    </td>
    <td align="center" width="320">
      <a href="https://www.youtube.com/watch?v=X69n5Lm06Yw">
        <img src="https://img.youtube.com/vi/X69n5Lm06Yw/maxresdefault.jpg" alt="Save LLM costs with Relay AI" width="300"/>
      </a><br/>
      <b>Tieng Viet</b><br/>
      <sub>Save LLM costs for OpenClaw with Relay AI<br/>by <a href="https://www.youtube.com/c/M%C3%ACAIblog">Mi AI</a></sub>
    </td>
    <td align="center" width="320">
      <a href="https://www.youtube.com/watch?v=o3qYCyjrFYg">
        <img src="https://img.youtube.com/vi/o3qYCyjrFYg/maxresdefault.jpg" alt="Claude Code FREE Forever" width="300"/>
      </a><br/>
      <b>English</b><br/>
      <sub>Claude Code FREE Forever - Unlimited Models<br/>by <a href="https://www.youtube.com/@BuildAIWithHamid">Build AI With Hamid</a></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="320">
      <a href="https://www.youtube.com/watch?v=Ttpc26m39Dw">
        <img src="https://img.youtube.com/vi/Ttpc26m39Dw/maxresdefault.jpg" alt="Claude CLI Free Setup" width="300"/>
      </a><br/>
      <b>English</b><br/>
      <sub>Claude CLI Free Setup with Relay AI<br/>by <a href="https://www.youtube.com/@CodeVerseSoban">CodeVerse Soban</a></sub>
    </td>
    <td align="center" width="320">
      <a href="https://www.youtube.com/watch?v=G-5A_D5Pm6Y">
        <img src="https://img.youtube.com/vi/G-5A_D5Pm6Y/maxresdefault.jpg" alt="Setup OpenClaw Free A-Z" width="300"/>
      </a><br/>
      <b>Tieng Viet</b><br/>
      <sub>Setup OpenClaw Free A-Z + Relay AI<br/>by <a href="https://www.youtube.com/@maigia">Mai Gia</a></sub>
    </td>
    <td align="center" width="320">
      <a href="https://www.youtube.com/watch?v=JXmg8_gccgE">
        <img src="https://img.youtube.com/vi/JXmg8_gccgE/maxresdefault.jpg" alt="FREE OpenClaw with Claude Opus" width="300"/>
      </a><br/>
      <b>English</b><br/>
      <sub>FREE OpenClaw + Claude Opus 4.6<br/>by <a href="https://www.youtube.com/@BuildAIWithHamid">Build AI With Hamid</a></sub>
    </td>
  </tr>
</table>

</div>

> **Made a video about Relay AI?** Submit a [Pull Request](https://github.com/thinhnguyendn931911/relay-proxy/pulls) adding your video to this section!

---

## Supported CLI Tools

Relay AI works seamlessly with all major AI coding tools:

<div align="center">
  <table>
    <tr>
      <td align="center" width="120">
        <img src="./public/providers/claude.png" width="60" alt="Claude Code"/><br/>
        <b>Claude-Code</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/openclaw.png" width="60" alt="OpenClaw"/><br/>
        <b>OpenClaw</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/codex.png" width="60" alt="Codex"/><br/>
        <b>Codex</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/opencode.png" width="60" alt="OpenCode"/><br/>
        <b>OpenCode</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/cursor.png" width="60" alt="Cursor"/><br/>
        <b>Cursor</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/antigravity.png" width="60" alt="Antigravity"/><br/>
        <b>Antigravity</b>
      </td>
    </tr>
    <tr>
      <td align="center" width="120">
        <img src="./public/providers/cline.png" width="60" alt="Cline"/><br/>
        <b>Cline</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/continue.png" width="60" alt="Continue"/><br/>
        <b>Continue</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/droid.png" width="60" alt="Droid"/><br/>
        <b>Droid</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/roo.png" width="60" alt="Roo"/><br/>
        <b>Roo</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/copilot.png" width="60" alt="Copilot"/><br/>
        <b>Copilot</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/kilocode.png" width="60" alt="Kilo Code"/><br/>
        <b>Kilo Code</b>
      </td>
    </tr>
  </table>
</div>

---

## Supported Providers

### OAuth Providers

<div align="center">
  <table>
    <tr>
      <td align="center" width="120">
        <img src="./public/providers/claude.png" width="60" alt="Claude Code"/><br/>
        <b>Claude-Code</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/antigravity.png" width="60" alt="Antigravity"/><br/>
        <b>Antigravity</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/codex.png" width="60" alt="Codex"/><br/>
        <b>Codex</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/github.png" width="60" alt="GitHub"/><br/>
        <b>GitHub</b>
      </td>
      <td align="center" width="120">
        <img src="./public/providers/cursor.png" width="60" alt="Cursor"/><br/>
        <b>Cursor</b>
      </td>
    </tr>
  </table>
</div>

### Free Providers

<div align="center">
  <table>
    <tr>
      <td align="center" width="150">
        <img src="./public/providers/kiro.png" width="70" alt="Kiro"/><br/>
        <b>Kiro AI</b><br/>
        <sub>Claude 4.5 + GLM-5 + MiniMax<br/>Unlimited FREE</sub>
      </td>
      <td align="center" width="150">
        <img src="./public/providers/opencode.png" width="70" alt="OpenCode Free"/><br/>
        <b>OpenCode Free</b><br/>
        <sub>No auth - Auto-fetch models<br/>Unlimited FREE</sub>
      </td>
      <td align="center" width="150">
        <img src="./public/providers/gemini.png" width="70" alt="Vertex AI"/><br/>
        <b>Vertex AI</b><br/>
        <sub>Gemini 3 Pro + GLM-5 + DeepSeek<br/>$300 credits free</sub>
      </td>
    </tr>
  </table>
</div>

> **Note:** iFlow, Qwen and Gemini CLI free tiers were discontinued in 2026. Use Kiro / OpenCode Free / Vertex instead.

### API Key Providers (40+)

<div align="center">
  <table>
    <tr>
      <td align="center" width="100">
        <img src="./public/providers/openrouter.png" width="50" alt="OpenRouter"/><br/>
        <sub>OpenRouter</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/glm.png" width="50" alt="GLM"/><br/>
        <sub>GLM</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/kimi.png" width="50" alt="Kimi"/><br/>
        <sub>Kimi</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/minimax.png" width="50" alt="MiniMax"/><br/>
        <sub>MiniMax</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/openai.png" width="50" alt="OpenAI"/><br/>
        <sub>OpenAI</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/anthropic.png" width="50" alt="Anthropic"/><br/>
        <sub>Anthropic</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="100">
        <img src="./public/providers/gemini.png" width="50" alt="Gemini"/><br/>
        <sub>Gemini</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/deepseek.png" width="50" alt="DeepSeek"/><br/>
        <sub>DeepSeek</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/groq.png" width="50" alt="Groq"/><br/>
        <sub>Groq</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/xai.png" width="50" alt="xAI"/><br/>
        <sub>xAI</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/mistral.png" width="50" alt="Mistral"/><br/>
        <sub>Mistral</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/perplexity.png" width="50" alt="Perplexity"/><br/>
        <sub>Perplexity</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="100">
        <img src="./public/providers/together.png" width="50" alt="Together"/><br/>
        <sub>Together AI</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/fireworks.png" width="50" alt="Fireworks"/><br/>
        <sub>Fireworks</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/cerebras.png" width="50" alt="Cerebras"/><br/>
        <sub>Cerebras</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/cohere.png" width="50" alt="Cohere"/><br/>
        <sub>Cohere</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/nvidia.png" width="50" alt="NVIDIA"/><br/>
        <sub>NVIDIA</sub>
      </td>
      <td align="center" width="100">
        <img src="./public/providers/siliconflow.png" width="50" alt="SiliconFlow"/><br/>
        <sub>SiliconFlow</sub>
      </td>
    </tr>
  </table>
  <p><i>...and 20+ more providers including Nebius, Chutes, Hyperbolic, and custom OpenAI/Anthropic compatible endpoints</i></p>
</div>

---

## Key Features

| Feature | What It Does | Why It Matters |
|---------|--------------|----------------|
| **RTK Token Saver** ([RTK](https://github.com/rtk-ai/rtk)) | Compress tool outputs (`git diff`, `grep`, `ls`, `tree`...) before sending to LLM | Save **20-40% input tokens** per request |
| **Caveman Mode** ([Caveman](https://github.com/JuliusBrussee/caveman)) | Inject caveman-speak prompt, LLM replies terse, technical substance preserved | Save **up to 65% output tokens** |
| **Smart 3-Tier Fallback** | Auto-route: Subscription -> Cheap -> Free | Never stop coding, zero downtime |
| **Real-Time Quota Tracking** | Live token count + reset countdown | Maximize subscription value |
| **Format Translation** | OpenAI <-> Claude <-> Gemini <-> Cursor <-> Kiro <-> Vertex | Works with any CLI tool |
| **Multi-Account Support** | Multiple accounts per provider | Load balancing + redundancy |
| **Auto Token Refresh** | OAuth tokens refresh automatically | No manual re-login needed |
| **Custom Combos** | Create unlimited model combinations | Tailor fallback to your needs |
| **Request Logging** | Debug mode with full request/response logs | Troubleshoot issues easily |
| **Cloud Sync** | Sync config across devices | Same setup everywhere |
| **Usage Analytics** | Track tokens, cost, trends over time | Optimize spending |
| **Deploy Anywhere** | Localhost, VPS, Docker, Cloudflare Workers | Flexible deployment options |

<details>
<summary><b>Feature Details</b></summary>

### RTK Token Saver

Tool outputs (`git diff`, `grep`, `find`, `ls`, `tree`, log dumps...) often eat 30-50% of your prompt budget. RTK detects them and applies smart, lossless compression **before** the request hits the LLM:

- **Filters:** `git-diff`, `git-status`, `grep`, `find`, `ls`, `tree`, `dedup-log`, `smart-truncate`, `read-numbered`, `search-list`
- **Auto-detect:** No config needed - RTK peeks the first 1KB of each `tool_result` and picks the right filter.
- **Safe by design:** If a filter fails, throws, or makes output bigger, RTK silently keeps the original text. Errors never break your request.
- **Universal:** Works across all formats (OpenAI, Claude, Gemini, Cursor, Kiro, OpenAI Responses) because it runs **before** any format translation.
- **Default ON:** Toggle anytime in Dashboard -> Endpoint settings.

```
Without RTK: 47K tokens sent to LLM
With RTK:    28K tokens sent to LLM   (40% saved - same context - same answer)
```

### Smart 3-Tier Fallback

Create combos with automatic fallback:

```
Combo: "my-coding-stack"
  1. cc/claude-opus-4-6        (your subscription)
  2. glm/glm-4.7               (cheap backup, $0.6/1M)
  3. if/kimi-k2-thinking       (free fallback)

-> Auto switches when quota runs out or errors occur
```

### Real-Time Quota Tracking

- Token consumption per provider
- Reset countdown (5-hour, daily, weekly)
- Cost estimation for paid tiers
- Monthly spending reports

### Format Translation

Seamless translation between formats:
- **OpenAI** <-> **Claude** <-> **Gemini** <-> **Cursor** <-> **Kiro** <-> **Vertex** <-> **Antigravity** <-> **Ollama** <-> **OpenAI Responses**
- Your CLI tool sends OpenAI format -> Relay AI translates -> Provider receives native format
- Works with any tool that supports custom OpenAI endpoints

### Multi-Account Support

- Add multiple accounts per provider
- Auto round-robin or priority-based routing
- Fallback to next account when one hits quota

### Auto Token Refresh

- OAuth tokens automatically refresh before expiration
- No manual re-authentication needed
- Seamless experience across all providers

### Custom Combos

- Create unlimited model combinations
- Mix subscription, cheap, and free tiers
- Name your combos for easy access
- Share combos across devices with Cloud Sync

### Request Logging

- Enable debug mode for full request/response logs
- Track API calls, headers, and payloads
- Troubleshoot integration issues
- Export logs for analysis

### Cloud Sync

- Sync providers, combos, and settings across devices
- Automatic background sync
- Secure encrypted storage
- Access your setup from anywhere

#### Cloud Runtime Notes

- Prefer server-side cloud variables in production:
  - `BASE_URL` (internal callback URL used by sync scheduler)
  - `CLOUD_URL` (cloud sync endpoint base)
- `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_CLOUD_URL` are still supported for compatibility/UI, but server runtime now prioritizes `BASE_URL`/`CLOUD_URL`.
- Cloud sync requests now use timeout + fail-fast behavior to avoid UI hanging when cloud DNS/network is unavailable.

### Usage Analytics

- Track token usage per provider and model
- Cost estimation and spending trends
- Monthly reports and insights
- Optimize your AI spending

> **IMPORTANT - Understanding Dashboard Costs:**
> 
> The provider "cost" displayed in Usage Analytics is **for upstream tracking and comparison**. 
> SaaS subscription status and invoices are handled separately through Stripe on `/app/plan`.
> 
> **Example:** If your dashboard shows "$290 estimated provider cost" while using free models, this represents 
> what comparable paid API usage might have cost. Your SaaS plan and provider bills are separate.
> 
> Think of it as a savings and optimization signal for routing decisions.

### Deploy Anywhere

- **Localhost** - Default, works offline
- **VPS/Cloud** - Share across devices
- **Docker** - One-command deployment
- **Cloudflare Workers** - Global edge network

</details>

---

## Plans, Provider Costs, and Billing

Relay AI has two cost layers:

| Layer | Who manages it | What it covers |
|-------|----------------|----------------|
| **SaaS plan** | Your Relay AI deployment via Stripe | User access, monthly token quota, RPM limit, model access, checkout, and customer portal |
| **Provider cost** | The provider account owner | Claude Code, Codex, Copilot, Cursor, GLM, MiniMax, Kiro, OpenCode Free, Vertex, and other upstream accounts |

Default SaaS plans are seeded in the database:

| Plan | Included limits | Best For |
|------|-----------------|----------|
| **Free trial** | 14 days, limited models, trial token quota | New users testing the hosted gateway |
| **Paid** | Higher monthly token quota, higher RPM, broader model access | Regular users and teams |

Operators can tune plan token caps, RPM limits, allowed model patterns, and Stripe price IDs from the admin dashboard.

Provider routing still supports the same cost strategy:

| Tier | Provider | Provider Cost | Quota Reset | Best For |
|------|----------|---------------|-------------|----------|
| **TOKEN SAVER** | **RTK (built-in)** | **No upstream cost** | Always on | **Save 20-40% tokens on EVERY request** |
| **SUBSCRIPTION** | Claude Code, Codex, Copilot, Cursor | Provider subscription | 5h, weekly, or monthly | Already subscribed |
| **CHEAP** | GLM-5.1 / GLM-4.7, MiniMax, Kimi | Low provider/API cost | Daily, rolling, or monthly | Budget backup |
| **FREE** | Kiro AI, OpenCode Free, Vertex credits | Provider free tier/credits | Provider-defined | Emergency fallback and low-cost onboarding |

**Pro Tip:** RTK + Kiro AI + OpenCode Free can reduce upstream provider cost while the SaaS layer still enforces user plans, quotas, and billing.

---

### Understanding Costs and Billing

**Hosted SaaS billing:**

- Users upgrade through Stripe Checkout from `/app/plan`  
- Paid users manage subscriptions through Stripe Customer Portal  
- Stripe webhooks sync active, canceled, and past-due subscription status  
- Plan quotas and RPM limits are enforced before provider routing  
- Operators can edit plan limits and model access from `/dashboard/plans`

**Provider cost tracking:**

The dashboard can also show estimated upstream provider costs. Those estimates help users and operators understand savings from RTK, free providers, subscriptions, and fallback rules.

**Example Scenario:**
```
Dashboard Display:
- Total Requests: 1,662
- Total Tokens: 47M
- Estimated Provider Cost: $290

Provider Reality Check:
- Provider: iFlow (FREE unlimited)
- Actual Upstream Provider Payment: $0.00
- What $290 Means: Approximate provider cost avoided by using free models
```

**Payment rules:**
- **SaaS plan**: Paid through your Relay AI deployment's Stripe integration.
- **Subscription providers**: Paid directly to Claude Code, Codex, Copilot, Cursor, and similar services.
- **Cheap providers**: Paid directly to providers such as GLM, MiniMax, Kimi, or OpenRouter.
- **Free providers/credits**: Subject to the provider's current free tier and terms.

---

## Use Cases

### Case 1: "I have Claude Pro subscription"

**Problem:** Quota expires unused, rate limits during heavy coding

**Solution:**
```
Combo: "maximize-claude"
  1. cc/claude-opus-4-7        (use subscription fully)
  2. glm/glm-5.1               (cheap backup when quota out)
  3. kr/claude-sonnet-4.5      (free emergency fallback)

Monthly cost: $20 (subscription) + ~$5 (backup) = $25 total
vs. $20 + hitting limits = frustration
```

### Case 2: "I want zero cost"

**Problem:** Can't afford subscriptions, need reliable AI coding

**Solution:**
```
Combo: "free-forever"
  1. kr/claude-sonnet-4.5      (Claude 4.5 free unlimited)
  2. kr/glm-5                  (GLM-5 free via Kiro)
  3. oc/<auto>                 (OpenCode Free, no auth)

Monthly cost: $0
Quality: Production-ready models + RTK saves 20-40% tokens
```

### Case 3: "I need 24/7 coding, no interruptions"

**Problem:** Deadlines, can't afford downtime

**Solution:**
```
Combo: "always-on"
  1. cc/claude-opus-4-7        (best quality)
  2. cx/gpt-5.5                (second subscription)
  3. glm/glm-5.1               (cheap, resets daily)
  4. minimax/MiniMax-M2.7      (cheapest, 5h reset)
  5. kr/claude-sonnet-4.5      (free unlimited)

Result: 5 layers of fallback = zero downtime
Monthly cost: $20-200 (subscriptions) + $10-20 (backup)
```

### Case 4: "I want FREE AI in OpenClaw"

**Problem:** Need AI assistant in messaging apps (WhatsApp, Telegram, Slack...), completely free

**Solution:**
```
Combo: "openclaw-free"
  1. kr/claude-sonnet-4.5      (Claude 4.5 free)
  2. kr/glm-5                  (GLM-5 free)
  3. kr/MiniMax-M2.5           (MiniMax free)

Monthly cost: $0
Access via: WhatsApp, Telegram, Slack, Discord, iMessage, Signal...
```

---

## Frequently Asked Questions

<details>
<summary><b>Why does my dashboard show high costs?</b></summary>

The dashboard tracks token usage and can display **estimated upstream provider costs**. These estimates are separate from your Relay AI SaaS plan and help show what routing, RTK compression, free providers, or existing subscriptions are saving.

**Example:**
- **Dashboard shows:** "$290 estimated provider cost"
- **Reality:** You're using iFlow (FREE unlimited)
- **Actual upstream provider payment:** **$0.00**
- **What $290 means:** Approximate provider cost avoided by using free models instead of paid APIs

The cost display is an analytics and savings signal. Your SaaS plan status, quota, and Stripe billing are managed separately from `/app/plan`.

</details>

<details>
<summary><b>How does SaaS billing work?</b></summary>

Hosted Relay AI deployments use Stripe for paid plans.

**Users can:**
- Start on the seeded free trial plan
- Upgrade from `/app/plan` through Stripe Checkout
- Manage paid subscriptions through Stripe Customer Portal
- See current plan, subscription status, token usage, and quota

**Operators can:**
- Configure Stripe keys and price IDs
- Edit plan token caps, RPM limits, and allowed models
- Suspend/reactivate users
- View aggregate usage and subscription identifiers

</details>

<details>
<summary><b>Are FREE providers really unlimited?</b></summary>

**Yes!** The current FREE providers (Kiro, OpenCode Free, Vertex) are genuinely free with **no hidden charges**.

These are free services offered by those respective companies:
- **Kiro AI**: Free unlimited Claude 4.5 + GLM-5 + MiniMax via AWS Builder ID / Google / GitHub OAuth
- **OpenCode Free**: No-auth passthrough proxy, models auto-fetched from `opencode.ai/zen/v1/models`
- **Vertex AI**: $300 free credits for new Google Cloud accounts (90 days)

Relay AI routes requests to these providers and makes them easy to use with fallback support. Free provider availability is controlled by each provider, while your hosted Relay AI plan and quota are controlled by the SaaS deployment.

**Discontinued free tiers (no longer recommended):**
- **iFlow**: Was free unlimited, now changed to paid (2026)
- **Qwen Code**: Free OAuth tier discontinued by Alibaba on 2026-04-15
- **Gemini CLI**: Still works, but using it with non-CLI tools (Claude, Codex, Cursor...) may result in account bans - only use if you stick to Gemini CLI itself

</details>

<details>
<summary><b>How do I minimize my actual AI costs?</b></summary>

**Free-First Strategy:**

1. **Start with a free-provider combo when your plan allows it:**
   ```
   1. gc/gemini-3-flash (180K/month free from Google)
   2. if/kimi-k2-thinking (unlimited free from iFlow)
   3. qw/qwen3-coder-plus (unlimited free from Qwen)
   ```
   **Upstream provider cost: often $0/month, subject to provider terms**

2. **Add cheap backup** only if you need it:
   ```
   4. glm/glm-4.7 ($0.6/1M tokens)
   ```
   **Additional cost: Only pay for what you actually use**

3. **Use subscription providers last:**
   - Only if you already have them
   - Relay AI helps maximize their value through quota tracking

**Result:** Many users can minimize upstream provider spend while the SaaS plan still governs account access, monthly quota, and rate limits.

</details>

<details>
<summary><b>What if my usage suddenly spikes?</b></summary>

Relay AI's smart fallback prevents surprise charges:

**Scenario:** You're on a coding sprint and blow through your quotas

**Without Relay AI:**
- Hit rate limit -> Work stops -> Frustration
- Or: Accidentally rack up huge API bills

**With Relay AI:**
- Subscription hits limit -> Auto-fallback to cheap tier
- Cheap tier gets expensive -> Auto-fallback to free tier
- Never stop coding -> Predictable costs

**You're in control:** Set spending limits per provider in dashboard, and Relay AI respects them.

</details>

---

## Setup Guide

<details>
<summary><b>Subscription Providers (Maximize Value)</b></summary>

### Claude Code (Pro/Max)

```bash
Dashboard -> Providers -> Connect Claude Code
-> OAuth login -> Auto token refresh
-> 5-hour + weekly quota tracking

Models:
  cc/claude-opus-4-7
  cc/claude-opus-4-6
  cc/claude-sonnet-4-6
  cc/claude-haiku-4-5-20251001
```

**Pro Tip:** Use Opus for complex tasks, Sonnet for speed. Relay AI tracks quota per model!

### OpenAI Codex (Plus/Pro)

```bash
Dashboard -> Providers -> Connect Codex
-> OAuth login (port 1455)
-> 5-hour + weekly reset

Models:
  cx/gpt-5.5
  cx/gpt-5.4
  cx/gpt-5.3-codex
  cx/gpt-5.2-codex
```

### GitHub Copilot

```bash
Dashboard -> Providers -> Connect GitHub
-> OAuth via GitHub
-> Monthly reset (1st of month)

Models:
  gh/gpt-5.4
  gh/claude-opus-4.7
  gh/claude-sonnet-4.6
  gh/gemini-3.1-pro-preview
  gh/grok-code-fast-1
```

### Cursor IDE

```bash
Dashboard -> Providers -> Connect Cursor
-> OAuth login
-> Monthly subscription

Models:
  cu/claude-4.6-opus-max
  cu/claude-4.5-sonnet-thinking
  cu/gpt-5.3-codex
```

</details>

<details>
<summary><b>Cheap Providers (Backup)</b></summary>

### GLM-5.1 / GLM-4.7 (Daily reset, $0.6/1M)

1. Sign up: [Zhipu AI](https://open.bigmodel.cn/)
2. Get API key from Coding Plan
3. Dashboard -> Add API Key:
   - Provider: `glm`
   - API Key: `your-key`

**Use:** `glm/glm-5.1`, `glm/glm-5`, `glm/glm-4.7`

**Pro Tip:** Coding Plan offers 3x quota at 1/7 cost! Reset daily 10:00 AM.

### MiniMax M2.7 (5h reset, $0.20/1M)

1. Sign up: [MiniMax](https://www.minimax.io/)
2. Get API key
3. Dashboard -> Add API Key

**Use:** `minimax/MiniMax-M2.7`, `minimax/MiniMax-M2.5`

**Pro Tip:** Cheapest option for long context (1M tokens)!

### Kimi K2.5 ($9/month flat)

1. Subscribe: [Moonshot AI](https://platform.moonshot.ai/)
2. Get API key
3. Dashboard -> Add API Key

**Use:** `kimi/kimi-k2.5`, `kimi/kimi-k2.5-thinking`

**Pro Tip:** Fixed $9/month for 10M tokens = $0.90/1M effective cost!

</details>

<details>
<summary><b>FREE Providers (Recommended)</b></summary>

### Kiro AI (Claude 4.5 + GLM-5 + MiniMax FREE)

```bash
Dashboard -> Connect Kiro
-> AWS Builder ID, AWS IAM Identity Center, Google, or GitHub
-> Unlimited usage

Models:
  kr/claude-sonnet-4.5
  kr/claude-haiku-4.5
  kr/glm-5
  kr/MiniMax-M2.5
  kr/qwen3-coder-next
  kr/deepseek-3.2
```

**Pro Tip:** Best free option for Claude. No API key, no payment, fully unlimited.

### OpenCode Free (No auth, auto-fetch models)

```bash
Dashboard -> Connect OpenCode Free
-> No login required (passthrough proxy)
-> Models auto-fetched from opencode.ai/zen/v1/models
```

**Pro Tip:** Fastest setup. Just connect and start coding.

### Vertex AI ($300 free credits for new GCP accounts)

```bash
Dashboard -> Connect Vertex AI
-> Upload Google Cloud Service Account JSON
-> Enable Vertex AI API in your GCP project

Models:
  vertex/gemini-3.1-pro-preview
  vertex/gemini-3-flash-preview
  vertex/gemini-2.5-flash

Vertex Partner (Anthropic / DeepSeek / GLM / Qwen via Vertex):
  vertex-partner/glm-5-maas
  vertex-partner/deepseek-v3.2-maas
  vertex-partner/qwen3-next-80b-a3b-thinking-maas
```

**Pro Tip:** New Google Cloud accounts get $300 credits free for 90 days. Plenty for daily coding.

</details>

<details>
<summary><b>Create Combos</b></summary>

### Example 1: Maximize Subscription -> Cheap Backup

```
Dashboard -> Combos -> Create New

Name: premium-coding
Models:
  1. cc/claude-opus-4-7 (Subscription primary)
  2. glm/glm-5.1 (Cheap backup, $0.6/1M)
  3. minimax/MiniMax-M2.7 (Cheapest fallback, $0.20/1M)

Use in CLI: premium-coding

Monthly cost example (100M tokens):
  80M via Claude (subscription): $0 extra
  15M via GLM: $9
  5M via MiniMax: $1
  Total: $10 + your subscription
```

### Example 2: Free-Only (Zero Cost)

```
Name: free-combo
Models:
  1. kr/claude-sonnet-4.5 (Claude 4.5 free unlimited)
  2. kr/glm-5 (GLM-5 free via Kiro)
  3. vertex/gemini-3.1-pro-preview ($300 free credits)

Cost: $0 forever (+ 20-40% token savings via RTK)!
```

</details>

<details>
<summary><b>CLI Integration</b></summary>

### Cursor IDE

```
Settings -> Models -> Advanced:
  OpenAI API Base URL: http://localhost:20128/v1
  OpenAI API Key: [from Relay AI dashboard]
  Model: cc/claude-opus-4-7
```

Or use combo: `premium-coding`

### Claude Code

Edit `~/.claude/config.json`:

```json
{
  "anthropic_api_base": "http://localhost:20128/v1",
  "anthropic_api_key": "your-relay-ai-api-key"
}
```

### Codex CLI

```bash
export OPENAI_BASE_URL="http://localhost:20128"
export OPENAI_API_KEY="your-relay-ai-api-key"

codex "your prompt"
```

### OpenClaw

**Option 1 - Dashboard (recommended):**

```
Dashboard -> CLI Tools -> OpenClaw -> Select Model -> Apply
```

**Option 2 - Manual:** Edit `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "relay/kr/claude-sonnet-4.5"
      }
    }
  },
  "models": {
    "providers": {
      "relay": {
        "baseUrl": "http://127.0.0.1:20128/v1",
        "apiKey": "sk_relay",
        "api": "openai-completions",
        "models": [
          {
            "id": "kr/claude-sonnet-4.5",
            "name": "Claude Sonnet 4.5 (Kiro Free)"
          }
        ]
      }
    }
  }
}
```

> **Note:** OpenClaw only works with local Relay AI. Use `127.0.0.1` instead of `localhost` to avoid IPv6 resolution issues.

### Cline / Continue / RooCode

```
Provider: OpenAI Compatible
Base URL: http://localhost:20128/v1
API Key: [from dashboard]
Model: cc/claude-opus-4-7
```

</details>

<details>
<summary><b>Deployment and Operations</b></summary>

### Local Development

```bash
git clone https://github.com/thinhnguyendn931911/relay-proxy.git
cd relay-proxy
cp .env.example .env
npm install
PORT=20128 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run dev
```

Local URLs:
- Landing page: `http://localhost:20128`
- User app: `http://localhost:20128/app/keys`
- Operator dashboard: `http://localhost:20128/dashboard`
- OpenAI-compatible API: `http://localhost:20128/v1`

SQLite fallback works for local/private development when `DATABASE_URL` is not set. Hosted SaaS deployments should set `DATABASE_URL` and run Postgres.

### Production SaaS Deployment

Recommended hosted stack:
- **App process:** Next.js/Node on a VPS or container host
- **Database:** Postgres via `DATABASE_URL`
- **Auth:** Clerk publishable/secret keys plus Clerk webhook secret
- **Billing:** Stripe secret key, webhook secret, paid price ID, and customer portal return URL
- **Network:** Caddy/Nginx reverse proxy with HTTPS/TLS
- **Health:** `/api/health`
- **Maintenance:** trial-expiration schedule and nightly `pg_dump` backups stored off-box

```bash
git clone https://github.com/thinhnguyendn931911/relay-proxy.git
cd relay-proxy
cp .env.example .env
npm install
npm run build
PORT=20128 HOSTNAME=0.0.0.0 NODE_ENV=production npm run start
```

First production bootstrap:
1. Configure Clerk, Stripe, Postgres, secure secrets, and public base URLs.
2. Start the app behind HTTPS.
3. Sign up with the first operator account before opening public signup.
4. Confirm `/dashboard/users`, `/dashboard/plans`, `/dashboard/usage`, and `/api/health`.
5. Configure plan limits, provider accounts, and backups.

Process manager example:

```bash
npm install -g pm2
pm2 start npm --name relay-ai -- start
pm2 save
pm2 startup
```

### Docker

Published images (multi-platform `linux/amd64` + `linux/arm64`):
- Docker Hub: [`decolua/relay-proxy`](https://hub.docker.com/r/decolua/relay-proxy)
- GHCR: [`ghcr.io/thinhnguyendn931911/relay-proxy`](https://github.com/thinhnguyendn931911/relay-proxy/pkgs/container/relay-proxy)

**Quick start (use published image):**

```bash
docker run -d \
  --name relay-ai \
  -p 20128:20128 \
  -v "$HOME/.relay-ai:/app/data" \
  -e DATA_DIR=/app/data \
  --env-file .env \
  decolua/relay-proxy:latest
```

-> Open http://localhost:20128

**Build from source (dev):**

```bash
git clone https://github.com/thinhnguyendn931911/relay-proxy.git
cd relay-proxy
docker build -t relay-ai .
docker run -d --name relay-ai -p 20128:20128 \
  -v "$HOME/.relay-ai:/app/data" -e DATA_DIR=/app/data relay-ai
```

**Container defaults:**
- `PORT=20128`
- `HOSTNAME=0.0.0.0`

**Useful commands:**

```bash
docker logs -f relay-ai
docker restart relay-ai
docker stop relay-ai && docker rm relay-ai
docker pull decolua/relay-proxy:latest   # update to latest
```

**Data persistence:** `$HOME/.relay-ai/db/data.sqlite` on host <-> `/app/data/db/data.sqlite` in container.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | Auto-generated (`~/.relay-ai/jwt-secret`) | JWT signing secret for dashboard auth cookie (override to share across instances) |
| `INITIAL_PASSWORD` | `123456` | First login password when no saved hash exists |
| `DATA_DIR` | `~/.relay-ai` | Main app data location (SQLite at `$DATA_DIR/db/data.sqlite`) |
| `PORT` | framework default | Service port (`20128` in examples) |
| `HOSTNAME` | framework default | Bind host (Docker defaults to `0.0.0.0`) |
| `NODE_ENV` | runtime default | Set `production` for deploy |
| `DATABASE_URL` | empty | Postgres connection string for hosted SaaS and multi-tenant mode |
| `BASE_URL` | `http://localhost:20128` | Server-side internal base URL used by cloud sync jobs |
| `CLOUD_URL` | production URL | Server-side cloud sync endpoint base URL |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Backward-compatible/public base URL (prefer `BASE_URL` for server runtime) |
| `NEXT_PUBLIC_CLOUD_URL` | production URL | Backward-compatible/public cloud URL (prefer `CLOUD_URL` for server runtime) |
| `NEXT_PUBLIC_APP_NAME` | `Relay AI` | Public app name used by SaaS landing/app UI |
| `NEXT_PUBLIC_ENDPOINT_BASE_URL` | `http://localhost:20128/v1` | Public endpoint shown to users for client configuration |
| `API_KEY_SECRET` | `endpoint-proxy-api-key-secret` | HMAC secret for generated API keys |
| `MACHINE_ID_SALT` | `endpoint-proxy-salt` | Salt for stable machine ID hashing |
| `ENABLE_REQUEST_LOGS` | `false` | Enables request/response logs under `logs/` |
| `OBSERVABILITY_ENABLED` | `true` in `.env.example` | Enables app observability hooks where supported |
| `AUTH_COOKIE_SECURE` | `false` | Force `Secure` auth cookie (set `true` behind HTTPS reverse proxy) |
| `REQUIRE_API_KEY` | `false` | Legacy/private-install toggle; SaaS `/v1/*` requests require valid user keys when SaaS mode is enabled |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | empty | Clerk browser publishable key |
| `CLERK_SECRET_KEY` | empty | Clerk server secret key |
| `CLERK_WEBHOOK_SECRET` | empty | Clerk webhook signing secret for user sync |
| `STRIPE_SECRET_KEY` | empty | Stripe server secret key |
| `STRIPE_WEBHOOK_SECRET` | empty | Stripe webhook signing secret |
| `STRIPE_PAID_PRICE_ID` | empty | Stripe price ID used for the paid plan when no DB plan price is set |
| `STRIPE_CUSTOMER_PORTAL_RETURN_URL` | `http://localhost:20128/app/plan` | Return URL after Stripe Customer Portal |
| `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY` | empty | Optional outbound proxy for upstream provider calls |

Notes:
- Lowercase proxy variables are also supported: `http_proxy`, `https_proxy`, `all_proxy`, `no_proxy`.
- `.env` is not baked into Docker image (`.dockerignore`); inject runtime config with `--env-file` or `-e`.
- On Windows, `APPDATA` can be used for local storage path resolution.
- `INSTANCE_NAME` appears in older docs/env templates, but is currently not used at runtime.
- Set `AUTH_COOKIE_SECURE=true` when serving behind HTTPS.
- Keep `JWT_SECRET`, `API_KEY_SECRET`, Clerk secrets, Stripe secrets, and database credentials out of source control.

### Runtime Files and Storage

- Main app state: `${DATA_DIR}/db/data.sqlite` (SQLite - providers, combos, aliases, keys, settings, usage history)
- Auto backups: `${DATA_DIR}/db/backups/`
- Optional request/translator logs: `<repo>/logs/...` when `ENABLE_REQUEST_LOGS=true`
- Both `${DATA_DIR}` and `~/.relay-ai` resolve to the same location in a Docker container - the symlink `/root/.relay-ai -> /app/data` is created at build time.
- Hosted SaaS deployments store multi-tenant data in Postgres. Use scheduled `pg_dump` backups and keep copies off-box.

</details>

---

## Available Models

<details>
<summary><b>View all available models</b></summary>

**Claude Code (`cc/`)** - Pro/Max:
- `cc/claude-opus-4-7`
- `cc/claude-opus-4-6`
- `cc/claude-sonnet-4-6`
- `cc/claude-sonnet-4-5-20250929`
- `cc/claude-haiku-4-5-20251001`

**Codex (`cx/`)** - Plus/Pro:
- `cx/gpt-5.5`
- `cx/gpt-5.4`
- `cx/gpt-5.3-codex`
- `cx/gpt-5.2-codex`
- `cx/gpt-5.1-codex-max`

**GitHub Copilot (`gh/`)**:
- `gh/gpt-5.4`
- `gh/claude-opus-4.7`
- `gh/claude-sonnet-4.6`
- `gh/gemini-3.1-pro-preview`
- `gh/grok-code-fast-1`

**Cursor (`cu/`)** - Subscription:
- `cu/claude-4.6-opus-max`
- `cu/claude-4.5-sonnet-thinking`
- `cu/gpt-5.3-codex`
- `cu/kimi-k2.5`

**GLM (`glm/`)** - $0.6/1M:
- `glm/glm-5.1`
- `glm/glm-5`
- `glm/glm-4.7`

**MiniMax (`minimax/`)** - $0.2/1M:
- `minimax/MiniMax-M2.7`
- `minimax/MiniMax-M2.5`

**Kimi (`kimi/`)** - $9/mo flat:
- `kimi/kimi-k2.5`
- `kimi/kimi-k2.5-thinking`

**Kiro (`kr/`)** - FREE unlimited:
- `kr/claude-sonnet-4.5`
- `kr/claude-haiku-4.5`
- `kr/glm-5`
- `kr/MiniMax-M2.5`
- `kr/qwen3-coder-next`
- `kr/deepseek-3.2`

**OpenCode Free (`oc/`)** - FREE no-auth:
- Auto-fetched from `opencode.ai/zen/v1/models`

**Vertex AI (`vertex/`)** - $300 free credits:
- `vertex/gemini-3.1-pro-preview`
- `vertex/gemini-3-flash-preview`
- `vertex/gemini-2.5-flash`
- `vertex-partner/glm-5-maas`
- `vertex-partner/deepseek-v3.2-maas`

</details>

---

## Troubleshooting

**"Language model did not provide messages"**
- Provider quota exhausted -> Check dashboard quota tracker
- Solution: Use combo fallback or switch to cheaper tier

**Rate limiting**
- Subscription quota out -> Fallback to GLM/MiniMax
- Add combo: `cc/claude-opus-4-7 -> glm/glm-5.1 -> kr/claude-sonnet-4.5`

**OAuth token expired**
- Auto-refreshed by Relay AI
- If issues persist: Dashboard -> Provider -> Reconnect

**High costs**
- Enable RTK in Dashboard -> Endpoint settings (default ON, saves 20-40% tokens)
- Check usage stats in Dashboard
- Switch primary model to GLM/MiniMax
- Use free tier (Kiro, OpenCode Free, Vertex) for non-critical tasks

**Dashboard opens on wrong port**
- Set `PORT=20128` and `NEXT_PUBLIC_BASE_URL=http://localhost:20128`

**First login not working**
- Hosted SaaS: verify Clerk keys and sign-in/sign-up routes
- Local/private mode: check `INITIAL_PASSWORD` in `.env`; if unset, fallback password is `123456`

**No request logs under `logs/`**
- Set `ENABLE_REQUEST_LOGS=true`

---

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Next.js 16
- **UI**: React 19 + Tailwind CSS 4
- **Database**: Postgres for hosted SaaS, SQLite fallback for local/private mode
- **Streaming**: Server-Sent Events (SSE)
- **Auth**: Clerk for SaaS users/operators, provider OAuth 2.0 (PKCE), JWT/private-mode auth, and API keys
- **Billing**: Stripe Checkout, webhooks, and Customer Portal

---

## API Reference

### Chat Completions

```bash
POST http://localhost:20128/v1/chat/completions
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "model": "cc/claude-opus-4-6",
  "messages": [
    {"role": "user", "content": "Write a function to..."}
  ],
  "stream": true
}
```

### List Models

```bash
GET http://localhost:20128/v1/models
Authorization: Bearer your-api-key

-> Returns all models + combos in OpenAI format
```

## Support

- **GitHub**: [github.com/thinhnguyendn931911/relay-proxy](https://github.com/thinhnguyendn931911/relay-proxy)
- **Issues**: [github.com/thinhnguyendn931911/relay-proxy/issues](https://github.com/thinhnguyendn931911/relay-proxy/issues)

---

## Contributors

Thanks to all contributors who helped make Relay AI better!

[![Contributors](https://contrib.rocks/image?repo=thinhnguyendn931911/relay-proxy&max=150&columns=15&anon=1)](https://github.com/thinhnguyendn931911/relay-proxy/graphs/contributors)

---

## Star Chart

[![Star Chart](https://starchart.cc/thinhnguyendn931911/relay-proxy.svg?variant=adaptive)](https://starchart.cc/thinhnguyendn931911/relay-proxy)

---

## Acknowledgments

Built on the shoulders of giants:

- **[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)** - original Go implementation that inspired this JavaScript port.
- **[RTK](https://github.com/rtk-ai/rtk)** ![Stars](https://img.shields.io/github/stars/rtk-ai/rtk?style=flat&color=yellow) - Rust token-saver. Relay AI ports its compression pipeline to JS, saving **20-40% input tokens** on every request.
- **[Caveman](https://github.com/JuliusBrussee/caveman)** ![Stars](https://img.shields.io/github/stars/JuliusBrussee/caveman?style=flat&color=yellow) by **[@JuliusBrussee](https://github.com/JuliusBrussee)** - viral *"why use many token when few token do trick"*. Relay AI adapts its prompt, saving **up to 65% output tokens**.

Huge thanks to these authors - without their work, Relay AI's token-saving features wouldn't exist.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with love for developers who code 24/7</sub>
</div>
