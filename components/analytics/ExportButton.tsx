"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportRecord {
  slug: string;
  title: string;
  email: string;
  unlockedAt: string;
  [key: string]: string;
}

interface ExportButtonProps {
  format: "csv" | "json";
  getData: () => Promise<ExportRecord[]> | ExportRecord[];
  filename?: string;
  disabled?: boolean;
  className?: string;
}

function toCSV(records: ExportRecord[]): string {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const rows = records.map((r) =>
    headers
      .map((h) => {
        const val = String(r[h] ?? "");
        // Escape commas and quotes
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function ExportButton({
  format,
  getData,
  filename = `unlocks-export-${new Date().toISOString().split("T")[0]}`,
  disabled,
  className = "",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const data = await getData();
      if (!data || data.length === 0) {
        setError("No data to export");
        return;
      }

      let content: string;
      let mimeType: string;
      let ext: string;

      if (format === "csv") {
        content = toCSV(data);
        mimeType = "text/csv";
        ext = "csv";
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        ext = "json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleExport}
        disabled={disabled || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
          format === "csv"
            ? "border-green-300 text-green-700 dark:text-green-400 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
            : "border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
        } ${className}`}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Export {format.toUpperCase()}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
