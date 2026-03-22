"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Save, AlertTriangle, CheckCircle2, Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getSession() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/* ── Small form section wrapper ─────────────────────────────── */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-v-border2 rounded-sm overflow-hidden">
      <div className="px-5 py-4 bg-v-bg1 border-b border-v-border2">
        <div className="font-mono text-[12.5px] font-semibold text-foreground">{title}</div>
        {subtitle && (
          <div className="font-mono text-[11px] text-v-muted2 mt-0.5">{subtitle}</div>
        )}
      </div>
      <div className="p-5 bg-background">{children}</div>
    </div>
  );
}

/* ── Toast ──────────────────────────────────────────────────── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[11px] font-mono px-3 py-2 rounded-sm border",
        ok
          ? "bg-acid/10 border-acid/30 text-acid"
          : "bg-v-red/10 border-v-red/30 text-v-red"
      )}
    >
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      {msg}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function AccountPage() {
  const router = useRouter();
  // createClient() is NOT called at component root — it throws during hydration
  // if NEXT_PUBLIC_SUPABASE_URL is missing from the JS bundle (Railway build
  // without env vars). Instead each handler that needs Supabase calls it lazily
  // inside its own try-catch.
  const getSupabase = () => createClient();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  // Password change
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  // Display name
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load profile
  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (!session) return;
        setEmail(session.user.email || "");

        try {
          const resp = await fetch(`${API}/api/user/profile`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            setDisplayName(data.display_name || "");
            setTier(data.tier || "free");
          }
          // Non-ok (404/503) — keep defaults silently
        } catch {
          // Network error fetching profile — keep defaults, do not crash
        }
      } catch {
        // getSession() threw (env vars missing in bundle) — keep loading=false,
        // the user will see a blank form which is better than the error boundary
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveDisplayName = async () => {
    setNameSaving(true);
    setNameMsg(null);
    try {
      const session = await getSession();
      if (!session) return;
      const resp = await fetch(`${API}/api/user/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (resp.ok) {
        setNameMsg({ msg: "Display name updated", ok: true });
      } else {
        const e = await resp.json();
        setNameMsg({ msg: e.detail || "Update failed", ok: false });
      }
    } catch {
      setNameMsg({ msg: "Network error", ok: false });
    } finally {
      setNameSaving(false);
      setTimeout(() => setNameMsg(null), 4000);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      const { error } = await getSupabase().auth.updateUser({ email: newEmail.trim() });
      if (error) {
        setEmailMsg({ msg: error.message, ok: false });
      } else {
        setEmailMsg({
          msg: "Confirmation email sent. Check both inboxes to confirm the change.",
          ok: true,
        });
        setNewEmail("");
      }
    } finally {
      setEmailSaving(false);
      setTimeout(() => setEmailMsg(null), 6000);
    }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      setPwMsg({ msg: "Passwords do not match", ok: false });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ msg: "Password must be at least 8 characters", ok: false });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const { error } = await getSupabase().auth.updateUser({ password: newPw });
      if (error) {
        setPwMsg({ msg: error.message, ok: false });
      } else {
        setPwMsg({ msg: "Password updated successfully", ok: true });
        setNewPw("");
        setConfirmPw("");
      }
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwMsg(null), 4000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const session = await getSession();
      if (!session) return;
      const resp = await fetch(`${API}/api/user`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (resp.ok) {
        try { await getSupabase().auth.signOut(); } catch { /* proceed regardless */ }
        router.push("/");
      }
    } finally {
      setDeleting(false);
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
        <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">Account</h1>
        <p className="font-mono text-[12px] text-v-muted2">
          Manage your profile and authentication settings.
        </p>
      </div>

      {/* Profile */}
      <Section title="Profile" subtitle="Your display name appears in scan reports and audit logs.">
        <div className="space-y-4">
          <div>
            <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
              Email
            </label>
            <div className="font-mono text-[13px] text-foreground px-3 py-2.5 bg-white/[0.025] border border-v-border2 rounded-sm">
              {email}
            </div>
          </div>
          <div>
            <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Smith"
                className="flex-1 font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 focus:bg-v-bg2 transition-colors"
              />
              <button
                onClick={handleSaveDisplayName}
                disabled={nameSaving || !displayName.trim()}
                className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-widest px-4 py-2 rounded-sm bg-acid text-black font-semibold hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(184,255,87,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {nameSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
            {nameMsg && <div className="mt-2"><Toast {...nameMsg} /></div>}
          </div>
        </div>
      </Section>

      {/* Change Email */}
      <Section
        title="Change Email"
        subtitle="A confirmation link is sent to both your old and new email addresses."
      >
        <div className="space-y-3">
          <div>
            <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
              New email address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className="w-full font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 focus:bg-v-bg2 transition-colors"
            />
          </div>
          {emailMsg && <Toast {...emailMsg} />}
          <button
            onClick={handleChangeEmail}
            disabled={emailSaving || !newEmail.trim()}
            className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-widest px-5 py-2.5 rounded-sm border border-v-border text-foreground hover:border-white/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {emailSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Send confirmation
          </button>
        </div>
      </Section>

      {/* Change Password */}
      <Section
        title="Change Password"
        subtitle="Minimum 8 characters. You'll stay signed in after changing."
      >
        <div className="space-y-3">
          <div className="relative">
            <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
              New password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password"
                className="w-full font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 pr-10 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 focus:bg-v-bg2 transition-colors"
              />
              <button
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-v-muted2 hover:text-acid transition-colors"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
              Confirm password
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              className="w-full font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 focus:bg-v-bg2 transition-colors"
            />
          </div>
          {pwMsg && <Toast {...pwMsg} />}
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !newPw || !confirmPw}
            className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-widest px-5 py-2.5 rounded-sm border border-v-border text-foreground hover:border-white/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Update password
          </button>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" subtitle="This action permanently deletes your account and all data.">
        <div className="space-y-3">
          <div className="font-mono text-[11.5px] text-v-muted leading-relaxed">
            Deleting your account will permanently remove all scans, API keys, Sentinel
            watches, and billing data. This action is{" "}
            <span className="text-v-red font-semibold">irreversible</span>.
          </div>
          <div>
            <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
              Type <span className="text-v-red font-bold">DELETE</span> to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full font-mono text-[13px] bg-v-bg1 border border-v-red/20 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-v-red/50 transition-colors"
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting || deleteConfirm !== "DELETE"}
            className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-widest px-5 py-2.5 rounded-sm border border-v-red/30 text-v-red hover:bg-v-red/10 hover:border-v-red/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Delete my account
          </button>
        </div>
      </Section>
    </div>
  );
}
