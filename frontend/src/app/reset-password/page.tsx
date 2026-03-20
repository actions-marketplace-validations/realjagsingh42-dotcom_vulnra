"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import VulnraLogo from "@/components/VulnraLogo";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPw,   setShowPw]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pending,  setPending]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form     = e.currentTarget;
    const password = (form.elements.namedItem("password")    as HTMLInputElement).value;
    const confirm  = (form.elements.namedItem("confirm")     as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/scanner"), 2500);
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-acid/10 rounded-full blur-[80px] animate-[orb1_12s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-v-red/5 rounded-full blur-[80px] animate-[orb2_14s_ease-in-out_infinite] pointer-events-none" />

      {/* Minimal nav */}
      <div className="h-14 flex items-center justify-between px-6 md:px-10 relative z-10">
        <Link href="/"><VulnraLogo /></Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[460px] bg-v-bg1 border border-v-border rounded-lg relative overflow-hidden animate-[fadeUp_0.6s_ease_forwards_0.1s]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/40 to-transparent" />

          <div className="p-8 pb-6 border-b border-v-border2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.26em] text-acid">
              <div className="w-1.25 h-1.25 rounded-full bg-acid animate-pulse" />
              SET_NEW_KEY
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground">New Access Key</h1>
            <p className="text-sm text-v-muted font-light leading-relaxed">
              Choose a strong password. Minimum 8 characters.
            </p>
          </div>

          <div className="p-8 flex flex-col gap-4.5">
            {!done ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
                {error && (
                  <div className="flex items-start gap-2.5 px-3 py-2.5 bg-v-red/10 border border-v-red/30 rounded-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-v-red shrink-0 mt-0.5" />
                    <p className="font-mono text-[10.5px] text-v-red leading-relaxed">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-1.75">
                  <label className="text-[9px] font-mono tracking-widest uppercase text-v-muted2">New Password</label>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-3.25 w-4 h-4 text-v-muted2 group-focus-within:text-acid transition-colors" />
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      required
                      minLength={8}
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

                <div className="flex flex-col gap-1.75">
                  <label className="text-[9px] font-mono tracking-widest uppercase text-v-muted2">Confirm Password</label>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-3.25 w-4 h-4 text-v-muted2 group-focus-within:text-acid transition-colors" />
                    <input
                      name="confirm"
                      type={showConf ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-v-border rounded-sm py-2.75 pl-10 pr-10 text-xs font-mono outline-none focus:border-acid/40 focus:bg-acid/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(!showConf)}
                      className="absolute right-3.25 text-v-muted2 hover:text-foreground transition-colors"
                    >
                      {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> UPDATING KEY...</>
                  ) : (
                    <>SET_NEW_KEY <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="w-12 h-12 rounded-full bg-acid/10 border border-acid/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-acid" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm font-bold text-foreground mb-2">KEY_UPDATED</p>
                  <p className="font-mono text-[11px] text-v-muted leading-relaxed">
                    Your password has been updated successfully. Redirecting to your dashboard...
                  </p>
                </div>
                <Loader2 className="w-4 h-4 text-acid animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
