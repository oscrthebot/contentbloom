import { NextRequest, NextResponse } from "next/server";

// TODO: STRIPE_SECRET_KEY needed for Customer Portal

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("cb_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured yet" }, { status: 503 });
  }

  // TODO: When Stripe is configured:
  // const convex = getConvexClient();
  // const user = await convex.query(api.users.getBySession, { sessionToken });
  // if (!user?.stripeCustomerId) return NextResponse.json({ error: "No billing account" }, { status: 400 });
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const portal = await stripe.billingPortal.sessions.create({
  //   customer: user.stripeCustomerId,
  //   return_url: "https://bloomcontent.site/dashboard/plan",
  // });
  // return NextResponse.json({ url: portal.url });

  return NextResponse.json({ error: "Stripe not configured yet" }, { status: 503 });
}
