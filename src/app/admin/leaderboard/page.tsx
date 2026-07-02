"use client";

import { useEffect, useState } from "react";
import { Award, Zap, Users, ShieldCheck, Filter, Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

interface RankedApi {
  id: string;
  name: string;
  route: string;
  method: string;
  category: string;
  requestCount: number;
  uniqueUsers: number;
  successRate: number;
}

export default function LeaderboardManagement() {
  const [leaderboard, setLeaderboard] = useState<RankedApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); // today, week, month, all

  const fetchLeaderboard = () => {
    setLoading(true);
    fetch(`/api/admin/leaderboard?filter=${timeFilter}`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
      })
      .catch(() => {
        toast.error("Failed to load leaderboard");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">API Leaderboard</h1>
          <p className="text-xs text-text-secondary">Analyze high-performance routes ranked by traffic request load and user interactions.</p>
        </div>

        <div className="flex items-center gap-1 border border-border bg-bg-secondary p-0.5 rounded-xl self-start sm:self-auto">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "all", label: "All Time" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTimeFilter(opt.id)}
              className={`text-[10px] font-semibold px-3 py-1.8 rounded-lg transition-colors ${
                timeFilter === opt.id
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ranking Grid */}
      {loading ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-secondary">Analyzing api metrics...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Award className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-xs text-text-secondary">No endpoint telemetry data recorded in this period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {leaderboard.slice(0, 3).map((api, index) => {
              const placementColors = [
                "from-amber-500/10 to-amber-500/0 border-amber-500/30 text-amber-400",
                "from-slate-400/10 to-slate-400/0 border-slate-400/30 text-slate-300",
                "from-amber-800/10 to-amber-800/0 border-amber-800/30 text-amber-700",
              ];
              const badgeLabels = ["1st Place", "2nd Place", "3rd Place"];

              return (
                <div
                  key={api.id}
                  className={`bg-gradient-to-b ${placementColors[index]} bg-bg-secondary border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[180px] hover:-translate-y-0.5 transition-transform duration-300`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-bold tracking-widest font-mono uppercase bg-bg-primary/60 border border-border px-2 py-0.5 rounded">
                        {badgeLabels[index]}
                      </span>
                      <Award className="w-5 h-5" />
                    </div>

                    <h3 className="text-sm font-bold text-text-primary truncate">{api.name}</h3>
                    <code className="text-[10px] text-text-tertiary block font-mono mt-0.5 truncate">{api.route}</code>
                  </div>

                  <div className="border-t border-border/40 pt-3 mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-text-secondary">
                    <div>
                      <span className="text-text-tertiary block text-[8px] uppercase">Requests</span>
                      <strong className="text-text-primary text-xs font-mono">{api.requestCount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-text-tertiary block text-[8px] uppercase">Users</span>
                      <strong className="text-text-primary text-xs font-mono">{api.uniqueUsers.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-text-tertiary block text-[8px] uppercase">Success</span>
                      <strong className="text-success text-xs font-mono">{api.successRate}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table List for remaining */}
          <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                    <th className="py-3.5 px-5 text-center w-14">Rank</th>
                    <th className="py-3.5 px-5">API Endpoint</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Hits Count</th>
                    <th className="py-3.5 px-5">Active Consumers</th>
                    <th className="py-3.5 px-5 text-right">Health Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs font-medium">
                  {leaderboard.map((api, index) => (
                    <tr key={api.id} className="hover:bg-bg-tertiary/10 transition-colors">
                      <td className="py-3.5 px-5 text-center font-bold text-text-secondary font-mono">
                        #{index + 1}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            api.method === "POST" ? "bg-blue-500/10 text-blue-400" : "bg-success/10 text-success"
                          }`}>{api.method}</span>
                          <div>
                            <span className="font-semibold text-text-primary block">{api.name}</span>
                            <span className="text-[10px] text-text-tertiary font-mono">{api.route}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary">
                        {api.category}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-text-primary font-semibold">
                        {api.requestCount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-text-secondary font-mono">
                        {api.uniqueUsers.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-success font-semibold">
                        <span className={`px-2 py-0.5 rounded ${api.successRate >= 95 ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-400"}`}>
                          {api.successRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
