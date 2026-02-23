"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // positive = up, negative = down, undefined = no trend
  icon: ReactNode;
  loading?: boolean;
}

export function StatCard({ title, value, subtitle, trend, icon, loading }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend !== undefined ? (
            <div className={`flex items-center gap-1 text-sm ${
              trend > 0
                ? "text-green-600 dark:text-green-400"
                : trend < 0
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            }`}>
              {trend > 0 ? (
                <TrendingUp size={14} />
              ) : trend < 0 ? (
                <TrendingDown size={14} />
              ) : (
                <Minus size={14} />
              )}
              <span>
                {trend > 0 ? "+" : ""}
                {trend}% vs last period
              </span>
            </div>
          ) : subtitle ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
          ) : null}
        </>
      )}
    </div>
  );
}
