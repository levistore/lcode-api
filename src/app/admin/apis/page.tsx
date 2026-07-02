"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  Terminal,
  Clock,
  Shield,
  Loader2,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  route: string;
  method: string;
  categoryId: string;
  status: string; // ACTIVE, DISABLED
  accessLevel: string; // FREE, PREMIUM, ENTERPRISE
  rateLimit: number;
  requestCount: number;
  category: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ApiManagement() {
  const [apis, setApis] = useState<ApiEndpoint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiEndpoint | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [route, setRoute] = useState("");
  const [method, setMethod] = useState("GET");
  const [categoryId, setCategoryId] = useState("");
  const [accessLevel, setAccessLevel] = useState("FREE");
  const [rateLimit, setRateLimit] = useState("60");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apisRes, catsRes] = await Promise.all([
        fetch("/api/admin/apis"),
        fetch("/api/admin/categories"),
      ]);
      const apisData = await apisRes.json();
      const catsData = await catsRes.json();

      setApis(apisData.apis || []);
      setCategories(catsData.categories || []);
    } catch {
      toast.error("Failed to retrieve endpoints and categories data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingApi(null);
    setName("");
    setDescription("");
    setRoute("");
    setMethod("GET");
    setCategoryId(categories[0]?.id || "");
    setAccessLevel("FREE");
    setRateLimit("60");
    setShowFormModal(true);
  };

  const openEditModal = (api: ApiEndpoint) => {
    setEditingApi(api);
    setName(api.name);
    setDescription(api.description);
    setRoute(api.route);
    setMethod(api.method);
    setCategoryId(api.categoryId);
    setAccessLevel(api.accessLevel);
    setRateLimit(String(api.rateLimit));
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const url = "/api/admin/apis";
      const fetchMethod = editingApi ? "PUT" : "POST";
      const payload = {
        id: editingApi?.id,
        name,
        description,
        route,
        method,
        categoryId,
        accessLevel,
        rateLimit: Number(rateLimit),
        status: editingApi ? editingApi.status : "ACTIVE",
      };

      const res = await fetch(url, {
        method: fetchMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingApi ? "API endpoint updated successfully" : "API endpoint created successfully");
        setShowFormModal(false);
        fetchData();
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
    if (!confirm("Are you sure you want to delete this API endpoint? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/apis?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("API deleted successfully");
        fetchData();
      } else {
        toast.error(data.error || "Deletion failed");
      }
    } catch {
      toast.error("Network request failed");
    }
  };

  const toggleStatus = async (api: ApiEndpoint) => {
    try {
      const nextStatus = api.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
      const res = await fetch("/api/admin/apis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...api,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        toast.success(`API endpoint is now ${nextStatus.toLowerCase()}`);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to toggle status");
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">API Endpoints</h1>
          <p className="text-xs text-text-secondary">Register new routes, verify performance statistics, and toggle endpoints access levels.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(234,88,12,0.15)] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create API Endpoint
        </button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-secondary">Loading api catalog...</p>
        </div>
      ) : apis.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Terminal className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-xs text-text-secondary">No API endpoints defined yet. Click "Create API Endpoint" to add your first route.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {apis.map((api) => (
            <div
              key={api.id}
              className={`bg-bg-secondary border rounded-2xl p-5 relative overflow-hidden transition-all group ${
                api.status === "DISABLED" ? "border-border opacity-70" : "border-border hover:border-accent/40"
              }`}
            >
              {/* Top Row: Method and Route */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.8 rounded font-mono ${
                    api.method === "POST" ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "bg-success/15 text-success border border-success/20"
                  }`}>
                    {api.method}
                  </span>
                  <span className="font-mono text-xs font-semibold text-text-primary truncate max-w-[200px]" title={api.route}>
                    {api.route}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleStatus(api)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      api.status === "ACTIVE"
                        ? "text-text-secondary border-border hover:text-amber-500 hover:bg-bg-tertiary"
                        : "text-success border-success/30 bg-success/5 hover:bg-success/10"
                    }`}
                    title={api.status === "ACTIVE" ? "Disable API" : "Enable API"}
                  >
                    {api.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(api)}
                    className="p-1.5 text-text-secondary border border-border rounded-lg hover:text-accent hover:bg-bg-tertiary transition-colors"
                    title="Edit API"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(api.id)}
                    className="p-1.5 text-text-secondary border border-border rounded-lg hover:text-error hover:bg-bg-tertiary transition-colors"
                    title="Delete API"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* API Info */}
              <div className="space-y-1 mb-4">
                <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                  {api.name}
                </h4>
                <p className="text-[11px] text-text-secondary leading-normal line-clamp-2">
                  {api.description}
                </p>
              </div>

              {/* Status and Parameters Row */}
              <div className="border-t border-border/60 pt-3.5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-text-secondary">
                <div className="flex items-center gap-3.5">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.2 h-3.2 text-text-tertiary" /> {api.category?.name || "Uncategorized"}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.2 h-3.2 text-text-tertiary" /> {api.rateLimit} req/m
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-mono px-1.5 py-0.2 rounded border ${
                    api.accessLevel === "FREE"
                      ? "bg-bg-primary text-text-secondary border-border"
                      : api.accessLevel === "PREMIUM"
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}>
                    {api.accessLevel}
                  </span>
                  <span className="text-text-primary font-semibold font-mono">
                    {api.requestCount.toLocaleString()} hits
                  </span>
                </div>
              </div>
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
            className="bg-bg-secondary border border-border rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary">
                {editingApi ? "Modify API Endpoint" : "Create New API Endpoint"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-text-secondary font-medium">Endpoint Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TikTok Video Downloader"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-text-secondary font-medium">Endpoint Description</label>
                <textarea
                  required
                  placeholder="Provide a comprehensive summary of parameters returned by this API..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Request Route</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /api/v1/download/tiktok"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">HTTP Request Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">API Category Group</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  {categories.length === 0 && <option value="">No categories defined</option>}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Access Tier Requirement</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none"
                >
                  <option value="FREE">FREE</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Rate Limiting Threshold (Req/Min)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 60"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold border border-border hover:bg-bg-tertiary rounded-xl text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 py-2.5 text-xs font-semibold bg-accent text-white hover:bg-accent-hover rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingApi ? "Save Changes" : "Create Endpoint"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
