"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CreditCard, Shield, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  requestsLimit: number;
  features: string;
}

export default function PricingManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [requestsLimit, setRequestsLimit] = useState("");
  const [features, setFeatures] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPlans = () => {
    setLoading(true);
    fetch("/api/admin/plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans || []);
      })
      .catch(() => {
        toast.error("Failed to retrieve subscription tiers");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setCode("");
    setPrice("");
    setRequestsLimit("");
    setFeatures("");
    setShowFormModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setCode(plan.code);
    setPrice(String(plan.price));
    setRequestsLimit(String(plan.requestsLimit));
    setFeatures(plan.features);
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const url = "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";
      const payload = {
        id: editingPlan?.id,
        name,
        code,
        price: Number(price),
        requestsLimit: Number(requestsLimit),
        features,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingPlan ? "Subscription tier updated successfully" : "Subscription tier created successfully");
        setShowFormModal(false);
        fetchPlans();
      } else {
        toast.error(data.error || "Save operation failed");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan? This will fail if users are actively subscribed.")) return;

    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Subscription plan deleted");
        fetchPlans();
      } else {
        toast.error(data.error || "Failed to delete plan");
      }
    } catch {
      toast.error("Network request failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Pricing Plans</h1>
          <p className="text-xs text-text-secondary">Define account subscription parameters, daily requests quotas, and active plan features.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(234,88,12,0.15)] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Pricing Plan
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-secondary">Loading subscriptions data...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <CreditCard className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-xs text-text-secondary">No pricing plans defined yet. Click "Create Pricing Plan" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-bg-secondary border border-border rounded-2xl p-6 hover:border-accent/40 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Plan Details */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold font-mono tracking-wider bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded uppercase">
                    {plan.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 text-text-secondary hover:text-accent rounded-lg border border-border bg-bg-primary hover:bg-bg-tertiary transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 text-text-secondary hover:text-error rounded-lg border border-border bg-bg-primary hover:bg-bg-tertiary transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-3xl font-extrabold tracking-tight text-text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-text-tertiary">/ month</span>
                </div>

                <div className="border-t border-border pt-4 mb-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider block">Quotas & Limits</span>
                  <span className="text-xs font-semibold text-text-secondary block">
                    {plan.requestsLimit.toLocaleString()} requests / day
                  </span>
                </div>

                {/* Features Checklist */}
                <div className="border-t border-border/60 pt-4 space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider block">Features Included</span>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {plan.features.split(",").map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5 leading-normal">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Decorative bottom bar */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <form
            onSubmit={handleSubmit}
            className="bg-bg-secondary border border-border rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary">
                {editingPlan ? "Modify Pricing Plan" : "Create Pricing Plan"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Plan Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Premium Plan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Plan Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PREMIUM"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!!editingPlan} // Code cannot be modified once created
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent disabled:opacity-50 font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Monthly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 29"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Daily Request Allowance Limit</label>
              <input
                type="number"
                required
                placeholder="e.g. 50000"
                value={requestsLimit}
                onChange={(e) => setRequestsLimit(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Included Features (Comma-Separated)</label>
              <textarea
                required
                placeholder="Feature 1,Feature 2,Feature 3..."
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                rows={3}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent resize-none leading-normal"
              />
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2 text-xs font-semibold border border-border hover:bg-bg-tertiary rounded-xl text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 py-2 text-xs font-semibold bg-accent text-white hover:bg-accent-hover rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingPlan ? "Save Plan" : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
