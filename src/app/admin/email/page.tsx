"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Eye, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Template {
  subject: string;
  html: string;
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [loading, setLoading] = useState(true);
  const [activeTemplateId, setActiveTemplateId] = useState("verification");
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetch("/api/admin/email-templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates || {});
      })
      .catch(() => {
        toast.error("Failed to load email templates list");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      toast.error("Please enter a valid target email address");
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activeTemplateId,
          testEmail,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Test email sent successfully!");
      } else {
        toast.error(data.error || "Email dispatch failed");
      }
    } catch {
      toast.error("Network request failed");
    } finally {
      setSendingTest(false);
    }
  };

  const activeTemplate = templates[activeTemplateId];

  // We need to inject the proper mock parameters into the preview frame source
  const getPreviewHtml = (htmlContent: string) => {
    const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return htmlContent
      .replace(/{{APP_URL}}/g, appUrl)
      .replace(/{{TOKEN}}/g, "preview_token_string")
      .replace(/{{NAME}}/g, "John Doe")
      .replace(/{{INVOICE_ID}}/g, "INV-8734")
      .replace(/{{AMOUNT}}/g, "29.00")
      .replace(/{{METHOD}}/g, "Manual Bank Transfer")
      .replace(/{{PLAN_NAME}}/g, "Premium Plan")
      .replace(/{{LIMIT}}/g, "50,000");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Email Templates</h1>
        <p className="text-xs text-text-secondary">Inspect transactional HTML emails, check formatting in preview frame, and send SMTP test triggers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Selection and Test Sending */}
        <div className="space-y-5 lg:col-span-1">
          {/* Selector Card */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Transactional Templates</h3>
            <div className="space-y-1.5">
              {[
                { id: "verification", name: "Verification Email" },
                { id: "welcome", name: "Welcome Email" },
                { id: "reset", name: "Password Reset" },
                { id: "payment", name: "Payment Success" },
                { id: "upgrade", name: "Plan Upgrade" },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setActiveTemplateId(tmpl.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    activeTemplateId === tmpl.id
                      ? "bg-accent/10 border-accent/30 text-accent shadow-[0_0_12px_rgba(234,88,12,0.05)]"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0" /> {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Test Send Card */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-accent" /> Dispatch Test Mail
            </h3>
            <p className="text-[10px] text-text-secondary leading-normal">
              Sends an actual email preview of the selected template via SMTP config. Ensure your `.env` transporter host variables are active.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-text-secondary font-medium">Target Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tester@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={sendingTest || loading}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {sendingTest ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Test Email
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: HTML Frame Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-bg-secondary border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-text-primary">
                {activeTemplate ? activeTemplate.subject : "Subject Preview Line"}
              </span>
            </div>
            <span className="text-[9px] font-mono text-text-tertiary">Sandboxed Preview Frame</span>
          </div>

          <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden h-[480px] shadow-inner relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : activeTemplate ? (
              <iframe
                title="Email Preview"
                srcDoc={getPreviewHtml(activeTemplate.html)}
                className="w-full h-full bg-white border-0"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary">
                <span className="text-xs text-text-tertiary">Template data not fetched.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
