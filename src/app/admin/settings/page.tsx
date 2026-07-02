"use client";

import { useEffect, useState } from "react";
import { Settings, Save, ShieldAlert, Key, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Settings State
  const [siteName, setSiteName] = useState("Lcode API");
  const [siteDescription, setSiteDescription] = useState("API Marketplace Platform");
  const [logoUrl, setLogoUrl] = useState("");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  const [enableEmailVerification, setEnableEmailVerification] = useState(false);
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendSenderEmail, setResendSenderEmail] = useState("noreply@yourdomain.com");
  const [freeUserLimit, setFreeUserLimit] = useState(100);
  const [premiumUserLimit, setPremiumUserLimit] = useState(5000);

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setSiteName(s.siteName);
          setSiteDescription(s.siteDescription);
          setLogoUrl(s.logoUrl || "");
          setEnableRegistration(s.enableRegistration);
          setEnableGoogleLogin(s.enableGoogleLogin);
          setEnableEmailVerification(s.enableEmailVerification);
          setResendApiKey(s.resendApiKey || "");
          setResendSenderEmail(s.resendSenderEmail || "");
          setFreeUserLimit(s.freeUserLimit);
          setPremiumUserLimit(s.premiumUserLimit);
        }
      })
      .catch(() => {
        toast.error("Failed to load platform settings");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          siteDescription,
          logoUrl,
          enableRegistration,
          enableGoogleLogin,
          enableEmailVerification,
          resendApiKey,
          resendSenderEmail,
          freeUserLimit,
          premiumUserLimit,
        }),
      });

      if (res.ok) {
        toast.success("Global configurations updated successfully!");
        fetchSettings();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update settings");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setSubmitLoading(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">System Configurations</h1>
          <p className="text-xs text-text-secondary">Modify marketplace landing brand definitions, active login workflows, and API request throttling variables.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-medium">
        {/* Row 1: General and Auth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Branding */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">General branding</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary">Marketplace Name</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary">Platform Tagline Description</label>
                <textarea
                  required
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent resize-none leading-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary">Site Logo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Authentication Workflow toggles */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">User authentication</h3>
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-semibold block mb-0.5">Enable Registration</span>
                  <p className="text-[10px] text-text-tertiary">Allow new developers to register accounts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableRegistration}
                  onChange={(e) => setEnableRegistration(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-border bg-bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-semibold block mb-0.5">Google Social Login</span>
                  <p className="text-[10px] text-text-tertiary">Enable OAuth connection pathways via Google accounts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableGoogleLogin}
                  onChange={(e) => setEnableGoogleLogin(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-border bg-bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-semibold block mb-0.5">Mandatory Verification Link</span>
                  <p className="text-[10px] text-text-tertiary">Require users to click verification links before key generation.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableEmailVerification}
                  onChange={(e) => setEnableEmailVerification(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded border-border bg-bg-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Mail Transports and Rate Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email configuration gateway */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-accent" /> Transactional Mail Gateway
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary">Resend Client API Key</label>
                <input
                  type="password"
                  placeholder="re_Sgj7TESp_..."
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary">Sender Mail Address</label>
                <input
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={resendSenderEmail}
                  onChange={(e) => setResendSenderEmail(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Core Rate Limits */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Default Rate Limiting parameters</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-text-secondary">Free User Rate Limit (Calls/Min)</label>
                <input
                  type="number"
                  required
                  value={freeUserLimit}
                  onChange={(e) => setFreeUserLimit(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary">Premium User Rate Limit (Calls/Min)</label>
                <input
                  type="number"
                  required
                  value={premiumUserLimit}
                  onChange={(e) => setPremiumUserLimit(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-error/5 border border-error/20 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-error shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-bold text-error text-xs">Security Advisory</h4>
            <p className="text-[10px] text-text-secondary leading-normal">
              Changing system parameters alters routing rules instantly. Ensure credentials and sender emails are validated before saving.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.18)] flex items-center gap-1.5"
          >
            {submitLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
