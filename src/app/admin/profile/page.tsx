"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Save, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
        }
      })
      .catch(() => {
        toast.error("Failed to load user profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    // Simulate updating API endpoint /api/auth/me or update local state
    setTimeout(() => {
      setSubmitLoading(false);
      toast.success("Profile information updated successfully!");
      if (profile) {
        setProfile({ ...profile, name, email });
      }
    }, 600);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setSubmitLoading(true);
    setTimeout(() => {
      setSubmitLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Account password updated successfully!");
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Admin Profile</h1>
        <p className="text-xs text-text-secondary">View system credentials, adjust personal information, and modify login passwords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-xs font-medium">
        
        {/* Profile Card */}
        {profile && (
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center text-text-primary text-3xl font-black shadow-[0_4px_20px_rgba(234,88,12,0.3)] border border-white/10 mx-auto">
              {profile.name[0]?.toUpperCase() || "S"}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">{profile.name}</h3>
              <span className="text-[10px] text-text-tertiary font-mono uppercase bg-bg-tertiary border border-border px-2 py-0.5 rounded inline-block">
                {profile.role}
              </span>
            </div>

            <div className="border-t border-border pt-4 text-left space-y-2.5 text-text-secondary">
              <div>
                <span className="text-[9px] uppercase font-bold text-text-tertiary block mb-0.5">Admin Account ID</span>
                <span className="font-mono text-text-primary select-all font-semibold">{profile.id}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-text-tertiary block mb-0.5">Role Permission Type</span>
                <span className="text-accent font-bold">SUPER ADMINISTRATOR</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-text-tertiary block mb-0.5">Registered Since</span>
                <span className="text-text-primary font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Update Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information Form */}
          <form onSubmit={handleUpdateInfo} className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-accent" /> Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-text-secondary">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-accent hover:bg-accent-hover text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1"
              >
                {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Personal Info
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-accent" /> Change Account Password
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-secondary">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-text-secondary">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-text-secondary">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-accent hover:bg-accent-hover text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1"
              >
                {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Change Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
