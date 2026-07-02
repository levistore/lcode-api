"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Terminal,
  Activity,
  DollarSign,
  TrendingUp,
  Cpu,
  Server,
  Clock,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Database,
  Key,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: string;
  isPositive?: boolean;
  href?: string;
}

function StatCard({ title, value, description, icon: Icon, trend, isPositive, href }: StatCardProps) {
  const cardContent = (
    <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-4.5 h-4.5 text-accent" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-primary">{value}</span>
        {trend && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isPositive ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[11px] text-text-tertiary mt-2">{description}</p>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent/35 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("registrations");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch(() => {
        toast.error("Failed to load dashboard data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const { stats, charts, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">Overview Dashboard</h1>
        <p className="text-xs text-text-secondary">Welcome to Super Admin Control. Monitor user behaviors, transactions and system integrations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Total users registered in the system"
          icon={Users}
          trend="+12%"
          isPositive={true}
          href="/admin/users"
        />
        <StatCard
          title="Total API Requests"
          value={stats.totalRequests.toLocaleString()}
          description="Cumulative API endpoint hits logged"
          icon={Activity}
          trend="+32%"
          isPositive={true}
          href="/admin/analytics"
        />
        <StatCard
          title="Today's Requests"
          value={(stats.todayRequests || 0).toLocaleString()}
          description="API endpoint hits logged since midnight"
          icon={Clock}
          trend="Real-time"
          isPositive={true}
          href="/admin/requests"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue}`}
          description="Total collected from approved payments"
          icon={DollarSign}
          trend="+$249"
          isPositive={true}
          href="/admin/payments"
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          description="Subscribers on Premium/Enterprise tier"
          icon={TrendingUp}
          trend="Active Tier"
          isPositive={true}
          href="/admin/plans"
        />
        <StatCard
          title="Free Users"
          value={stats.freeUsers}
          description="Standard accounts without active plan"
          icon={Users}
          trend="Standard"
          isPositive={true}
          href="/admin/users"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          description="Payments awaiting administrator approval"
          icon={DollarSign}
          trend="Requires Review"
          isPositive={false}
          href="/admin/payments"
        />
        <StatCard
          title="Total APIs"
          value={stats.totalApis}
          description="Available API paths in the database"
          icon={Terminal}
          trend="Available"
          isPositive={true}
          href="/admin/apis"
        />
        <StatCard
          title="Active APIs"
          value={stats.activeApis}
          description="APIs currently processing requests"
          icon={Terminal}
          trend="Online"
          isPositive={true}
          href="/admin/apis"
        />
        <StatCard
          title="Active API Keys"
          value={stats.activeApiKeys}
          description="Total active API tokens issued to clients"
          icon={Key}
          trend="Active Keys"
          isPositive={true}
          href="/admin/api-keys"
        />
        <StatCard
          title="Server Status"
          value={stats.serverStatus}
          description="Current system health evaluation"
          icon={Server}
          isPositive={stats.serverStatus === "Healthy"}
          trend="99ms latency"
          href="/admin/system"
        />
        <StatCard
          title="Database Status"
          value={stats.databaseStatus}
          description="PostgreSQL active status evaluation"
          icon={Database}
          trend="Prisma Online"
          isPositive={stats.databaseStatus === "Healthy"}
          href="/admin/database"
        />
        <StatCard
          title="CPU Usage"
          value={`${stats.cpuUsage}%`}
          description="Server core load allocation"
          icon={Cpu}
          trend="Stable"
          isPositive={stats.cpuUsage < 70}
          href="/admin/system"
        />
        <StatCard
          title="Memory Usage"
          value={`${stats.memoryUsage}%`}
          description="Database and app server RAM load"
          icon={Cpu}
          trend="Allocated"
          isPositive={stats.memoryUsage < 85}
          href="/admin/system"
        />
        <StatCard
          title="Storage Usage"
          value={`${stats.storageUsage}%`}
          description="Disk capacity current utilization"
          icon={Server}
          trend="Sufficient"
          isPositive={stats.storageUsage < 80}
          href="/admin/system"
        />
        <StatCard
          title="Online Users"
          value={stats.onlineUsers}
          description="Active sessions within the last 15m"
          icon={Users}
          trend="Live Now"
          isPositive={true}
          href="/admin/users"
        />
        <StatCard
          title="Account Settings"
          value="Configure"
          description="Update global configurations and variables"
          icon={Settings}
          trend="System Settings"
          isPositive={true}
          href="/admin/settings"
        />
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Requests Chart */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Requests Volume Trend</h3>
          <div className="h-64 flex items-end justify-between pt-6 px-2 relative border-b border-l border-border">
            {charts.dailyRequests.map((d: any, idx: number) => {
              const maxVal = Math.max(...charts.dailyRequests.map((r: any) => r.count));
              const heightPercent = maxVal > 0 ? (d.count / maxVal) * 80 + 10 : 20;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-tertiary border border-border px-2 py-1 rounded text-[10px] font-mono shadow-md pointer-events-none mb-1">
                    {d.count.toLocaleString()} reqs
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-8 sm:w-12 bg-gradient-to-t from-accent/30 to-accent rounded-t border border-accent/40 group-hover:brightness-110 transition-all duration-300"
                  />
                  <span className="text-[10px] text-text-secondary mt-2.5 font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular APIs Panel */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Most Demanded APIs</h3>
          <div className="space-y-4">
            {charts.topApis.map((api: any, idx: number) => {
              const maxVal = Math.max(...charts.topApis.map((r: any) => r.requests));
              const widthPercent = maxVal > 0 ? (api.requests / maxVal) * 100 : 10;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary font-medium truncate max-w-[150px]">{api.name}</span>
                    <span className="text-text-primary font-mono font-medium">{api.requests.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-bg-primary rounded-full overflow-hidden border border-border">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Row: Growth Chart & Recent Activity Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth & Revenue Charts */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Growth Matrix</h3>
            <p className="text-[10px] text-text-secondary">Comparing registration trends and billing streams.</p>
          </div>

          <div className="space-y-4">
            {/* New Users Trend mini graph */}
            <div>
              <span className="text-[11px] text-text-secondary block mb-2">New Registrations (7 Days)</span>
              <div className="flex gap-1.5 h-12 items-end">
                {charts.dailyNewUsers.map((d: any, idx: number) => {
                  const maxVal = Math.max(...charts.dailyNewUsers.map((r: any) => r.count)) || 1;
                  const h = (d.count / maxVal) * 100;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${h || 15}%` }}
                      className="flex-1 bg-accent/25 hover:bg-accent/40 transition-colors rounded-sm"
                      title={`${d.day}: ${d.count}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Revenue Trend mini graph */}
            <div>
              <span className="text-[11px] text-text-secondary block mb-2">Sales Revenue Trend (7 Days)</span>
              <div className="flex gap-1.5 h-12 items-end">
                {charts.dailyRevenue.map((d: any, idx: number) => {
                  const maxVal = Math.max(...charts.dailyRevenue.map((r: any) => r.amount)) || 1;
                  const h = (d.amount / maxVal) * 100;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${h || 15}%` }}
                      className="flex-1 bg-success/20 hover:bg-success/35 transition-colors rounded-sm"
                      title={`${d.day}: $${d.amount}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities List */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">System Events Feed</h3>
            <div className="flex border border-border bg-bg-primary p-0.5 rounded-lg">
              {[
                { id: "registrations", label: "Users" },
                { id: "payments", label: "Payments" },
                { id: "logs", label: "API Calls" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-bg-secondary text-accent border border-border/80"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 scrollbar-thin">
            {activeTab === "registrations" && (
              <div className="divide-y divide-border/60">
                {recentActivity.registrations.map((reg: any) => (
                  <div key={reg.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-bg-tertiary/10 px-1 rounded transition-colors">
                    <div>
                      <p className="font-semibold text-text-primary">{reg.name}</p>
                      <p className="text-[10px] text-text-tertiary font-mono">{reg.email}</p>
                    </div>
                    <span className="text-[10px] text-text-secondary font-mono">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {recentActivity.registrations.length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-4">No recent users.</p>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="divide-y divide-border/60">
                {recentActivity.payments.map((p: any) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-bg-tertiary/10 px-1 rounded transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-text-primary">{p.invoiceId}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                          p.status === "APPROVED" ? "bg-success/15 text-success" : "bg-amber-500/15 text-amber-400"
                        }`}>{p.status}</span>
                      </div>
                      <p className="text-[10px] text-text-tertiary truncate max-w-[150px]">{p.user.name}</p>
                    </div>
                    <span className="font-bold text-accent">${p.amount}</span>
                  </div>
                ))}
                {recentActivity.payments.length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-4">No recent invoices.</p>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div className="divide-y divide-border/60">
                {recentActivity.logs.map((log: any) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-bg-tertiary/10 px-1 rounded transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          log.method === "POST" ? "bg-blue-500/15 text-blue-400" : "bg-success/15 text-success"
                        }`}>{log.method}</span>
                        <span className="font-mono text-text-primary text-[11px] truncate max-w-[180px]">{log.route}</span>
                      </div>
                      <p className="text-[10px] text-text-tertiary mt-0.5">By {log.user ? log.user.name : "Anonymous"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono block ${
                        log.statusCode >= 400 ? "text-error" : "text-success"
                      }`}>{log.statusCode}</span>
                      <span className="text-[9px] text-text-tertiary font-mono">{log.responseTime}ms</span>
                    </div>
                  </div>
                ))}
                {recentActivity.logs.length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-4">No recent requests.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
