"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight, Loader2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import { login } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/client";

/* ── Submit button — reads pending state from parent <form> ── */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "mt-2 w-full bg-acid text-black font-mono text-[10.5px] font-bold tracking-widest py-3 rounded-sm transition-all flex items-center justify-center gap-1.5",
        pending
          ? "opacity-70 cursor-not-allowed"
          : "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(184,255,87,0.3)]"
      )}
    >
      {pending ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> AUTHENTICATING...</>
      ) : (
        <>AUTHENTICATE <ArrowRight className="w-3.5 h-3.5" /></>
      )}
    </button>
  );
}

/* ── OAuth button with its own loading state ── */
function OAuthButton({
  provider,
  label,
  icon: Icon,
}: {
  provider: "github" | "google";
  label: string;
  icon: React.ElementType;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/scanner` },
    });
    // browser navigates away — no need to reset loading
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center gap-2 bg-white/5 border border-v-border rounded-sm py-2.5 text-[10px] font-mono transition-colors",
        loading ? "opacity-60 cursor-not-allowed" : "hover:bg-white/10"
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

/* ── Main form ── */
export default function LoginForm({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="card w-full max-w-[460px] bg-v-bg1 border border-v-border rounded-lg relative overflow-hidden z-10 opacity-0 animate-[fadeUp_0.6s_ease_forwards_0.1s]">
      {/* Top Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/40 to-transparent" />

      {/* Scanline Animation */}
      <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/35 to-transparent animate-[scanH_6s_ease-in-out_infinite_2s] pointer-events-none z-20" />

      <div className="p-8 pb-6 border-b border-v-border2 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.26em] text-acid">
          <div className="w-1.25 h-1.25 rounded-full bg-acid animate-pulse" />
          SECURE_ACCESS_GATE
        </div>
        <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground">Sign In</h1>
        <p className="text-sm text-v-muted font-light leading-relaxed">
          Access your vulnerability dashboard and scanning suite.
        </p>
      </div>

      <form action={login} className="p-8 flex flex-col gap-4.5">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-v-red/10 border border-v-red/30 rounded-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-v-red shrink-0 mt-0.5" />
            <p className="font-mono text-[10.5px] text-v-red leading-relaxed">
              {decodeURIComponent(error)}
            </p>
          </div>
        )}

        {/* Info/success banner (e.g. "Check your email") */}
        {message && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-acid/10 border border-acid/30 rounded-sm">
            <Info className="w-3.5 h-3.5 text-acid shrink-0 mt-0.5" />
            <p className="font-mono text-[10.5px] text-acid leading-relaxed">
              {decodeURIComponent(message)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.75">
          <label className="text-[9px] font-mono tracking-widest uppercase text-v-muted2">Email Address</label>
          <div className="relative flex items-center group">
            <Mail className="absolute left-3.25 w-4 h-4 text-v-muted2 group-focus-within:text-acid transition-colors" />
            <input
              name="email"
              type="email"
              required
              placeholder="operator@vulnra.ai"
              className="w-full bg-white/5 border border-v-border rounded-sm py-2.75 pl-10 pr-3.5 text-xs font-mono outline-none focus:border-acid/40 focus:bg-acid/5 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.75">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-mono tracking-widest uppercase text-v-muted2">Authorization Key</label>
            <Link href="#" className="text-[9.5px] font-mono text-v-muted2 hover:text-acid transition-colors">Forgot Key?</Link>
          </div>
          <div className="relative flex items-center group">
            <Lock className="absolute left-3.25 w-4 h-4 text-v-muted2 group-focus-within:text-acid transition-colors" />
            <input
              name="password"
              type={showPw ? "text" : "password"}
              required
              placeholder="••••••••••••"
              className="w-full bg-white/5 border border-v-border rounded-sm py-2.75 pl-10 pr-10 text-xs font-mono outline-none focus:border-acid/40 focus:bg-acid/5 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.25 text-v-muted2 hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <SubmitButton />

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-[1px] bg-v-border" />
          <span className="text-[9px] font-mono tracking-widest text-v-muted2 uppercase">Or Continue With</span>
          <div className="flex-1 h-[1px] bg-v-border" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <OAuthButton provider="github" label="GITHUB" icon={Github} />
          <OAuthButton provider="google" label="GOOGLE" icon={Chrome} />
        </div>

        <p className="mt-4 text-center text-[10px] font-mono text-v-muted2">
          New Operator?{" "}
          <Link href="/signup" className="text-acid underline underline-offset-4">
            Register Manifest
          </Link>
        </p>
      </form>
    </div>
  );
}
