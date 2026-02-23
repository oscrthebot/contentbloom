"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrendingUp, FileText, Eye, MousePointerClick, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const weeklyStats = useQuery(api.preview.getWeeklyStats);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Content"
          value="24"
          change="+12%"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Page Views"
          value="12.5K"
          change="+23%"
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="Click Rate"
          value="3.2%"
          change="+0.8%"
          icon={<MousePointerClick className="w-5 h-5" />}
        />
        <StatCard
          title="Revenue Impact"
          value="$2,450"
          change="+18%"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Content */}
        <div className="lg:col-span-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
          <div className="space-y-4">
            <ContentRow
              title="10 Best Running Shoes for 2026"
              status="published"
              views="1.2K"
              date="2 days ago"
            />
            <ContentRow
              title="How to Choose the Perfect Yoga Mat"
              status="published"
              views="890"
              date="3 days ago"
            />
            <ContentRow
              title="Top 5 Protein Powders for Muscle Gain"
              status="scheduled"
              views="-"
              date="Scheduled for tomorrow"
            />
          </div>
        </div>

        {/* Email Captures Widget */}
        <EmailCapturesWidget weeklyStats={weeklyStats} />
      </div>
    </div>
  );
}

function EmailCapturesWidget({
  weeklyStats,
}: {
  weeklyStats:
    | {
        totalThisWeek: number;
        uniqueEmailsThisWeek: number;
        topArticleThisWeek: { slug: string; title: string; count: number } | null;
      }
    | undefined;
}) {
  const loading = weeklyStats === undefined;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Email Captures
          </h2>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-black/30 px-2 py-1 rounded-full">
          This week
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-9 w-20 bg-white/60 dark:bg-black/30 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-white/60 dark:bg-black/30 rounded animate-pulse" />
          <div className="h-12 bg-white/60 dark:bg-black/30 rounded-lg animate-pulse" />
        </div>
      ) : (
        <>
          <div className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-1">
            {weeklyStats.totalThisWeek}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {weeklyStats.uniqueEmailsThisWeek}
            </span>{" "}
            unique email{weeklyStats.uniqueEmailsThisWeek !== 1 ? "s" : ""} captured
          </p>

          {weeklyStats.topArticleThisWeek ? (
            <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                🏆 Top article this week
              </p>
              <Link
                href={`/p/${weeklyStats.topArticleThisWeek.slug}`}
                target="_blank"
                className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
              >
                {weeklyStats.topArticleThisWeek.title}
              </Link>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                {weeklyStats.topArticleThisWeek.count} unlock
                {weeklyStats.topArticleThisWeek.count !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-black/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                No unlocks this week yet
              </p>
            </div>
          )}

          <Link
            href="/dashboard/email-analytics"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            View Full Analytics
            <ArrowRight size={14} />
          </Link>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </div>
    </div>
  );
}

function ContentRow({
  title,
  status,
  views,
  date,
}: {
  title: string;
  status: string;
  views: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-900 last:border-0">
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">{views} views</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "published"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
