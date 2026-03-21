"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/auth/actions";

interface AuthState {
  loading: boolean;
  email: string | null;
}

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ loading: true, email: null });

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* auth state */
  useEffect(() => {
    // Safety net: if Supabase client creation fails (missing env vars) or the
    // session check never resolves, fall back to logged-out state after 3s so
    // SIGN IN / START FREE are always visible within a short time.
    const fallback = setTimeout(
      () => setAuth(prev => (prev.loading ? { loading: false, email: null } : prev)),
      3000,
    );

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const supabase = createClient();

      supabase.auth.getSession().then(({ data: { session } }) => {
        clearTimeout(fallback);
        setAuth({ loading: false, email: session?.user?.email ?? null });
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        clearTimeout(fallback);
        setAuth({ loading: false, email: session?.user?.email ?? null });
      });
      subscription = data.subscription;
    } catch {
      // env vars missing or client creation failed — show logged-out nav immediately
      clearTimeout(fallback);
      setAuth({ loading: false, email: null });
    }

    return () => {
      clearTimeout(fallback);
      subscription?.unsubscribe();
    };
  }, []);

  const loggedIn = !auth.loading && !!auth.email;
  const initial = auth.email ? auth.email[0].toUpperCase() : "U";

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 sm:px-6 md:px-10 transition-colors duration-200 ${
        scrolled
          ? "bg-[#060608] border-b border-white/[0.06] md:bg-[#060608]/90 md:backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="vulnra-logo-mark" style={{
          width: 28, height: 28, borderRadius: 5,
          background: "#060608", border: "1.5px solid #b8ff57",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, position: "relative",
          animation: "neonBoxPulse 2s ease-in-out infinite",
        }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="7.5" height="7.5" rx=".8" fill="#b8ff57" style={{animation:"neonSqSeq 2.4s ease-in-out infinite 0s"}} />
            <rect x="11.5" y="1" width="7.5" height="7.5" rx=".8" fill="#b8ff57" style={{animation:"neonSqSeq 2.4s ease-in-out infinite 0.3s"}} />
            <rect x="1" y="11.5" width="7.5" height="7.5" rx=".8" fill="#b8ff57" style={{animation:"neonSqSeq 2.4s ease-in-out infinite 0.6s"}} />
            <rect x="11.5" y="11.5" width="7.5" height="7.5" rx=".8" fill="#b8ff57" style={{animation:"neonSqSeq 2.4s ease-in-out infinite 0.9s"}} />
            <circle cx="14.25" cy="16.75" r="1.1" fill="#b8ff57" style={{animation:"neonDotPulse 1.2s ease-in-out infinite 0s"}} />
            <circle cx="17.25" cy="16.75" r="1.1" fill="#b8ff57" style={{animation:"neonDotPulse 1.2s ease-in-out infinite 0.5s"}} />
          </svg>
        </div>
        <span className="font-mono text-sm font-bold tracking-wider">
          VULN<span style={{color:"#b8ff57"}}>RA</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/#features" className="font-mono text-[11px] tracking-widest text-v-muted hover:text-acid transition-colors">FEATURES</Link>
        <Link href="/pricing"   className="font-mono text-[11px] tracking-widest text-v-muted hover:text-acid transition-colors">PRICING</Link>
        <Link href="/docs"      className="font-mono text-[11px] tracking-widest text-v-muted hover:text-acid transition-colors">DOCS</Link>

        {auth.loading ? (
          /* placeholder so layout doesn't jump */
          <div className="w-20 h-5 rounded-sm bg-white/[0.04] animate-pulse" />
        ) : loggedIn ? (
          /* ── Logged-in state ── */
          <div className="flex items-center gap-4">
            <Link
              href="/scanner"
              className="font-mono text-[10.5px] font-semibold tracking-widest bg-acid text-black px-4 py-2 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(184,255,87,0.28)] transition-all"
            >
              DASHBOARD →
            </Link>
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 group"
              title={auth.email ?? ""}
            >
              <span className="w-7 h-7 rounded-full bg-acid text-black font-mono font-bold text-[12px] flex items-center justify-center group-hover:ring-2 group-hover:ring-acid/40 transition-all">
                {initial}
              </span>
              <span className="font-mono text-[11px] text-v-muted group-hover:text-foreground transition-colors max-w-[120px] truncate">
                {auth.email?.split("@")[0]}
              </span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-v-muted2 hover:text-v-red transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* ── Logged-out state ── */
          <>
            <Link href="/login" className="font-mono text-[11px] tracking-widest text-v-muted hover:text-acid transition-colors">SIGN IN</Link>
            <Link
              href="/quick-scan"
              className="font-mono text-[10.5px] font-semibold tracking-widest bg-acid text-black px-4 py-2 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(184,255,87,0.28)] transition-all"
            >
              START FREE
            </Link>
          </>
        )}
      </div>

      {/* Mobile right side */}
      <div className="flex md:hidden items-center gap-3">
        {loggedIn ? (
          <Link
            href="/scanner"
            className="font-mono text-[10px] font-semibold tracking-widest bg-acid text-black px-3 py-1.5 rounded-sm"
          >
            DASHBOARD
          </Link>
        ) : (
          <Link
            href="/quick-scan"
            className="font-mono text-[10px] font-semibold tracking-widest bg-acid text-black px-3 py-1.5 rounded-sm"
          >
            SCAN FREE
          </Link>
        )}
        <button
          className="p-1 text-v-muted hover:text-acid transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-14 inset-x-0 bg-[#0a0b0f] border-b border-v-border2 flex flex-col p-5 gap-4 md:hidden">
          <Link href="/#features" className="font-mono text-[13px] tracking-widest text-v-muted hover:text-acid transition-colors py-1" onClick={() => setMenuOpen(false)}>FEATURES</Link>
          <Link href="/pricing"   className="font-mono text-[13px] tracking-widest text-v-muted hover:text-acid transition-colors py-1" onClick={() => setMenuOpen(false)}>PRICING</Link>
          <Link href="/docs"      className="font-mono text-[13px] tracking-widest text-v-muted hover:text-acid transition-colors py-1" onClick={() => setMenuOpen(false)}>DOCS</Link>

          {loggedIn ? (
            <>
              <Link href="/settings/profile" className="font-mono text-[13px] tracking-widest text-v-muted hover:text-acid transition-colors py-1" onClick={() => setMenuOpen(false)}>
                {auth.email?.split("@")[0]} — PROFILE
              </Link>
              <div className="border-t border-v-border2 pt-3 flex flex-col gap-2">
                <Link href="/scanner" className="block font-mono text-[11px] font-semibold tracking-widest bg-acid text-black px-4 py-3 rounded-sm text-center" onClick={() => setMenuOpen(false)}>
                  GO TO DASHBOARD →
                </Link>
                <form action={signOut}>
                  <button type="submit" className="w-full font-mono text-[11px] tracking-widest border border-v-red/30 text-v-red px-4 py-2.5 rounded-sm text-center hover:bg-v-red/10 transition-colors">
                    SIGN OUT
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="font-mono text-[13px] tracking-widest text-v-muted hover:text-acid transition-colors py-1" onClick={() => setMenuOpen(false)}>SIGN IN</Link>
              <div className="border-t border-v-border2 pt-3">
                <Link href="/quick-scan" className="block font-mono text-[11px] font-semibold tracking-widest bg-acid text-black px-4 py-3 rounded-sm text-center" onClick={() => setMenuOpen(false)}>
                  SCAN FREE — NO ACCOUNT NEEDED
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
