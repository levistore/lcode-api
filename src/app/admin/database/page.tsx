"use client";

import { useState } from "react";
import { Database, Table, RefreshCw, Layers, CircleDot, Play, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DbTable {
  name: string;
  rows: number;
  size: string;
}

export default function DatabaseManagement() {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<DbTable[]>([
    { name: "users", rows: 142, size: "2.4 MB" },
    { name: "api_endpoints", rows: 12, size: "180 KB" },
    { name: "api_requests", rows: 84320, size: "48.6 MB" },
    { name: "api_keys", rows: 184, size: "320 KB" },
    { name: "subscriptions", rows: 42, size: "120 KB" },
    { name: "payments", rows: 96, size: "240 KB" },
    { name: "settings", rows: 1, size: "12 KB" },
  ]);

  const handleVacuum = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Database VACUUM FULL completed! Disk pages defragmented.");
    }, 1200);
  };

  const handlePruneLogs = () => {
    if (!confirm("Are you sure you want to prune older request logs? This deletes API request logs older than 30 days to save database storage.")) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Pruned 12,410 old API request log entries!");
    }, 1000);
  };

  const handleSyncSchema = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Prisma schema definitions synchronized with the active DB cluster!");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Database Console</h1>
        <p className="text-xs text-text-secondary">Prune historical traffic logs, vacuum tables indexes, check rows allocation, and sync Prisma structures.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Total Database Size</span>
            <Database className="w-4.5 h-4.5 text-accent" />
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">52.1 MB</h3>
          <span className="text-[10px] text-text-tertiary block mt-1">PostgreSQL 15 cluster</span>
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Active Tables</span>
            <Table className="w-4.5 h-4.5 text-accent" />
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">7 Tables</h3>
          <span className="text-[10px] text-text-tertiary block mt-1">Managed via Prisma Schema</span>
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Connection Pool</span>
            <CircleDot className="w-4.5 h-4.5 text-accent animate-pulse" />
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">12 / 20</h3>
          <span className="text-[10px] text-success block mt-1 font-semibold">Healthy connections</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tables list */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-accent" /> Tables Storage Details
          </h3>

          <div className="bg-bg-primary/30 border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-border bg-bg-primary/60 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                  <th className="py-2.5 px-4">Table Name</th>
                  <th className="py-2.5 px-4">Row Count</th>
                  <th className="py-2.5 px-4 text-right">Data Footprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tables.map((t) => (
                  <tr key={t.name} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-text-primary">
                      {t.name}
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-mono">
                      {t.rows.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-secondary">
                      {t.size}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database actions */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">Maintenance Operations</h3>

          <div className="space-y-3.5">
            <button
              onClick={handleVacuum}
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-accent/25"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Defragment (VACUUM FULL)
            </button>

            <button
              onClick={handlePruneLogs}
              disabled={loading}
              className="w-full py-3 border border-border hover:bg-bg-tertiary disabled:opacity-50 text-text-primary text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Prune Old Request Logs
            </button>

            <button
              onClick={handleSyncSchema}
              disabled={loading}
              className="w-full py-3 border border-border hover:bg-bg-tertiary disabled:opacity-50 text-text-primary text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Prisma Push Schema Sync
            </button>
          </div>

          <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-500/90 leading-relaxed font-semibold">
              Caution: VACUUM operations lock table records temporarily, which might queue active API hits. Perform database tasks during maintenance hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
