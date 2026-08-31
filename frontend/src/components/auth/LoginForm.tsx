"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Loader2, AlertTriangle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

/* ── Main form ── */
export default function LoginForm({ message, redirectTo }: { message?: string; redirectTo?: string }) {
  const router = useRouter();
  const [showPw, setShowPw]   = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Only allow relative paths — reject absolute URLs to prevent open redirect attacks
  const afterLoginPath =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.includes('://')
      ? redirectTo
      : '/scanner';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form     = e.currentTarget;
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }

      // Wait for @supabase/ssr to persist session cookies before navigating
      await new Promise(r => setTimeout(r, 150));
      router.push(afterLoginPath);
      router.refresh();
    } catch {
      setError(
        "Authentication service unavailable. " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in Railway environment variables."
      );
      setPending(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4.5">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-v-red/10 border border-v-red/30 rounded-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-v-red shrink-0 mt-0.5" />
            <p className="font-mono text-[10.5px] text-v-red leading-relaxed">{error}</p>
          </div>
        )}

        {/* Info banner (e.g. "Check your email") */}
        {message && !error && (
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
            <Link href="/forgot-password" className="text-[9.5px] font-mono text-v-muted2 hover:text-acid transition-colors">Forgot Key?</Link>
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
