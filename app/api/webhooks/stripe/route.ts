import { NextRequest, NextResponse } from "next/server";

// TODO: Configure webhook in Stripe Dashboard → Developers → Webhooks
// Endpoint: https://bloomcontent.site/api/webhooks/stripe
// Events: checkout.session.completed, customer.subscription.created,
//         customer.subscription.updated, customer.subscription.deleted,
//         invoice.payment_succeeded, invoice.payment_failed
// STRIPE_WEBHOOK_SECRET=whsec_...

export async function POST(req: NextRequest) {
  // TODO: When Stripe is configured:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const sig = req.headers.get("stripe-signature")!;
  // const body = await req.text();
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  //
  // switch (event.type) {
  //   case "checkout.session.completed": {
  //     const session = event.data.object;
  //     const { userId, plan } = session.metadata;
  //     // Update user in Convex with stripe customer ID, subscription, plan
  //     break;
  //   }
  //   case "customer.subscription.updated": {
  //     // Update subscription status in Convex
  //     break;
  //   }
  //   case "customer.subscription.deleted": {
  //     // Set plan to "cancelled" in Convex
  //     break;
  //   }
  //   case "invoice.payment_failed": {
  //     // Set subscriptionStatus to "past_due" in Convex
  //     break;
  //   }
  // }

  return NextResponse.json({ received: true });
}
