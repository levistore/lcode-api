"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Cpu, Laptop, ShieldCheck } from "lucide-react";

interface PopularEndpoint {
  name: string;
  count: number;
  percent: number;
  method: string;
}

interface DeviceItem {
  name: string;
  count: string;
  percent: number;
  color: string;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => console.error("Analytics fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const popularEndpoints: PopularEndpoint[] = data?.charts?.popularEndpoints || [];
  const deviceData: DeviceItem[] = data?.charts?.deviceData || [];

  const desktopPct = data?.charts?.deviceData?.[0]?.percent || 0;
  const browserPct = data?.charts?.deviceData?.[1]?.percent || 0;
  const mobilePct = data?.charts?.deviceData?.[2]?.percent || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-text-secondary">
        <span className="animate-pulse">Loading analytics reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Analytics Reports</h1>
          <p className="text-xs text-text-secondary">Analyze traffic aggregates, transaction velocities, and client integration distributions.</p>
        </div>

        <div className="flex border border-border bg-bg-secondary p-0.5 rounded-xl self-start sm:self-auto">
          {[
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "90d", label: "90 Days" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTimeRange(opt.id)}
              className={`text-[10px] font-semibold px-3 py-1.8 rounded-lg transition-colors ${
                timeRange === opt.id
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Usage Chart */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-accent" /> API Request Load (Weekly)
            </h3>
            <span className="text-[10px] text-text-secondary font-mono">{(data?.stats?.totalRequests || 0).toLocaleString()} total hits</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2.5 pt-4 px-1 border-b border-l border-border">
            {(data?.charts?.dailyRequests || []).map((val: any, idx: number) => {
              const maxCount = Math.max(...(data?.charts?.dailyRequests?.map((r: any) => r.count) || [1]));
              const heightPct = maxCount > 0 ? (val.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-tertiary px-1.5 py-0.5 rounded font-mono text-[9px] border border-border text-text-primary mb-1">
                    {val.count.toLocaleString()} hits
                  </span>
                  <div
                    style={{ height: `${Math.max(5, heightPct)}%` }}
                    className="w-full bg-accent/20 border-t-2 border-accent rounded-t hover:bg-accent/35 transition-colors"
                  />
                  <span className="text-[8px] text-text-tertiary mt-2 font-mono">{val.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" /> User Growth Rate (Weekly)
            </h3>
            <span className="text-[10px] text-text-secondary font-mono">+{data?.stats?.totalUsers || 0} users total</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2.5 pt-4 px-1 border-b border-l border-border">
            {(data?.charts?.dailyNewUsers || []).map((val: any, idx: number) => {
              const maxUsers = Math.max(...(data?.charts?.dailyNewUsers?.map((u: any) => u.count) || [1]));
              const heightPct = maxUsers > 0 ? (val.count / maxUsers) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-tertiary px-1.5 py-0.5 rounded font-mono text-[9px] border border-border text-text-primary mb-1">
                    {val.count} users
                  </span>
                  <div
                    style={{ height: `${Math.max(5, heightPct)}%` }}
                    className="w-full bg-blue-500/10 border-t-2 border-blue-500 rounded-t hover:bg-blue-500/25 transition-colors"
                  />
                  <span className="text-[8px] text-text-tertiary mt-2 font-mono">{val.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Growth Chart */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent" /> Revenue Velocity
            </h3>
            <span className="text-[10px] text-text-secondary font-mono">${data?.stats?.revenue?.toLocaleString()} total</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2.5 pt-4 px-1 border-b border-l border-border">
            {(data?.charts?.dailyRevenue || []).map((val: any, idx: number) => {
              const maxRev = Math.max(...(data?.charts?.dailyRevenue?.map((r: any) => r.amount) || [1]));
              const heightPct = maxRev > 0 ? (val.amount / maxRev) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <span className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-tertiary px-1.5 py-0.5 rounded font-mono text-[9px] border border-border text-text-primary mb-1">
                    ${val.amount.toLocaleString()}
                  </span>
                  <div
                    style={{ height: `${Math.max(5, heightPct)}%` }}
                    className="w-full bg-success/15 border-t-2 border-success rounded-t hover:bg-success/30 transition-colors"
                  />
                  <span className="text-[8px] text-text-tertiary mt-2 font-mono">{val.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Analytics Panel */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-accent" /> Client Device Distributions
            </h3>
          </div>

          {/* Donut Chart representation */}
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2 text-xs">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Desktop Clients */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EA580C" strokeWidth="4" strokeDasharray={`${desktopPct} ${100 - desktopPct}`} strokeDashoffset="0" />
                {/* Web Browsers */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${browserPct} ${100 - browserPct}`} strokeDashoffset={`-${desktopPct}`} />
                {/* Mobile Applications */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray={`${mobilePct} ${100 - mobilePct}`} strokeDashoffset={`-${desktopPct + browserPct}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">
                Clients
              </div>
            </div>

            <div className="flex-1 space-y-3.5 w-full">
              {deviceData.map((d, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${d.color} shrink-0`} />
                    <span className="text-text-secondary leading-none">{d.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-text-primary block leading-none mb-0.5">{d.percent}%</span>
                    <span className="text-[9px] text-text-tertiary font-mono">{d.count} reqs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Endpoint Popularity Ratio */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-accent" /> Endpoint Popularity Ratios
          </h3>

          <div className="space-y-3.5">
            {popularEndpoints.map((ep, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-bold font-mono px-1 py-0.2 rounded ${
                      ep.method === "POST" ? "bg-blue-500/10 text-blue-400" : "bg-success/10 text-success"
                    }`}>{ep.method}</span>
                    <span className="font-mono text-text-primary text-[11px]">{ep.name}</span>
                  </div>
                  <span className="font-mono font-medium">{ep.count.toLocaleString()} calls ({ep.percent}%)</span>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden border border-border">
                  <div
                    style={{ width: `${ep.percent}%` }}
                    className="h-full bg-accent rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
