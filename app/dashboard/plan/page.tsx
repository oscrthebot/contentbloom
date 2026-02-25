import { cookies } from "next/headers";
import { getConvexClient } from "../../../lib/convex";
import { api } from "../../../convex/_generated/api";
import { PlanView } from "./PlanView";

export default async function PlanPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")!.value;

  const convex = getConvexClient();
  const user = await convex.query(api.auth.validateSession, { sessionToken });

  if (!user) return null;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Plan & Billing</h1>
      <PlanView currentPlan={user.plan} subscriptionStatus={user.subscriptionStatus} />
    </div>
  );
}
