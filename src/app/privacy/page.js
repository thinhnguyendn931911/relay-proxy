import Link from "next/link";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Relay AI";

export const metadata = {
  title: `Privacy Policy - ${appName}`,
  description: `Privacy policy for ${appName}. Learn how we collect, use, and protect your data.`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-5 py-16 md:px-8" style={{ background: "var(--color-bg, #FDFAF6)" }}>
      <article className="prose prose-zinc mx-auto max-w-3xl" style={{ color: "var(--color-text, #0a0a0a)" }}>
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm font-semibold no-underline transition hover:opacity-70"
          style={{ color: "var(--color-text-muted, #6B7280)" }}
        >
          &larr; Back to home
        </Link>

        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Privacy Policy</h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted, #6B7280)" }}>
          Last updated: May 20, 2026
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          When you create an account through our authentication provider (Clerk), we collect your email address
          and basic profile information. When you use our API, we collect usage data including request counts,
          token consumption, and the AI models accessed. We do not store the content of your API requests or responses.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the {appName} service</li>
          <li>To manage your account and subscription</li>
          <li>To enforce usage limits and plan quotas</li>
          <li>To process payments through Stripe</li>
          <li>To communicate service updates and respond to support requests</li>
        </ul>

        <h2>3. Payment Processing</h2>
        <p>
          Payments are processed by Stripe. We do not store your credit card information on our servers.
          Stripe&apos;s privacy policy governs the handling of your payment data. We store only your Stripe
          customer ID and subscription ID to manage your billing.
        </p>

        <h2>4. API Keys</h2>
        <p>
          API keys you create are stored as cryptographic hashes. The plaintext key is shown only once at
          creation and is never stored or retrievable after that point.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          Account data is retained while your account is active. Usage statistics are retained for billing
          and analytics purposes. You may request deletion of your account and associated data by contacting us.
        </p>

        <h2>6. Third-Party Services</h2>
        <p>We use the following third-party services that may process your data:</p>
        <ul>
          <li><strong>Clerk</strong> — authentication and user management</li>
          <li><strong>Stripe</strong> — payment processing and subscription management</li>
          <li><strong>Upstream AI providers</strong> — your API requests are forwarded to the AI providers you access through our service</li>
        </ul>

        <h2>7. Data Security</h2>
        <p>
          We implement industry-standard security measures including HTTPS encryption, hashed API key storage,
          and secure session management. However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your usage data</li>
          <li>Withdraw consent for data processing</li>
        </ul>

        <h2>9. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management. These are necessary for the
          service to function and cannot be disabled.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any material changes
          by posting the new policy on this page and updating the &quot;Last updated&quot; date.
        </p>

        <h2>11. Contact</h2>
        <p>
          If you have questions about this privacy policy or your personal data, please contact us through
          the support channels available in your account dashboard.
        </p>
      </article>
    </div>
  );
}
