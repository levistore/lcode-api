"use client";

import { useEffect, useState } from "react";
import { FileText, Shield, User, Clock, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/admin/logs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
      })
      .catch(() => {
        toast.error("Failed to load audit logs");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">System Audit Trail</h1>
          <p className="text-xs text-text-secondary">Chronological ledger of administrative adjustments, ban listings, and credential allocations.</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Retrieving logs audit ledger...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-xs text-text-secondary">No administrative actions logged in ledger yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-5">System Action</th>
                  <th className="py-3.5 px-5">Action details</th>
                  <th className="py-3.5 px-5">Client IP</th>
                  <th className="py-3.5 px-5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {logs.map((log) => {
                  // Style actions with custom tags
                  const getActionBadgeColor = (action: string) => {
                    if (action.includes("BAN")) return "bg-error/15 text-error border border-error/20";
                    if (action.includes("CREATE")) return "bg-success/10 text-success border border-success/20";
                    if (action.includes("DELETE")) return "bg-error/15 text-error border border-error/20";
                    if (action.includes("UPDATE")) return "bg-accent/15 text-accent border border-accent/20";
                    return "bg-bg-primary text-text-secondary border border-border";
                  };

                  return (
                    <tr key={log.id} className="hover:bg-bg-tertiary/10 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-bg-primary border border-border flex items-center justify-center text-text-secondary">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-text-primary block leading-none mb-0.5">{log.adminName}</span>
                            <span className="text-[10px] text-text-tertiary font-mono">{log.adminEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary leading-normal max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3.5 px-5 text-text-tertiary font-mono flex items-center gap-1.5 mt-2.5">
                        <Globe className="w-3.5 h-3.5 text-text-tertiary shrink-0" /> {log.ip}
                      </td>
                      <td className="py-3.5 px-5 text-right text-text-tertiary font-mono text-[10px]">
                        <span className="flex items-center justify-end gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
