"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Relay AI";
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT_BASE_URL || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:20128"}/v1`;
const USER_START_PATH = "/app/keys";
const USER_PLAN_PATH = "/app/plan";

const planTiers = [
  {
    name: "Free trial",
    price: "$0",
    note: "14 days",
    description: "Test the endpoint in real workflows before you upgrade.",
    limits: ["50,000 monthly tokens", "10 requests per minute", "All model patterns available"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Paid",
    price: "$10",
    note: "per month",
    description: "The plan for steady production use through one reliable endpoint.",
    limits: ["2,500,000 monthly tokens", "60 requests per minute", "Usage history and API keys"],
    cta: "Choose paid",
    featured: true,
  },
];

const proofPoints = [
  { value: "1", label: "endpoint to configure" },
  { value: "2.5M", label: "tokens on paid" },
  { value: "60", label: "RPM on paid" },
];

const features = [
  {
    icon: "content_paste",
    title: "Paste one URL",
    text: "Use the same OpenAI-compatible base URL anywhere you already send AI requests.",
  },
  {
    icon: "key",
    title: "Add one API key",
    text: "Create a key from your account, put it in your app, and you are ready to call the endpoint.",
  },
  {
    icon: "trending_up",
    title: "Upgrade when usage grows",
    text: "Start on the free trial, then move to Paid for more tokens and a higher request limit.",
  },
];

function useHomepageSmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.add("homepage-smooth-scroll");

    return () => {
      document.documentElement.classList.remove("homepage-smooth-scroll");
    };
  }, []);
}

function MotionReveal({ as: Component = "div", children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={`home-motion-reveal ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ "--motion-delay": `${delay}ms` }}
    >
      {children}
    </Component>
  );
}

function motionDelay(delay) {
  return { "--motion-delay": `${delay}ms` };
}

function Header() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="home-motion-lift flex items-center gap-3 text-left"
          aria-label="Homepage"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-emerald-300">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </span>
          <span className="text-lg font-black tracking-tight text-zinc-950">{appName}</span>
        </button>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-zinc-600 md:flex">
          <a className="home-motion-lift inline-flex min-h-8 items-center transition-colors hover:text-zinc-950" href="#endpoint">Endpoint</a>
          <a className="home-motion-lift inline-flex min-h-8 items-center transition-colors hover:text-zinc-950" href="#plans">Plans</a>
          <a className="home-motion-lift inline-flex min-h-8 items-center transition-colors hover:text-zinc-950" href="#features">Features</a>
        </nav>

        {isLoaded && isSignedIn ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(USER_START_PATH)}
              className="home-motion-lift inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              API keys
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="home-motion-lift inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => router.push("/sign-up")}
              className="home-motion-lift inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function EndpointPanel() {
  return (
    <section id="endpoint" className="homepage-anchor px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <MotionReveal>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">The product</p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-5xl">No setup maze. One endpoint does the job.</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-600">
            Customers copy the base URL, add their API key, and send requests. Their plan tier simply decides how much they can use.
          </p>
        </MotionReveal>

        <MotionReveal delay={120} className="home-motion-lift rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-[0_24px_70px_rgba(24,24,27,0.18)]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-yellow-300" />
            <span className="size-3 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-xs text-zinc-500">endpoint</span>
          </div>
          <div className="space-y-5 pt-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Base URL</p>
              <p className="mt-2 break-all font-mono text-sm text-emerald-300">{endpoint}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-3xl font-black">{point.value}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{point.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-white p-4 text-zinc-950">
              <p className="text-sm font-black">Simple from first request to upgrade</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Trial users test the same endpoint they will keep using after upgrading.
              </p>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

function Plans() {
  const router = useRouter();

  return (
    <section id="plans" className="homepage-anchor bg-zinc-950 px-5 py-20 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <MotionReveal className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Plan tiers</p>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">Start free. Upgrade without changing anything.</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-400">
            The endpoint stays the same across every tier. Customers only choose how much monthly usage they need.
          </p>
        </MotionReveal>

        <div className="grid gap-5 md:grid-cols-2">
          {planTiers.map((plan, index) => (
            <MotionReveal
              as="article"
              key={plan.name}
              delay={index * 120}
              className={`home-motion-lift rounded-lg border p-6 ${plan.featured ? "border-emerald-300 bg-emerald-300 text-zinc-950" : "border-white/10 bg-white/[0.04]"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className={`mt-2 text-sm leading-6 ${plan.featured ? "text-zinc-700" : "text-zinc-400"}`}>{plan.description}</p>
                </div>
                {plan.featured && (
                  <span className="rounded-md bg-zinc-950 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                    Best value
                  </span>
                )}
              </div>

              <div className="mt-7 flex items-end gap-2">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className={`pb-2 text-sm font-semibold ${plan.featured ? "text-zinc-700" : "text-zinc-400"}`}>{plan.note}</span>
              </div>

              <ul className="mt-7 grid gap-3">
                {plan.limits.map((limit) => (
                  <li key={limit} className="flex gap-3 text-sm font-semibold">
                    <span className={`material-symbols-outlined text-[19px] ${plan.featured ? "text-zinc-950" : "text-emerald-300"}`}>check_circle</span>
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => router.push(plan.featured ? USER_PLAN_PATH : USER_START_PATH)}
                className={`home-motion-lift mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg px-5 font-black transition ${plan.featured ? "bg-zinc-950 text-white hover:bg-zinc-800" : "bg-white text-zinc-950 hover:bg-zinc-200"
                  }`}
              >
                {plan.cta}
              </button>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  useHomepageSmoothScroll();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-zinc-950">
      <Header />

      <section className="relative px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-36">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,transparent,rgba(251,250,247,1)_88%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="home-motion-enter mb-7 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800" style={motionDelay(40)}>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Copy one endpoint. Start in minutes.
            </div>

            <h1 className="home-motion-enter max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl" style={motionDelay(120)}>
              The easiest way to use an AI endpoint.
            </h1>
            <p className="home-motion-enter mt-6 max-w-2xl text-lg leading-8 text-zinc-700 md:text-xl" style={motionDelay(200)}>
              Copy one OpenAI-compatible URL, add one API key, and send requests. Start on the free trial, then upgrade when you need more tokens.
            </p>

            <div className="home-motion-enter mt-8 flex flex-col gap-3 sm:flex-row" style={motionDelay(280)}>
              <button
                type="button"
                onClick={() => router.push(USER_START_PATH)}
                className="home-motion-lift inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-6 text-base font-black text-white transition hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                Get API key
              </button>
              <button
                type="button"
                onClick={() => router.push(USER_PLAN_PATH)}
                className="home-motion-lift inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 text-base font-bold text-zinc-950 transition hover:bg-zinc-100"
              >
                <span className="material-symbols-outlined text-[20px]">payments</span>
                See plans
              </button>
            </div>
          </div>

          <div className="home-motion-enter home-motion-lift rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_24px_70px_rgba(24,24,27,0.14)]" style={motionDelay(220)}>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500">Customer setup</p>
            <div className="mt-5 rounded-lg bg-zinc-950 p-4 font-mono text-sm text-white">
              <p><span className="text-emerald-300">BASE_URL=</span>{endpoint}</p>
              <p className="mt-3"><span className="text-emerald-300">API_KEY=</span>sk_live_customer_key</p>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="font-black">Three steps</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Copy the endpoint, add your key, make the request.</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-black text-emerald-950">Paid tier gets the spotlight</p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">$10/mo, 2.5M monthly tokens, and 60 RPM.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EndpointPanel />

      <Plans />

      <section id="features" className="homepage-anchor px-5 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <MotionReveal className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">How easy is it?</p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">If you can change a base URL, you can use it.</h2>
          </MotionReveal>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <MotionReveal
                as="article"
                key={feature.title}
                delay={index * 100}
                className="home-motion-lift rounded-lg border border-zinc-200 bg-white p-5"
              >
                <span className="mb-5 flex size-11 items-center justify-center rounded-lg bg-zinc-950 text-white">
                  <span className="material-symbols-outlined text-[23px]">{feature.icon}</span>
                </span>
                <h3 className="text-lg font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.text}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8">
        <MotionReveal className="home-motion-lift mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-lg bg-zinc-950 p-6 text-white md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">Ready to try the endpoint?</h2>
            <p className="mt-2 max-w-2xl text-zinc-400">Open your API keys page, create a key, and make your first request in a few minutes.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(USER_START_PATH)}
            className="home-motion-lift inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-emerald-300 px-6 font-black text-zinc-950 transition hover:bg-emerald-200"
          >
            Get API key
          </button>
        </MotionReveal>
      </section>

      <footer className="border-t border-zinc-200 px-5 py-8 text-sm text-zinc-500 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <p>One endpoint. One key. Simple plan tiers.</p>
          <div className="flex gap-5">
            <a className="home-motion-lift inline-flex min-h-8 items-center hover:text-zinc-950" href="#endpoint">Endpoint</a>
            <a className="home-motion-lift inline-flex min-h-8 items-center hover:text-zinc-950" href="#plans">Plans</a>
            <a className="home-motion-lift inline-flex min-h-8 items-center hover:text-zinc-950" href="#features">Features</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
