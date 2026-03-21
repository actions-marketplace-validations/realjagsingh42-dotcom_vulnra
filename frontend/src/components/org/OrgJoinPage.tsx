"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, CheckCircle2, AlertTriangle, Loader2, LogIn, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import VulnraLogo from "@/components/VulnraLogo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vulnra-production.up.railway.app";

interface InvitePreview {
  org_name: string;
  org_id: string;
  role: string;
  valid: boolean;
}

type PageState = "loading" | "preview" | "accepting" | "success" | "error" | "already_accepted" | "expired";

export default function OrgJoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<PageState>("loading");
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // 1. Load invite preview + session in parallel
  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMsg("No invite token found in URL. Please use the link from your invitation email.");
      return;
    }

    const sb = createClient();

    Promise.all([
      fetch(`${API_BASE}/api/org/join?token=${encodeURIComponent(token)}`).then(r => r.json()),
      sb.auth.getSession(),
    ]).then(([inviteData, { data: { session } }]) => {
      if (inviteData.detail === "Invite not found." || inviteData.detail === "Invalid token.") {
        setState("error");
        setErrorMsg("This invite link is invalid or has expired.");
        return;
      }
      if (inviteData.detail === "This invite has already been accepted.") {
        setState("already_accepted");
        return;
      }
      if (inviteData.detail) {
        setState("error");
        setErrorMsg(inviteData.detail);
        return;
      }
      setInvite(inviteData as InvitePreview);
      setIsLoggedIn(!!session);
      setState("preview");
    }).catch(() => {
      setState("error");
      setErrorMsg("Failed to load invite. Please try again.");
    });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
      // Redirect to login, come back here after
      router.push(`/login?redirect=${encodeURIComponent(`/org/join?token=${token}`)}`);
      return;
    }

    setAccepting(true);
    setState("accepting");

    try {
      const res = await fetch(`${API_BASE}/api/org/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setState("already_accepted");
        } else if (res.status === 410) {
          setState("expired");
        } else {
          setState("error");
          setErrorMsg(data.detail || `HTTP ${res.status}`);
        }
        return;
      }

      setInvite(prev => prev ? { ...prev, org_name: data.org_name, role: data.role } : prev);
      setState("success");

      // Auto-redirect to org dashboard after 2 seconds
      setTimeout(() => router.push("/org"), 2000);
    } catch {
      setState("error");
      setErrorMsg("Network error — please try again.");
    } finally {
      setAccepting(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col h-screen bg-background font-sans">
      <nav className="h-13 bg-v-bg1 border-b border-v-border2 flex items-center px-5 shrink-0">
        <a href="/"><VulnraLogo suffix="PLATFORM" /></a>
      </nav>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );

  if (state === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="w-8 h-8 animate-spin text-acid" />
          <p className="text-sm font-mono text-v-muted">Loading invite…</p>
        </div>
      </Shell>
    );
  }

  if (state === "success") {
    return (
      <Shell>
        <div className="p-8 bg-v-bg1 border border-green-400/20 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-400/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-mono text-base font-bold text-white">Welcome aboard!</h2>
          <p className="text-sm text-v-muted">
            You&apos;ve joined <span className="text-white font-semibold">{invite?.org_name}</span> as a{" "}
            <span className="text-acid font-mono">{invite?.role}</span>.
          </p>
          <p className="text-[11px] font-mono text-v-muted2 animate-pulse">
            Redirecting to your org dashboard…
          </p>
        </div>
      </Shell>
    );
  }

  if (state === "already_accepted") {
    return (
      <Shell>
        <div className="p-8 bg-v-bg1 border border-v-border2 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-acid/10 border border-acid/20 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-acid" />
          </div>
          <h2 className="font-mono text-base font-bold text-white">Already Accepted</h2>
          <p className="text-sm text-v-muted">This invite has already been used.</p>
          <a
            href="/org"
            className="inline-flex items-center gap-2 bg-acid text-black font-mono text-xs font-bold px-5 py-2.5 rounded hover:bg-acid/90 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            Go to Org Dashboard
          </a>
        </div>
      </Shell>
    );
  }

  if (state === "expired") {
    return (
      <Shell>
        <div className="p-8 bg-v-bg1 border border-red-400/20 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-400/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-mono text-base font-bold text-white">Invite Expired</h2>
          <p className="text-sm text-v-muted">
            This invite link has expired (invites are valid for 7 days).
            Please ask your organization admin to send a new invitation.
          </p>
        </div>
      </Shell>
    );
  }

  if (state === "error") {
    return (
      <Shell>
        <div className="p-8 bg-v-bg1 border border-red-400/20 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-400/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-mono text-base font-bold text-white">Invalid Invite</h2>
          <p className="text-sm text-v-muted">{errorMsg}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 border border-v-border2 text-v-muted font-mono text-xs px-4 py-2 rounded hover:border-acid/30 hover:text-acid transition-colors"
          >
            Back to Home
          </a>
        </div>
      </Shell>
    );
  }

  // preview / accepting states
  return (
    <Shell>
      <div className="p-8 bg-v-bg1 border border-v-border2 rounded-xl space-y-6">
        {/* Org icon + name */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-acid" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-v-muted2 tracking-widest mb-1">YOU&apos;VE BEEN INVITED TO JOIN</p>
            <h1 className="font-mono text-xl font-bold text-white">{invite?.org_name}</h1>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-v-muted2">AS</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                invite?.role === "admin"
                  ? "border-acid/40 bg-acid/10 text-acid"
                  : "border-v-border text-v-muted"
              }`}>
                {invite?.role}
              </span>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="space-y-2">
          {[
            "Access shared scans and vulnerability findings",
            "Collaborate with your security team",
            "View organization-wide analytics",
            ...(invite?.role === "admin"
              ? ["Manage members and view audit logs"]
              : []),
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-v-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              {benefit}
            </div>
          ))}
        </div>

        {/* Auth notice for logged-out users */}
        {!isLoggedIn && (
          <div className="flex items-start gap-2 p-3 bg-v-bg2 border border-v-border rounded text-[11px] font-mono text-v-muted">
            <LogIn className="w-3.5 h-3.5 text-acid shrink-0 mt-0.5" />
            You&apos;ll be asked to sign in or create an account before joining.
          </div>
        )}

        {/* Accept button */}
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full flex items-center justify-center gap-2 bg-acid text-black font-mono text-xs font-bold tracking-wider py-3 rounded hover:bg-acid/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />JOINING…</>
          ) : (
            <><Users className="w-4 h-4" />ACCEPT INVITATION</>
          )}
        </button>

        <p className="text-center text-[10px] text-v-muted2">
          By accepting you agree to share your scan activity with members of this organization.
        </p>
      </div>
    </Shell>
  );
}
