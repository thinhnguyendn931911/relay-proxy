import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdapter } from "@/lib/db/driver.js";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const db = await getAdapter();
    const plan = await db.get(`SELECT * FROM saas_plans WHERE slug = 'paid' AND is_active = true`);
    if (!plan) return NextResponse.json({ error: "No paid plan available" }, { status: 404 });

    const priceId = plan.stripe_price_id || process.env.STRIPE_PAID_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "Stripe price not configured" }, { status: 503 });

    const returnUrl = process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL || ""}/app/plan`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      success_url: `${returnUrl}?checkout=success`,
      cancel_url: `${returnUrl}?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout-session]", err.message);
    return NextResponse.json({ error: "Payment service error" }, { status: 500 });
  }
}
