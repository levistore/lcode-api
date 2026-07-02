"use client";

import { useState } from "react";
import { Save, Plus, Trash2, Calendar, FileDown, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BackupFile {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  tableCount: number;
  type: string; // SQL, JSON
}

export default function BackupsManagement() {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([
    { id: "bak_1", filename: "lcode_db_snapshot_2026_06_25.sql", size: "14.2 MB", createdAt: new Date(Date.now() - 86400000).toISOString(), tableCount: 7, type: "SQL" },
    { id: "bak_2", filename: "lcode_db_snapshot_2026_06_20.sql", size: "14.1 MB", createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), tableCount: 7, type: "SQL" },
    { id: "bak_3", filename: "lcode_db_users_dump_2026_06_18.json", size: "84 KB", createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), tableCount: 1, type: "JSON" },
    { id: "bak_4", filename: "lcode_db_snapshot_2026_06_15.sql", size: "13.9 MB", createdAt: new Date(Date.now() - 86400000 * 11).toISOString(), tableCount: 7, type: "SQL" },
  ]);

  const handleCreateBackup = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0].replace(/-/g, "_");
      const newBackup: BackupFile = {
        id: "bak_" + Date.now(),
        filename: `lcode_db_snapshot_${dateStr}.sql`,
        size: "14.3 MB",
        createdAt: now.toISOString(),
        tableCount: 7,
        type: "SQL"
      };
      setBackups((prev) => [newBackup, ...prev]);
      setLoading(false);
      toast.success("New PostgreSQL backup snapshot compiled and saved to storage!");
    }, 1500);
  };

  const handleRestore = (filename: string) => {
    if (!confirm(`Warning: Restoring the database from "${filename}" replaces all current records. Ensure users are notified of downtime before confirming restoration.`)) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Database restored successfully from snapshot file!");
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this backup file from local storage?")) return;
    setBackups((prev) => prev.filter((bak) => bak.id !== id));
    toast.success("Backup file removed");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Database Backups</h1>
          <p className="text-xs text-text-secondary">Generate instant raw SQL system dumps, download JSON metadata archives, and restore historical states.</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(234,88,12,0.15)] flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Compile SQL Backup
        </button>
      </div>

      {/* Main Backups List */}
      <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
        {backups.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Save className="w-10 h-10 text-text-tertiary mx-auto" />
            <p className="text-xs text-text-secondary">No backup files stored in workspace directories.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">Snapshot Filename</th>
                  <th className="py-3.5 px-5">Creation Time</th>
                  <th className="py-3.5 px-5">Size</th>
                  <th className="py-3.5 px-5">Details</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {backups.map((bak) => (
                  <tr key={bak.id} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="font-semibold text-text-primary block leading-none mb-1 font-mono">{bak.filename}</span>
                        <span className="text-[10px] text-text-tertiary font-mono">Format: {bak.type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono">
                      {new Date(bak.createdAt).toLocaleDateString()} {new Date(bak.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5 text-text-primary font-bold font-mono">
                      {bak.size}
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary">
                      Includes {bak.tableCount} DB tables
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRestore(bak.filename)}
                          disabled={loading}
                          className="bg-bg-primary hover:bg-bg-tertiary border border-border text-text-primary text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          title="Restore Database"
                        >
                          <RotateCcw className="w-3 h-3 text-text-tertiary" /> Restore
                        </button>
                        <button
                          onClick={() => {
                            toast.success(`Download started: ${bak.filename}`);
                          }}
                          className="p-1.5 text-text-secondary border border-border rounded-lg hover:text-accent hover:bg-bg-tertiary transition-colors"
                          title="Download Snapshot"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bak.id)}
                          className="p-1.5 text-text-secondary border border-border rounded-lg hover:text-error hover:bg-bg-tertiary transition-colors"
                          title="Delete Backup File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
