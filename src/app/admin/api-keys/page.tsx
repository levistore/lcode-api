"use client";

import { useEffect, useState } from "react";
import {
  Key,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Clock,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface ApiKeyRecord {
  id: string;
  key: string;
  owner: string;
  email: string;
  userId: string;
  status: string; // ACTIVE, SUSPENDED, REVOKED
  createdAt: string;
  lastUsed: string | null;
}

export default function ApiKeysManagement() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKeys = () => {
    setLoading(true);
    fetch("/api/admin/api-keys")
      .then((res) => res.json())
      .then((data) => {
        setKeys(data.apiKeys || []);
      })
      .catch(() => {
        toast.error("Failed to load active API keys register");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAction = async (keyId: string, action: string) => {
    if (!confirm(`Are you sure you want to perform: ${action.toUpperCase()} on this API key?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `Key successfully modified: ${action}`);
        fetchKeys();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">API Key Tokens</h1>
        <p className="text-xs text-text-secondary">Inspect client API tokens allocated to developers, check last activity, and revoke access keys.</p>
      </div>

      {/* Main Table */}
      <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Retrieving key registers...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-20 text-center">
            <Key className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-xs text-text-secondary">No API keys registered in logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">API Key Value</th>
                  <th className="py-3.5 px-5">Developer Owner</th>
                  <th className="py-3.5 px-5">Created Date</th>
                  <th className="py-3.5 px-5">Last Activity</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {keys.map((keyRecord) => (
                  <tr key={keyRecord.id} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3.5 px-5">
                      <code className="text-[11px] font-mono bg-bg-primary border border-border px-2.5 py-1 rounded text-text-primary block max-w-[200px] truncate select-all">
                        {keyRecord.key}
                      </code>
                    </td>
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="text-text-primary block leading-none mb-0.5">{keyRecord.owner}</span>
                        <span className="text-[10px] text-text-tertiary font-mono">{keyRecord.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary">
                      {new Date(keyRecord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono">
                      {keyRecord.lastUsed ? (
                        new Date(keyRecord.lastUsed).toLocaleDateString() + " " + new Date(keyRecord.lastUsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-text-tertiary italic">Never</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-semibold tracking-wide font-mono px-2 py-0.5 rounded ${
                        keyRecord.status === "ACTIVE"
                          ? "bg-success/10 text-success"
                          : keyRecord.status === "SUSPENDED"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-error/15 text-error"
                      }`}>
                        {keyRecord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {keyRecord.status === "ACTIVE" && (
                          <button
                            onClick={() => handleAction(keyRecord.id, "suspend")}
                            disabled={actionLoading}
                            className="border border-border text-text-secondary hover:text-amber-500 rounded-lg p-1.5 hover:bg-bg-tertiary transition-colors"
                            title="Suspend Key"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {keyRecord.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleAction(keyRecord.id, "activate")}
                            disabled={actionLoading}
                            className="border border-success/30 text-success bg-success/5 hover:bg-success/15 rounded-lg p-1.5 transition-colors"
                            title="Unsuspend/Activate Key"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {keyRecord.status !== "REVOKED" && (
                          <>
                            <button
                              onClick={() => handleAction(keyRecord.id, "revoke")}
                              disabled={actionLoading}
                              className="border border-border text-text-secondary hover:text-error rounded-lg p-1.5 hover:bg-bg-tertiary transition-colors"
                              title="Revoke Key"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAction(keyRecord.id, "regenerate")}
                              disabled={actionLoading}
                              className="bg-accent text-white hover:bg-accent-hover rounded-lg p-1.5 transition-colors"
                              title="Force Regenerate Key (Revokes Active Key)"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {keyRecord.status === "REVOKED" && (
                          <span className="text-[10px] text-text-tertiary italic">Revoked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
