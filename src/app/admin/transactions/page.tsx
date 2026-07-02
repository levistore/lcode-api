"use client";

import { useEffect, useState } from "react";
import { DollarSign, Search, Filter, Loader2, ArrowUpRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  invoiceId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  status: string; // SUCCESSFUL, FAILED, PROCESSING
  date: string;
  referenceId: string;
}

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions([
        { id: "tx_1", invoiceId: "INV-8734", userName: "Tony Stark", userEmail: "tony@stark.com", amount: 29.00, method: "Credit Card (Stripe)", status: "SUCCESSFUL", date: new Date(Date.now() - 3600000 * 2).toISOString(), referenceId: "ch_1N9z2X2eZvKYlo2C" },
        { id: "tx_2", invoiceId: "INV-8735", userName: "Steve Rogers", userEmail: "cap@avengers.org", amount: 199.00, method: "PayPal Gateway", status: "PROCESSING", date: new Date(Date.now() - 3600000 * 8).toISOString(), referenceId: "pay_9a2b8c83719a" },
        { id: "tx_3", invoiceId: "INV-8736", userName: "Bruce Banner", userEmail: "hulk@avengers.org", amount: 29.00, method: "Bank Wire Transfer", status: "FAILED", date: new Date(Date.now() - 86400000 * 1).toISOString(), referenceId: "tx_failed_99214b" },
        { id: "tx_4", invoiceId: "INV-8737", userName: "Wanda Maximoff", userEmail: "wanda@wundagore.com", amount: 199.00, method: "Crypto Payment (BTC)", status: "SUCCESSFUL", date: new Date(Date.now() - 86400000 * 3).toISOString(), referenceId: "tx_btc_f98f2c3d" },
        { id: "tx_5", invoiceId: "INV-8738", userName: "Thor Odinson", userEmail: "thor@asgard.gov", amount: 29.00, method: "Credit Card (Stripe)", status: "SUCCESSFUL", date: new Date(Date.now() - 86400000 * 5).toISOString(), referenceId: "ch_2A88aN920bc" }
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleForceComplete = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, status: "SUCCESSFUL" } : tx))
    );
    toast.success("Transaction manually marked as successful");
  };

  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
      tx.userName.toLowerCase().includes(search.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Transactions Log</h1>
        <p className="text-xs text-text-secondary">Inspect raw invoice events, card processing IDs and cryptocurrency hashes.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-secondary p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice, name, email, or reference code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.8 text-xs bg-bg-primary border border-border rounded-xl focus:border-accent focus:outline-none placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Statuses" },
            { id: "SUCCESSFUL", label: "Successful" },
            { id: "PROCESSING", label: "Processing" },
            { id: "FAILED", label: "Failed" }
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
            <p className="text-xs text-text-secondary">Parsing transactional database...</p>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <DollarSign className="w-10 h-10 text-text-tertiary mx-auto" />
            <p className="text-xs text-text-secondary">No transactional logs recorded in database matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">Invoice / Hash</th>
                  <th className="py-3.5 px-5">Payer Account</th>
                  <th className="py-3.5 px-5">Gross Amount</th>
                  <th className="py-3.5 px-5">Gateway Method</th>
                  <th className="py-3.5 px-5">Outcome</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs font-medium">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-bg-tertiary/10 transition-colors">
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="font-semibold text-text-primary block leading-none mb-1">{tx.invoiceId}</span>
                        <span className="text-[10px] text-text-tertiary font-mono select-all block mt-0.5">{tx.referenceId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div>
                        <span className="text-text-primary block leading-none mb-0.5">{tx.userName}</span>
                        <span className="text-[10px] text-text-tertiary font-mono">{tx.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold font-mono text-text-primary">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono">
                      {tx.method}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-semibold tracking-wide font-mono px-2 py-0.5 rounded flex items-center gap-1.5 w-fit ${
                        tx.status === "SUCCESSFUL"
                          ? "bg-success/10 text-success border border-success/20"
                          : tx.status === "PROCESSING"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-error/15 text-error border border-error/20"
                      }`}>
                        {tx.status === "SUCCESSFUL" && <CheckCircle2 className="w-3 h-3 text-success" />}
                        {tx.status === "PROCESSING" && <AlertCircle className="w-3 h-3 text-amber-400" />}
                        {tx.status === "FAILED" && <XCircle className="w-3 h-3 text-error" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {tx.status === "PROCESSING" && (
                        <button
                          onClick={() => handleForceComplete(tx.id)}
                          className="bg-accent text-white hover:bg-accent-hover text-[10px] font-semibold px-2 py-1 rounded-md transition-colors"
                        >
                          Mark Successful
                        </button>
                      )}
                      {tx.status !== "PROCESSING" && (
                        <span className="text-[10px] text-text-tertiary italic">Logged and locked</span>
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
