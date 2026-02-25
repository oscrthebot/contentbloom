import { cookies } from "next/headers";
import { getConvexClient } from "../../../lib/convex";
import { api } from "../../../convex/_generated/api";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")!.value;

  const convex = getConvexClient();
  const user = await convex.query(api.auth.validateSession, { sessionToken });

  if (!user) return null;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Profile</h1>
      <ProfileForm user={{
        email: user.email,
        name: user.name || "",
        storeName: user.storeName || "",
        storeUrl: user.storeUrl || "",
        niche: user.niche || "",
        plan: user.plan,
      }} />
    </div>
  );
}
