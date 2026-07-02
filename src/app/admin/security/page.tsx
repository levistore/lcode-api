"use client";

import { useState } from "react";
import { Shield, Lock, Save, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SecurityManagement() {
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Security policies state variables
  const [jwtExpiry, setJwtExpiry] = useState("24");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [jwtSecret, setJwtSecret] = useState("lcode_jwt_secret_primary_key_dev_hash_8a2d1f9b");
  const [restrictMultipleSessions, setRestrictMultipleSessions] = useState(false);
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Security policies updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Security Settings</h1>
        <p className="text-xs text-text-secondary">Enforce administrator policies, authentication variables, JWT verification hashes, and session validity rules.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-medium">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* JWT & Encryption Key Config */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-accent" /> Encryption Keys
            </h3>
            
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-text-secondary">JSON Web Token Secret Key</label>
                <div className="flex items-center bg-bg-primary border border-border rounded-xl px-3 py-1 font-mono">
                  <input
                    type={showToken ? "text" : "password"}
                    value={jwtSecret}
                    onChange={(e) => setJwtSecret(e.target.value)}
                    className="w-full bg-transparent border-none text-text-primary focus:outline-none py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-text-secondary">JWT Expiration (Hours)</label>
                  <input
                    type="number"
                    value={jwtExpiry}
                    onChange={(e) => setJwtExpiry(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-secondary">Session Lifetime (Mins)</label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Authentication Constraints */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-accent" /> Bruteforce Protections
            </h3>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-text-secondary">Maximum Login Attempts Allowed</label>
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-semibold block mb-0.5">Restrict Multi-Session Logins</span>
                  <p className="text-[10px] text-text-tertiary">Invalidate previous logins when user logs in on a new device.</p>
                </div>
                <input
                  type="checkbox"
                  checked={restrictMultipleSessions}
                  onChange={(e) => setRestrictMultipleSessions(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-border bg-bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-semibold block mb-0.5">Force Two-Factor Authentication</span>
                  <p className="text-[10px] text-text-tertiary">Enforce mandatory 2FA setup for all administrators.</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireTwoFactor}
                  onChange={(e) => setRequireTwoFactor(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-border bg-bg-primary"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Security Alert Advisory */}
        <div className="bg-error/5 border border-error/20 p-4 rounded-2xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-error text-xs font-sans">Enforcing Global Security Policies</h4>
            <p className="text-[10px] text-text-secondary leading-normal">
              Updating key secrets immediately terminates current developer sessions. Any existing API keys remain valid but users will need to re-log in to retrieve them.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.18)] flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4 h-4" />}
            Enforce Policies
          </button>
        </div>
      </form>
    </div>
  );
}
