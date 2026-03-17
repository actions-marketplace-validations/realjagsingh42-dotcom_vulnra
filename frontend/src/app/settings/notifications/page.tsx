"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, CheckCircle2, AlertTriangle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getToken() {
  const { createClient } = await import("@/utils/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

function Toggle({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-v-border2 last:border-0">
      <div>
        <div className="font-mono text-[12.5px] text-foreground">{label}</div>
        {sub && <div className="font-mono text-[11px] text-v-muted2 mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-9 h-5 rounded-full relative transition-colors shrink-0 mt-0.5",
          checked ? "bg-acid" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [notificationEmail, setNotificationEmail] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(20);
  const [alertNewHigh, setAlertNewHigh] = useState(true);
  const [alertScanComplete, setAlertScanComplete] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const resp = await fetch(`${API}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const d = await resp.json();
          setNotificationEmail(d.notification_email || "");
          setAlertThreshold(d.alert_threshold ?? 20);
          setAlertNewHigh(d.alert_new_high ?? true);
          setAlertScanComplete(d.alert_scan_complete ?? false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const token = await getToken();
      if (!token) return;
      const resp = await fetch(`${API}/api/user/notifications`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_email: notificationEmail || null,
          alert_threshold: alertThreshold,
          alert_new_high: alertNewHigh,
          alert_scan_complete: alertScanComplete,
        }),
      });
      if (resp.ok) {
        setMsg({ text: "Notification preferences saved", ok: true });
      } else {
        const e = await resp.json();
        setMsg({ text: e.detail || "Save failed", ok: false });
      }
    } catch {
      setMsg({ text: "Network error", ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-5 h-5 text-acid animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[680px]">
      {/* Header */}
      <div>
        <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">Notifications</h1>
        <p className="font-mono text-[12px] text-v-muted2">
          Control when VULNRA sends you email alerts via Sentinel and scan events.
        </p>
      </div>

      {/* Alert email override */}
      <div className="border border-v-border2 rounded-sm overflow-hidden">
        <div className="px-5 py-4 bg-v-bg1 border-b border-v-border2">
          <div className="font-mono text-[12.5px] font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-acid" />
            Alert Email
          </div>
          <div className="font-mono text-[11px] text-v-muted2 mt-0.5">
            Override the email address for Sentinel and billing alerts. Leave blank to use your account email.
          </div>
        </div>
        <div className="p-5 bg-background">
          <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
            Notification email
          </label>
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="ops@company.ai (leave blank for account email)"
            className="w-full font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 focus:bg-v-bg2 transition-colors"
          />
        </div>
      </div>

      {/* Sentinel alert settings */}
      <div className="border border-v-border2 rounded-sm overflow-hidden">
        <div className="px-5 py-4 bg-v-bg1 border-b border-v-border2">
          <div className="font-mono text-[12.5px] font-semibold text-foreground">
            Sentinel Alert Rules
          </div>
          <div className="font-mono text-[11px] text-v-muted2 mt-0.5">
            Sentinel monitors your endpoints on a schedule. Alerts fire when these conditions are met.
          </div>
        </div>
        <div className="bg-background px-5">
          {/* Threshold */}
          <div className="py-4 border-b border-v-border2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-mono text-[12.5px] text-foreground">
                  Risk spike threshold
                </div>
                <div className="font-mono text-[11px] text-v-muted2 mt-0.5">
                  Alert when risk score increases by this many percentage points between scans.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="font-mono text-[20px] font-bold text-acid w-12 text-right">
                  {alertThreshold}
                </span>
                <span className="font-mono text-[11px] text-v-muted2">pp</span>
              </div>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-[#b8ff57]"
            />
            <div className="flex justify-between font-mono text-[9px] text-v-muted2 mt-1">
              <span>5pp (sensitive)</span>
              <span>50pp (major spikes only)</span>
            </div>
          </div>

          <Toggle
            checked={alertNewHigh}
            onChange={setAlertNewHigh}
            label="Alert on new HIGH findings"
            sub="Send an alert whenever a new HIGH or CRITICAL vulnerability is detected, regardless of risk delta."
          />
          <Toggle
            checked={alertScanComplete}
            onChange={setAlertScanComplete}
            label="Alert on every scan complete"
            sub="Receive an email after every Sentinel scan completes, even if no alert threshold is crossed. (Noisy — use for new setups only.)"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-widest px-5 py-2.5 rounded-sm bg-acid text-black hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(184,255,87,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save preferences
        </button>
        {msg && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-mono",
              msg.ok ? "text-acid" : "text-v-red"
            )}
          >
            {msg.ok ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
