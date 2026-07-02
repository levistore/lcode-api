"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  UserCheck,
  UserMinus,
  Key,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  plan: string;
  planCode: string;
  requests: number;
  apiKey: string | null;
  apiKeyStatus: string | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(""); // active, banned, premium, free
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState("USER");
  const [editPlan, setEditPlan] = useState("FREE");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (filter) query.append("filter", filter);

    fetch(`/api/admin/users?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch(() => {
        toast.error("Failed to load users list");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]); // Auto-reload on filter toggle

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUserAction = async (userId: string, action: string, payload?: any) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, payload }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Operation succeeded");
        fetchUsers();
        if (showDetailModal && selectedUser?.id === userId) {
          // Refresh detail view
          const updatedUser = { ...selectedUser };
          if (action === "ban") updatedUser.status = "BANNED";
          if (action === "unban") updatedUser.status = "ACTIVE";
          if (action === "reset_key") updatedUser.apiKey = data.apiKey;
          setSelectedUser(updatedUser);
        }
        setShowEditModal(false);
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditPlan(user.planCode);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">User Directory</h1>
          <p className="text-xs text-text-secondary">View system registration details, edit permission ranks, and revoke tokens.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-bg-secondary p-4 rounded-2xl border border-border">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-24 py-1.8 text-xs bg-bg-primary border border-border rounded-xl focus:border-accent focus:outline-none placeholder:text-text-tertiary"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white text-[10px] font-semibold px-3 py-1 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          {[
            { id: "", label: "All Users" },
            { id: "active", label: "Active" },
            { id: "banned", label: "Banned" },
            { id: "premium", label: "Premium" },
            { id: "free", label: "Free" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                filter === opt.id
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
            <p className="text-xs text-text-secondary">Retrieving user roster...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <UserMinus className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-xs text-text-secondary">No users matched your query filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-bg-primary/20 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">Tier</th>
                  <th className="py-3.5 px-5">Calls Hit</th>
                  <th className="py-3.5 px-5">Member Since</th>
                  <th className="py-3.5 px-5">State</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-tertiary/10 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold font-mono">
                          {user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block leading-none mb-1">{user.name}</span>
                          <span className="text-[10px] text-text-tertiary font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        user.planCode === "FREE" ? "bg-bg-tertiary text-text-secondary border border-border" : "bg-accent/15 text-accent border border-accent/20"
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-text-secondary font-mono">{user.requests}</td>
                    <td className="py-3.5 px-5 text-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[9px] font-semibold tracking-wide font-mono px-2 py-0.5 rounded ${
                        user.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/15 text-error"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-bg-tertiary transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-text-secondary hover:text-accent rounded hover:bg-bg-tertiary transition-colors"
                          title="Edit Plan/Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleUserAction(user.id, "ban")}
                            className="p-1.5 text-text-secondary hover:text-error rounded hover:bg-bg-tertiary transition-colors"
                            title="Ban User"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, "unban")}
                            className="p-1.5 text-text-secondary hover:text-success rounded hover:bg-bg-tertiary transition-colors"
                            title="Unban User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to permanently delete this user?")) {
                              handleUserAction(user.id, "delete");
                            }
                          }}
                          className="p-1.5 text-text-secondary hover:text-error rounded hover:bg-bg-tertiary transition-colors"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary">Inspect User Profile</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-border">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-primary/40 border border-border">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent text-lg font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-sm">{selectedUser.name}</h4>
                  <span className="text-[10px] text-text-tertiary font-mono uppercase bg-bg-tertiary border border-border px-1.5 py-0.5 rounded">{selectedUser.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-text-tertiary block mb-0.5">Email Address</span>
                  <span className="text-text-primary font-medium">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-0.5">Account Status</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded inline-block ${
                    selectedUser.status === "ACTIVE" ? "bg-success/15 text-success" : "bg-error/15 text-error"
                  }`}>{selectedUser.status}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-0.5">Joined Date</span>
                  <span className="text-text-primary">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block mb-0.5">Subscription Tier</span>
                  <span className="text-accent font-semibold">{selectedUser.plan}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-accent" /> API Credentials
                </h4>
                {selectedUser.apiKey ? (
                  <div className="bg-bg-primary p-3 rounded-xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-tertiary">Key Token Value:</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded ${selectedUser.apiKeyStatus === "ACTIVE" ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}>{selectedUser.apiKeyStatus}</span>
                    </div>
                    <code className="text-[11px] block text-text-primary select-all bg-bg-secondary p-2 rounded border border-border text-center overflow-x-auto truncate font-mono">
                      {selectedUser.apiKey}
                    </code>
                    <button
                      onClick={() => handleUserAction(selectedUser.id, "reset_key")}
                      disabled={actionLoading}
                      className="w-full py-1.5 text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3 h-3" />}
                      Reset Key Value
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-bg-primary/20 border border-dashed border-border rounded-xl">
                    <p className="text-text-tertiary mb-2">No active API key allocated.</p>
                    <button
                      onClick={() => handleUserAction(selectedUser.id, "reset_key")}
                      disabled={actionLoading}
                      className="py-1.5 px-4 text-[10px] font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      Allocate New API Key
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-text-primary">Modify Account Tiers</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-text-secondary hover:text-text-primary rounded-lg border border-border">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Define System Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="USER">User (Standard account)</option>
                  <option value="ADMIN">Admin (Moderator privileges)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full root access)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Assign Subscription Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="FREE">Free Tier</option>
                  <option value="PREMIUM">Premium Tier</option>
                  <option value="ENTERPRISE">Enterprise Tier</option>
                </select>
              </div>

              <div className="border-t border-border pt-4 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 text-xs font-semibold border border-border hover:bg-bg-tertiary rounded-xl text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Update role first if changed
                    if (editRole !== selectedUser.role) {
                      await handleUserAction(selectedUser.id, "update_role", { role: editRole });
                    }
                    // Update plan if changed
                    if (editPlan !== selectedUser.planCode) {
                      await handleUserAction(selectedUser.id, "update_plan", { planCode: editPlan });
                    }
                    toast.success("Changes saved successfully");
                    setShowEditModal(false);
                  }}
                  className="flex-1 py-2 text-xs font-semibold bg-accent text-white hover:bg-accent-hover rounded-xl transition-colors flex items-center justify-center"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
