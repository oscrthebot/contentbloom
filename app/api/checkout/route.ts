import { NextRequest, NextResponse } from "next/server";

// TODO: Stripe credentials needed:
// STRIPE_SECRET_KEY=sk_live_...
// PRICE_ID_STARTER=price_...
// PRICE_ID_GROWTH=price_...
// PRICE_ID_SCALE=price_...

export async function POST(req: NextRequest) {
  const { plan } = await req.json();
  const sessionToken = req.cookies.get("cb_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured yet", plan },
      { status: 503 }
    );
  }

  // TODO: When Stripe is configured:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const priceMap: Record<string, string> = {
  //   starter: process.env.PRICE_ID_STARTER!,
  //   growth: process.env.PRICE_ID_GROWTH!,
  //   scale: process.env.PRICE_ID_SCALE!,
  // };
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   line_items: [{ price: priceMap[plan], quantity: 1 }],
  //   success_url: "https://bloomcontent.site/dashboard?payment=success",
  //   cancel_url: "https://bloomcontent.site/pricing",
  //   customer_email: user.email,
  //   metadata: { userId: user._id, plan },
  // });
  // return NextResponse.json({ url: session.url });

  return NextResponse.json({ error: "Stripe not configured yet" }, { status: 503 });
}
