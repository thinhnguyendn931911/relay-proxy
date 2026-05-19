import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  upgradeToPaid,
  syncSubscriptionPeriod,
  markCanceled,
  markPastDue,
} from "@/lib/saas/subscriptionRepo.js";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;
      if (userId && session.subscription) {
        await upgradeToPaid(userId, session.subscription, session.customer);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const status = sub.status === "active" ? "active" : sub.status === "trialing" ? "trialing" : sub.status;
      await syncSubscriptionPeriod(
        sub.id,
        status,
        new Date(sub.current_period_start * 1000).toISOString(),
        new Date(sub.current_period_end * 1000).toISOString()
      );
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await markCanceled(sub.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await markPastDue(invoice.subscription);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
