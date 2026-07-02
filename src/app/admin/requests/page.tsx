"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface RequestLog {
  id: string;
  user: string;
  email: string | null;
  endpoint: string;
  method: string;
  ip: string;
  requestTime: string;
  statusCode: number;
  responseTime: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RequestLogs() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // success, error, or empty
  const [page, setPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchLogs = (pageNumber = 1) => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(pageNumber),
      limit: "20",
    });
    if (search) query.append("search", search);
    if (statusFilter) query.append("status", statusFilter);

    fetch(`/api/admin/requests?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setPagination(data.pagination || null);
        setPage(pageNumber);
      })
      .catch(() => {
        toast.error("Failed to load request logs");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleExport = async (format: "csv" | "json") => {
    setExportLoading(true);
    try {
      const query = new URLSearchParams({ exportAll: "true" });
      if (search) query.append("search", search);
      if (statusFilter) query.append("status", statusFilter);

      const res = await fetch(`/api/admin/requests?${query.toString()}`);
      const data = await res.json();
      const exportLogs = data.logs || [];

      if (exportLogs.length === 0) {
        toast.error("No logs available to export");
        return;
      }

      if (format === "json") {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(exportLogs, null, 2)
        )}`;
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `lcode_request_logs_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("JSON file downloaded");
      } else {
        // Convert to CSV
        const headers = ["ID", "User", "Email", "Method", "Endpoint", "IP Address", "Status Code", "Latency (ms)", "Timestamp"];
        const rows = exportLogs.map((log: any) => [
          log.id,
          log.user,
          log.email || "Anonymous",
          log.method,
          log.endpoint,
          log.ip,
          log.statusCode,
          log.responseTime,
          log.requestTime,
        ]);

        const csvContent = [headers.join(","), ...rows.map((r: any) => r.map((val: any) => `"${val}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", url);
        downloadAnchor.setAttribute("download", `lcode_request_logs_${Date.now()}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("CSV file downloaded");
      }
    } catch {
      toast.error("Failed to export logs");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Request Logs</h1>
          <p className="text-xs text-text-secondary">Inspect API routing traffic, response status codes, and latency in real time.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleExport("json")}
            disabled={exportLoading || loading}
            className="border border-border hover:bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-text-tertiary" /> Export JSON
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={exportLoading || loading}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-secondary p-4 rounded-2xl border border-border">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by endpoint, user name, or client IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-24 py-1.8 text-xs bg-bg-primary border border-border rounded-xl focus:border-accent focus:outline-none placeholder:text-text-tertiary"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white text-[10px] font-semibold px-3 py-1 rounded-lg transition-colors"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          {[
            { id: "", label: "All Requests" },
            { id: "success", label: "Success (2xx)" },
            { id: "error", label: "Errors (4xx / 5xx)" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                statusFilter === opt.id
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "border-border bg-bg-primary text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Retrieving logs database...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <Activity className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-xs text-text-secondary">No traffic matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">Method/Path</th>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">IP Address</th>
                  <th className="py-3.5 px-5">Response Time</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                          log.method === "POST"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-success/15 text-success border border-success/20"
                        }`}>
                          {log.method}
                        </span>
                        <span className="font-mono text-text-primary text-[11px] truncate max-w-[240px]" title={log.endpoint}>
                          {log.endpoint}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="text-text-primary block leading-none mb-0.5">{log.user}</span>
                        {log.email && <span className="text-[10px] text-text-tertiary font-mono">{log.email}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono">{log.ip}</td>
                    <td className="py-3.5 px-5">
                      <span className={`font-mono ${log.responseTime > 1000 ? "text-amber-400 font-semibold" : "text-text-secondary"}`}>
                        {log.responseTime.toLocaleString()} ms
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        log.statusCode >= 400
                          ? "bg-error/15 text-error border border-error/20"
                          : "bg-success/10 text-success border border-success/20"
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-text-tertiary font-mono text-[10px]">
                      {new Date(log.requestTime).toLocaleDateString()} {new Date(log.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border bg-bg-secondary/40 flex items-center justify-between gap-4 text-xs">
            <span className="text-text-secondary">
              Showing page <strong className="text-text-primary">{pagination.page}</strong> of <strong className="text-text-primary">{pagination.totalPages}</strong> ({pagination.total.toLocaleString()} total entries)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || loading}
                className="p-1.5 border border-border rounded-lg bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-50 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= pagination.totalPages || loading}
                className="p-1.5 border border-border rounded-lg bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-50 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
