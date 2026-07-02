"use client";

import { useEffect, useState } from "react";
import { Plus, FolderKanban, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  endpointsCount: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch(() => {
        toast.error("Failed to fetch API categories");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Category created successfully");
        setShowCreateModal(false);
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to delete category");
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">API Categories</h1>
          <p className="text-xs text-text-secondary">Create category tags and organize endpoints into accessible collections.</p>
        </div>
        <button
          onClick={() => {
            setName("");
            setDescription("");
            setShowCreateModal(true);
          }}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(234,88,12,0.15)] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-secondary">Loading categories list...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <FolderKanban className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-xs text-text-secondary">No categories created yet. Click "Create Category" to define your first group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-bg-secondary border border-border rounded-2xl p-5 hover:border-accent/40 transition-all group flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-center justify-between gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-accent" />
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-text-secondary border border-border rounded-lg hover:text-error hover:bg-bg-tertiary transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors mb-1">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-text-tertiary font-mono mb-2">
                  slug: {cat.slug}
                </p>
                <p className="text-[11px] text-text-secondary leading-normal line-clamp-3">
                  {cat.description || "No description provided."}
                </p>
              </div>
              <div className="border-t border-border/60 pt-3 mt-4 flex items-center justify-between text-[10px] text-text-secondary font-medium">
                <span>Associated Routes</span>
                <span className="text-text-primary font-bold bg-bg-primary border border-border px-2 py-0.5 rounded font-mono">
                  {cat.endpointsCount} apis
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <form
            onSubmit={handleSubmit}
            className="bg-bg-secondary border border-border rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary">Create Category</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Canva APIs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Category Description</label>
              <textarea
                placeholder="Brief summary describing the type of APIs in this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
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
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
