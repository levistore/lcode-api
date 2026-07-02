"use client";

import { useEffect, useState } from "react";
import { Diamond, ShieldAlert, CheckCircle2, AlertOctagon, Ban, Clock, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  price: number;
  status: string; // ACTIVE, EXPIRED, CANCELLED
  startDate: string;
  endDate: string | null;
}

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    // Simulated load to represent real data fetching with DB failover mock logic
    const timer = setTimeout(() => {
      setSubscriptions([
        { id: "sub_1", userId: "u1", userName: "Jane Smith", userEmail: "jane@example.com", planName: "Premium Tier", price: 29.0, status: "ACTIVE", startDate: new Date(Date.now() - 86400000 * 20).toISOString(), endDate: new Date(Date.now() + 86400000 * 10).toISOString() },
        { id: "sub_2", userId: "u2", userName: "Tony Stark", userEmail: "tony@stark.com", planName: "Enterprise Tier", price: 199.0, status: "ACTIVE", startDate: new Date(Date.now() - 86400000 * 50).toISOString(), endDate: null },
        { id: "sub_3", userId: "u3", userName: "Bruce Wayne", userEmail: "bruce@wayne.corp", planName: "Premium Tier", price: 29.0, status: "CANCELLED", startDate: new Date(Date.now() - 86400000 * 60).toISOString(), endDate: new Date(Date.now() - 86400000 * 30).toISOString() },
        { id: "sub_4", userId: "u4", userName: "Peter Parker", userEmail: "peter@dailybugle.com", planName: "Basic Tier", price: 9.0, status: "EXPIRED", startDate: new Date(Date.now() - 86400000 * 30).toISOString(), endDate: new Date(Date.now() - 86400000 * 1).toISOString() }
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCancelSub = (subId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription? The user's rate limits will fallback to Free Tier immediately.")) return;

    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === subId ? { ...sub, status: "CANCELLED", endDate: new Date().toISOString() } : sub))
    );
    toast.success("Subscription cancelled successfully");
  };

  const handleExtendSub = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subId) {
          const currentEnd = sub.endDate ? new Date(sub.endDate) : new Date();
          currentEnd.setDate(currentEnd.getDate() + 30);
          return { ...sub, status: "ACTIVE", endDate: currentEnd.toISOString() };
        }
        return sub;
      })
    );
    toast.success("Subscription extended by 30 days");
  };

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">User Subscriptions</h1>
        <p className="text-xs text-text-secondary">Monitor active developer contracts, extend plan periods and revoke tier access.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-secondary p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subscriber name, email, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.8 text-xs bg-bg-primary border border-border rounded-xl focus:border-accent focus:outline-none placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Tiers" },
            { id: "ACTIVE", label: "Active" },
            { id: "CANCELLED", label: "Cancelled" },
            { id: "EXPIRED", label: "Expired" }
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

      {/* Main Table */}
      <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Retrieving subscriptions ledger...</p>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Diamond className="w-10 h-10 text-text-tertiary mx-auto" />
            <p className="text-xs text-text-secondary">No subscriptions found matching query constraints.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">Subscriber</th>
                  <th className="py-3.5 px-5">Plan Level</th>
                  <th className="py-3.5 px-5">Billing Rate</th>
                  <th className="py-3.5 px-5">Timeline</th>
                  <th className="py-3.5 px-5">State</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="font-semibold text-text-primary block leading-none mb-1">{sub.userName}</span>
                        <span className="text-[10px] text-text-tertiary font-mono">{sub.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-accent font-bold">{sub.planName}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-text-primary">
                      ${sub.price.toFixed(2)}/mo
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary text-[11px] font-mono leading-normal">
                      <div>Start: {new Date(sub.startDate).toLocaleDateString()}</div>
                      <div>
                        End: {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "Unlimited (Renewing)"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-semibold tracking-wide font-mono px-2 py-0.5 rounded ${
                        sub.status === "ACTIVE"
                          ? "bg-success/10 text-success border border-success/20"
                          : sub.status === "CANCELLED"
                          ? "bg-error/10 text-error border border-error/20"
                          : "bg-bg-tertiary text-text-secondary border border-border"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {sub.status === "ACTIVE" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExtendSub(sub.id)}
                            className="bg-bg-primary hover:bg-bg-tertiary border border-border text-text-primary text-[10px] font-semibold px-2 py-1 rounded-md transition-colors"
                          >
                            Extend 30d
                          </button>
                          <button
                            onClick={() => handleCancelSub(sub.id)}
                            className="bg-error text-white hover:bg-error/80 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" /> Terminate
                          </button>
                        </div>
                      )}
                      {sub.status !== "ACTIVE" && (
                        <span className="text-[10px] text-text-tertiary italic">No active management required</span>
                      )}
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
