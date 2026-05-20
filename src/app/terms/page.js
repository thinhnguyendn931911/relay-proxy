import Link from "next/link";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Relay AI";

export const metadata = {
  title: `Terms of Service - ${appName}`,
  description: `Terms of service for ${appName}. Review the terms governing your use of our AI API gateway.`,
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Terms of Service</h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted, #6B7280)" }}>
          Last updated: May 20, 2026
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using {appName}, you agree to be bound by these Terms of Service. If you do not
          agree to these terms, do not use the service.
        </p>

        <h2>2. Service Description</h2>
        <p>
          {appName} provides an OpenAI-compatible API gateway that routes requests to various AI model
          providers. The service includes API key management, usage tracking, and subscription-based access
          to AI models.
        </p>

        <h2>3. Account Registration</h2>
        <p>
          You must create an account to use {appName}. You are responsible for maintaining the confidentiality
          of your account credentials and API keys. You are responsible for all activity that occurs under
          your account.
        </p>

        <h2>4. API Keys</h2>
        <p>
          API keys are personal credentials tied to your account. You must not share your API keys with
          unauthorized parties. You are responsible for any usage incurred through your API keys. Report
          compromised keys immediately by revoking them in your dashboard.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for any unlawful purpose</li>
          <li>Attempt to circumvent usage limits, rate limits, or access controls</li>
          <li>Reverse-engineer, decompile, or disassemble any part of the service</li>
          <li>Resell or redistribute access to the service without authorization</li>
          <li>Interfere with or disrupt the service or its infrastructure</li>
          <li>Use the service to generate content that violates the upstream AI providers&apos; usage policies</li>
        </ul>

        <h2>6. Subscription and Billing</h2>
        <ul>
          <li>Free trial accounts are limited to the trial period and token allowance specified in the plan.</li>
          <li>Paid subscriptions are billed monthly through Stripe.</li>
          <li>Usage exceeding your plan&apos;s monthly token cap will result in requests being rejected until the next billing period.</li>
          <li>You may cancel your subscription at any time through the billing portal. Access continues until the end of the current billing period.</li>
          <li>Refunds are not provided for partial months of service.</li>
        </ul>

        <h2>7. Service Availability</h2>
        <p>
          We strive to maintain high availability but do not guarantee uninterrupted service. The service
          depends on third-party AI providers whose availability is outside our control. We are not liable
          for downtime caused by upstream provider outages.
        </p>

        <h2>8. Data and Content</h2>
        <p>
          We act as a pass-through for your API requests. We do not store the content of requests or
          responses. We collect usage metadata (token counts, model names, timestamps) for billing and
          analytics as described in our Privacy Policy.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {appName} and its operators shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or any loss of profits or
          revenue, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
          intangible losses resulting from your use of the service.
        </p>

        <h2>10. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you violate these terms, engage in
          abusive behavior, or fail to pay for your subscription. You may terminate your account at any time
          by canceling your subscription and contacting support.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We may modify these terms at any time. We will provide notice of material changes by posting the
          updated terms on this page. Continued use of the service after changes constitutes acceptance of
          the new terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable law, without regard
          to conflict of law principles.
        </p>

        <h2>13. Contact</h2>
        <p>
          If you have questions about these terms, please contact us through the support channels available
          in your account dashboard.
        </p>
      </article>
    </div>
  );
}
