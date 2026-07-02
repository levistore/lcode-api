"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  invoiceId: string;
  username: string;
  email: string;
  userId: string;
  amount: number;
  method: string;
  status: string; // PENDING, APPROVED, REJECTED, REFUNDED
  date: string;
}

interface Stats {
  revenueToday: number;
  revenueMonth: number;
  revenueYear: number;
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || []);
        setStats(data.stats || null);
      })
      .catch(() => {
        toast.error("Failed to load payment transactions");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (paymentId: string, action: string) => {
    if (!confirm(`Are you sure you want to perform: ${action.toUpperCase()} on this transaction?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Transaction successfully ${action}d`);
        fetchPayments();
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Payment Transactions</h1>
        <p className="text-xs text-text-secondary">Track subscription invoices, check deposits and approve manual billing upgrades.</p>
      </div>

      {/* Revenue statistics cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Revenue Today</span>
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-2xl font-extrabold text-text-primary">${stats.revenueToday}</h3>
            <span className="text-[10px] text-success block mt-1 font-semibold">Active Daily Sales</span>
          </div>

          <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Revenue This Month</span>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-2xl font-extrabold text-text-primary">${stats.revenueMonth}</h3>
            <span className="text-[10px] text-success block mt-1 font-semibold">MTD Target Stats</span>
          </div>

          <div className="bg-bg-secondary border border-border rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Revenue Year</span>
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-2xl font-extrabold text-text-primary">${stats.revenueYear}</h3>
            <span className="text-[10px] text-success block mt-1 font-semibold">Annual Accumulation</span>
          </div>
        </div>
      )}

      {/* Table list */}
      <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-secondary">Retrieving ledger listings...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center">
            <DollarSign className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-xs text-text-secondary">No invoices recorded in transaction logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">Invoice ID</th>
                  <th className="py-3.5 px-5">User Account</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Payment Method</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Transaction Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-text-primary">
                      {payment.invoiceId}
                    </td>
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="text-text-primary block leading-none mb-0.5">{payment.username}</span>
                        <span className="text-[10px] text-text-tertiary font-mono">{payment.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-text-primary font-bold font-mono">
                      ${payment.amount}
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary">
                      {payment.method}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-semibold tracking-wide font-mono px-2 py-0.5 rounded ${
                        payment.status === "APPROVED"
                          ? "bg-success/10 text-success"
                          : payment.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400"
                          : payment.status === "REJECTED"
                          ? "bg-error/15 text-error"
                          : "bg-purple-500/10 text-purple-400"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono">
                      {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {payment.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(payment.id, "approve")}
                            disabled={actionLoading}
                            className="bg-success text-white hover:bg-success/80 text-[10px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(payment.id, "reject")}
                            disabled={actionLoading}
                            className="bg-error text-white hover:bg-error/80 text-[10px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}
                      {payment.status === "APPROVED" && (
                        <button
                          onClick={() => handleAction(payment.id, "refund")}
                          disabled={actionLoading}
                          className="border border-border text-text-secondary hover:text-error hover:border-error/30 text-[10px] font-semibold px-2 py-1 rounded-md transition-all flex items-center gap-1 ml-auto"
                        >
                          <RefreshCw className="w-3 h-3" /> Refund
                        </button>
                      )}
                      {payment.status === "REJECTED" && (
                        <span className="text-[10px] text-text-tertiary italic">Rejected</span>
                      )}
                      {payment.status === "REFUNDED" && (
                        <span className="text-[10px] text-text-tertiary italic">Refunded</span>
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
