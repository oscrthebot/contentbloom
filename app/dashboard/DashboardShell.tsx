"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, User, CreditCard, LogOut, Store } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Articles", icon: FileText },
  { href: "/dashboard/stores", label: "My Stores", icon: Store },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/plan", label: "Plan & Billing", icon: CreditCard },
];

export function DashboardShell({
  user,
  children,
}: {
  user: { name?: string; email: string; plan: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const planColors: Record<string, string> = {
    trial: "#f59e0b",
    starter: "#16a34a",
    growth: "#2563eb",
    scale: "#7c3aed",
    cancelled: "#9ca3af",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Sidebar */}
      <aside style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100%",
        width: 240,
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ padding: "24px 20px 16px" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>ContentBloom</span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "0 12px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isArticlesActive = item.href === "/dashboard" && (pathname === "/dashboard" || pathname.startsWith("/dashboard/articles"));
            const active = isActive || isArticlesActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 2,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#111827" : "#6b7280",
                  background: active ? "#f3f4f6" : "transparent",
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{user.name || user.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "1px 8px",
                borderRadius: 4,
                background: (planColors[user.plan] || "#9ca3af") + "18",
                color: planColors[user.plan] || "#9ca3af",
                textTransform: "capitalize",
              }}>
                {user.plan}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              width: "100%",
              border: "none",
              background: "transparent",
              fontSize: 14,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, padding: 32 }}>
        {children}
      </main>
    </div>
  );
}
