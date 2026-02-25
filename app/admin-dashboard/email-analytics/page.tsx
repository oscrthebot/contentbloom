"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import { Mail, Users, BookOpen, TrendingUp, Search, Calendar, X } from "lucide-react";
import Link from "next/link";
import { StatCard } from "../../../components/analytics/StatCard";
import { LineChart } from "../../../components/analytics/LineChart";
import { BarChart } from "../../../components/analytics/BarChart";
import { DataTable } from "../../../components/analytics/DataTable";
import type { Column } from "../../../components/analytics/DataTable";
import { ExportButton } from "../../../components/analytics/ExportButton";

// --- Date helpers ---
function startOfDayUTC(daysAgo: number): number {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.getTime();
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Fill in missing days in the last N days
function fillDays(data: { date: string; count: number }[], days = 30) {
  const filled: { date: string; count: number }[] = [];
  const map = new Map(data.map((d) => [d.date, d.count]));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split("T")[0];
    filled.push({ date: key, count: map.get(key) ?? 0 });
  }
  return filled;
}

// --- Types ---
interface UnlockRow {
  _id: string;
  slug: string;
  title: string;
  email: string;
  unlockedAt: number;
  [key: string]: unknown;
}

export default function EmailAnalyticsPage() {
  const [search, setSearch] = useState("");
  const [tablePage, setTablePage] = useState(0);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  // Convex queries
  const stats = useQuery(api.preview.getUnlockStats, {});
  const prevStats = useQuery(api.preview.getUnlockStats, {
    startDate: startOfDayUTC(60),
    endDate: startOfDayUTC(30),
  });
  const recentUnlocks = useQuery(api.preview.listAllUnlocks, {
    page: tablePage,
    pageSize: 25,
    search: search.trim() || undefined,
  });
  const exportData = useQuery(api.preview.exportUnlocks, {
    startDate: exportStartDate ? new Date(exportStartDate).getTime() : undefined,
    endDate: exportEndDate ? new Date(exportEndDate + "T23:59:59").getTime() : undefined,
  });

  const loading = stats === undefined;

  // Trend calculations (vs previous 30-day period)
  const unlockTrend = useMemo(() => {
    if (!stats || !prevStats) return undefined;
    if (prevStats.totalUnlocks === 0) return stats.totalUnlocks > 0 ? 100 : 0;
    return Math.round(((stats.totalUnlocks - prevStats.totalUnlocks) / prevStats.totalUnlocks) * 100);
  }, [stats, prevStats]);

  const emailTrend = useMemo(() => {
    if (!stats || !prevStats) return undefined;
    if (prevStats.uniqueEmails === 0) return stats.uniqueEmails > 0 ? 100 : 0;
    return Math.round(((stats.uniqueEmails - prevStats.uniqueEmails) / prevStats.uniqueEmails) * 100);
  }, [stats, prevStats]);

  // Fill last 30 days
  const chartData = useMemo(
    () => fillDays(stats?.unlocksByDay ?? [], 30),
    [stats?.unlocksByDay]
  );

  // Top articles bar chart
  const barData = useMemo(
    () =>
      (stats?.topArticles ?? []).map((a) => ({
        label: a.title.length > 20 ? a.title.slice(0, 19) + "…" : a.title,
        value: a.unlockCount,
        sublabel: a.slug,
      })),
    [stats?.topArticles]
  );

  // Domain bar chart
  const domainData = useMemo(
    () =>
      (stats?.unlocksByDomain ?? []).map((d) => ({
        label: d.domain,
        value: d.count,
      })),
    [stats?.unlocksByDomain]
  );

  // Table columns
  const columns: Column<UnlockRow>[] = [
    {
      key: "title",
      label: "Article",
      sortable: true,
      render: (row) => (
        <div>
          <Link
            href={`/p/${row.slug}`}
            target="_blank"
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {row.title}
          </Link>
          <div className="text-xs text-gray-400 dark:text-gray-600 font-mono">{row.slug}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{row.email}</span>
      ),
    },
    {
      key: "unlockedAt",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.unlockedAt)}
        </span>
      ),
    },
  ];

  // Table data from paged results
  const tableData: UnlockRow[] = useMemo(
    () => (recentUnlocks?.items ?? []) as UnlockRow[],
    [recentUnlocks]
  );

  // Export function
  function getExportData() {
    if (!exportData) return [];
    return exportData as Array<{
      slug: string;
      title: string;
      email: string;
      unlockedAt: string;
    }>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track who unlocked articles with their email address
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Unlocks"
          value={stats?.totalUnlocks ?? 0}
          trend={unlockTrend}
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Unique Emails"
          value={stats?.uniqueEmails ?? 0}
          trend={emailTrend}
          icon={<Mail className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Articles with Unlocks"
          value={stats?.totalArticlesWithUnlocks ?? 0}
          subtitle="articles generating leads"
          icon={<BookOpen className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Avg. Unlocks / Article"
          value={
            stats?.totalArticlesWithUnlocks
              ? (stats.totalUnlocks / stats.totalArticlesWithUnlocks).toFixed(1)
              : "0"
          }
          subtitle="email captures per article"
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="mb-8">
        <LineChart
          data={chartData}
          title="📈 Unlocks Over Time (Last 30 Days)"
          loading={loading}
          height={200}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          data={barData}
          title="🏆 Top Articles by Unlock Count"
          loading={loading}
          height={240}
          color="#6366f1"
        />
        <BarChart
          data={domainData}
          title="📧 Unlocks by Email Domain"
          loading={loading}
          height={240}
          color="#8b5cf6"
        />
      </div>

      {/* Recent Unlocks Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl mb-8">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Unlocks
              {recentUnlocks && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({recentUnlocks.total.toLocaleString()} total)
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setTablePage(0);
                  }}
                  placeholder="Search email or slug…"
                  className="pl-8 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={tableData}
          pageSize={25}
          loading={recentUnlocks === undefined}
          emptyMessage={
            search
              ? `No results for "${search}"`
              : "No unlocks recorded yet"
          }
        />
        {/* Pagination controls for server-side paging */}
        {recentUnlocks && recentUnlocks.total > 25 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-b-xl">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {tablePage * 25 + 1}–
              {Math.min((tablePage + 1) * 25, recentUnlocks.total)} of{" "}
              {recentUnlocks.total.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                disabled={tablePage === 0}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              >
                ← Prev
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Page {tablePage + 1} of {Math.ceil(recentUnlocks.total / 25)}
              </span>
              <button
                onClick={() =>
                  setTablePage((p) =>
                    Math.min(Math.ceil(recentUnlocks.total / 25) - 1, p + 1)
                  )
                }
                disabled={tablePage >= Math.ceil(recentUnlocks.total / 25) - 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Export Data
        </h2>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <Calendar size={11} className="inline mr-1" />
              From
            </label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <Calendar size={11} className="inline mr-1" />
              To
            </label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <ExportButton
              format="csv"
              getData={getExportData}
              filename={`email-unlocks-${new Date().toISOString().split("T")[0]}`}
              disabled={exportData === undefined}
            />
            <ExportButton
              format="json"
              getData={getExportData}
              filename={`email-unlocks-${new Date().toISOString().split("T")[0]}`}
              disabled={exportData === undefined}
            />
          </div>
          {(exportStartDate || exportEndDate) && (
            <button
              onClick={() => {
                setExportStartDate("");
                setExportEndDate("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
        {exportData !== undefined && (
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
            {exportData.length.toLocaleString()} record{exportData.length !== 1 ? "s" : ""} ready to export
            {(exportStartDate || exportEndDate) && " (filtered)"}
          </p>
        )}
      </div>
    </div>
  );
}
