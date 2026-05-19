import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getActiveSubscriptionForUser } from "@/lib/saas/subscriptionRepo.js";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getActiveSubscriptionForUser(userId);
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const returnUrl = process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL || ""}/app/plan`;

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: session.url });
}
