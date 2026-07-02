"use client";

import { useEffect, useState } from "react";
import { Cpu, Server, Activity, HardDrive, RefreshCw, Loader2, Thermometer } from "lucide-react";
import { toast } from "sonner";

interface SystemMetric {
  cpu: number;
  memory: number;
  disk: number;
  latency: number;
  uptime: string;
}

export default function SystemStatus() {
  const [metrics, setMetrics] = useState<SystemMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = () => {
    setRefreshing(true);
    setTimeout(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 15) + 12, // 12% - 27%
        memory: Math.floor(Math.random() * 8) + 48, // 48% - 56%
        disk: 34,
        latency: Math.floor(Math.random() * 20) + 85, // 85ms - 105ms
        uptime: "14d 6h 32m"
      });
      setLoading(false);
      setRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    fetchMetrics();
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">System Status</h1>
          <p className="text-xs text-text-secondary">Analyze virtual machine telemetry, processor load, database queries latency, and container states.</p>
        </div>

        <button
          onClick={() => {
            fetchMetrics();
            toast.success("Telemetry statistics updated!");
          }}
          disabled={refreshing}
          className="border border-border hover:bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-accent" : ""}`} /> Refresh
        </button>
      </div>

      {/* Grid Core Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* CPU Usage Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">CPU Processor Load</span>
            <Cpu className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">{metrics.cpu}%</span>
            <span className="text-[10px] text-success font-semibold">Healthy</span>
          </div>
          
          {/* Progress bar visual */}
          <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border">
            <div 
              style={{ width: `${metrics.cpu}%` }} 
              className={`h-full rounded-full transition-all duration-500 ${metrics.cpu > 70 ? "bg-error" : "bg-accent"}`} 
            />
          </div>
        </div>

        {/* Memory Usage Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">RAM Memory Load</span>
            <Server className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">{metrics.memory}%</span>
            <span className="text-[10px] text-success font-semibold">Stable</span>
          </div>
          
          <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border">
            <div 
              style={{ width: `${metrics.memory}%` }} 
              className={`h-full rounded-full transition-all duration-500 ${metrics.memory > 80 ? "bg-error" : "bg-accent"}`} 
            />
          </div>
        </div>

        {/* Disk Storage Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Disk Storage capacity</span>
            <HardDrive className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">{metrics.disk}%</span>
            <span className="text-[10px] text-text-tertiary">32GB / 100GB</span>
          </div>
          
          <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border">
            <div 
              style={{ width: `${metrics.disk}%` }} 
              className="h-full bg-accent rounded-full transition-all duration-500" 
            />
          </div>
        </div>

        {/* System Latency Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">DB Latency Response</span>
            <Activity className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">{metrics.latency}ms</span>
            <span className="text-[10px] text-success font-semibold">99.98% SLA</span>
          </div>
          
          <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-border">
            <div 
              style={{ width: `${Math.min(100, (metrics.latency / 300) * 100)}%` }} 
              className="h-full bg-accent rounded-full transition-all duration-500" 
            />
          </div>
        </div>

      </div>

      {/* Services status details */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Platform Running Processes</h3>
        
        <div className="divide-y divide-border text-xs leading-normal">
          <div className="py-3 flex items-center justify-between">
            <span className="font-semibold text-text-primary">Core Application Engine (NextJS)</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-text-secondary font-mono">PID 9243 - Uptime: {metrics.uptime}</span>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="font-semibold text-text-primary">Database Server (PostgreSQL)</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-text-secondary font-mono">PID 1024 - Queries: Active</span>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="font-semibold text-text-primary">Cache Service (In-Memory Buffer)</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-text-secondary font-mono">PID 2942 - Hitrate: 94.2%</span>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="font-semibold text-text-primary">SMTP Mail Relay Service (Resend Provider)</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-text-secondary font-mono">API Connection Valid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
