"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome, Loader2, AlertTriangle } from "lucide-react";
import { signup } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

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
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> CREATING ACCOUNT...</>
      ) : (
        <>GENERATE_PROFILE <ArrowRight className="w-3.5 h-3.5" /></>
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
export default function SignupForm({ error }: { error?: string }) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="card w-full max-w-[460px] bg-v-bg1 border border-v-border rounded-lg relative overflow-hidden z-10 animate-[fadeUp_0.6s_ease_forwards_0.1s]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/40 to-transparent" />

      <div className="p-8 pb-6 border-b border-v-border2 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.26em] text-acid">
          <div className="w-1.25 h-1.25 rounded-full bg-acid animate-pulse" />
          OPERATOR_REGISTRATION
        </div>
        <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground">Create Account</h1>
        <p className="text-sm text-v-muted font-light leading-relaxed">
          Register your identity to start AI vulnerability audits.
        </p>
      </div>

      <form action={signup} className="p-8 flex flex-col gap-4.5">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-v-red/10 border border-v-red/30 rounded-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-v-red shrink-0 mt-0.5" />
            <p className="font-mono text-[10.5px] text-v-red leading-relaxed">
              {decodeURIComponent(error)}
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
          <label className="text-[9px] font-mono tracking-widest uppercase text-v-muted2">Access Key (Password)</label>
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
          Registered?{" "}
          <Link href="/login" className="text-acid underline underline-offset-4">
            Identity Verification
          </Link>
        </p>
      </form>
    </div>
  );
}
