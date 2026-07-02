"use client";

import { useEffect, useState } from "react";
import { Plus, Megaphone, Trash2, Calendar, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string; // INFO, WARNING, UPDATE
  publishDate: string;
  createdAt: string;
}

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("INFO");
  const [publishDate, setPublishDate] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAnnouncements = () => {
    setLoading(true);
    fetch("/api/admin/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announcements || []);
      })
      .catch(() => {
        toast.error("Failed to load announcements");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, publishDate }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Announcement published successfully");
        setShowCreateModal(false);
        setTitle("");
        setContent("");
        setType("INFO");
        setPublishDate("");
        fetchAnnouncements();
      } else {
        toast.error(data.error || "Failed to publish announcement");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Announcement removed");
        fetchAnnouncements();
      } else {
        toast.error(data.error || "Failed to delete announcement");
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Announcements</h1>
          <p className="text-xs text-text-secondary">Publish banner notifications, update changelogs, and schedule platform notices.</p>
        </div>
        <button
          onClick={() => {
            setTitle("");
            setContent("");
            setType("INFO");
            setPublishDate("");
            setShowCreateModal(true);
          }}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(234,88,12,0.15)] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {/* Main Content List */}
      {loading ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-secondary">Loading announcements feed...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-2xl py-20 text-center">
          <Megaphone className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-xs text-text-secondary">No announcements published yet. Click "Create Announcement" to post your first notification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-bg-secondary border border-border rounded-2xl p-5 hover:border-accent/40 transition-all flex flex-col sm:flex-row items-start justify-between gap-4 group"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded ${
                    ann.type === "WARNING"
                      ? "bg-error/15 text-error border border-error/20"
                      : ann.type === "UPDATE"
                      ? "bg-accent/15 text-accent border border-accent/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {ann.type}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Published: {new Date(ann.publishDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                  {ann.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed white-space-pre-wrap">
                  {ann.content}
                </p>
              </div>

              <button
                onClick={() => handleDelete(ann.id)}
                className="p-2 text-text-secondary border border-border rounded-lg hover:text-error hover:bg-bg-tertiary transition-colors shrink-0 self-end sm:self-start"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
            className="bg-bg-secondary border border-border rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary">Create Announcement</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Canva Rendering Speed Improvements"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Category Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="INFO">INFO (News / Features)</option>
                  <option value="WARNING">WARNING (Maintenance / Alerts)</option>
                  <option value="UPDATE">UPDATE (Changelog changes)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Publish Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-text-secondary font-medium">Notice Message Details</label>
              <textarea
                required
                placeholder="Write the announcement message details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent resize-none leading-normal"
              />
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
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
                Publish Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
