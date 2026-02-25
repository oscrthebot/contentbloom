import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getConvexClient } from "../../lib/convex";
import { api } from "../../convex/_generated/api";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("cb_session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const convex = getConvexClient();
  const user = await convex.query(api.auth.validateSession, { sessionToken });

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell user={{ name: user.name, email: user.email, plan: user.plan }}>
      {children}
    </DashboardShell>
  );
}
