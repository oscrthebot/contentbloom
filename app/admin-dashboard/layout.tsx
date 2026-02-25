"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { 
  LayoutDashboard, 
  FileText, 
  Store, 
  BarChart3, 
  Settings,
  LogOut,
  Mail,
} from "lucide-react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function SidebarContent() {
  const pathname = usePathname();
  const weeklyStats = useQuery(api.preview.getWeeklyStats);

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/content", label: "Content", icon: FileText },
    { href: "/dashboard/store", label: "Store", icon: Store },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/email-analytics", label: "Email Analytics", icon: Mail, badge: weeklyStats?.totalThisWeek },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BloomContent
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition w-full">
          <LogOut size={20} />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProvider client={convex}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          {children}
        </main>
      </div>
    </ConvexProvider>
  );
}
