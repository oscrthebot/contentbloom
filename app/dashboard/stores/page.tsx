import { cookies } from "next/headers";
import { getConvexClient } from "../../../lib/convex";
import { api } from "../../../convex/_generated/api";
import { StoresClient } from "./StoresClient";

export default async function StoresPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")?.value;

  if (!sessionToken) {
    return <p style={{ padding: 32, color: "#6b7280" }}>Not authenticated.</p>;
  }

  const convex = getConvexClient();
  const [stores, user] = await Promise.all([
    convex.query(api.stores.getStoresByUser, { sessionToken }),
    convex.query(api.auth.validateSession, { sessionToken }),
  ]);

  // Plan base prices (EUR) — update when Stripe prices are confirmed
  const planPrices: Record<string, number> = {
    trial: 0,
    starter: 49,
    growth: 99,
    scale: 199,
  };

  const shopifySettings = {
    shopifyDomain: user?.shopifyDomain ?? "",
    shopifyAutoPublish: user?.shopifyAutoPublish ?? false,
    isConnected: !!(user?.shopifyDomain && user?.shopifyAccessToken),
  };

  return (
    <StoresClient
      stores={stores}
      planPrices={planPrices}
      shopifySettings={shopifySettings}
    />
  );
}
