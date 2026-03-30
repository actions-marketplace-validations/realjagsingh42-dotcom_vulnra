"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, Twitter, Linkedin, Facebook, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  shareUrl: string;
  riskScore: number;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export default function SocialShare({
  shareUrl,
  riskScore,
  findingsCount,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const severityStr = `${criticalCount}C ${highCount}H ${mediumCount}M ${lowCount}L`;

  const shareText = `🔒 LLM Security Scan Complete

Risk Score: ${riskScore}/100
Findings: ${findingsCount} vulnerabilities (${severityStr})

Scanned with VULNRA - AI Vulnerability Scanner`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    setLoading("copy");
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    } finally {
      setLoading(null);
    }
  };

  const handleShare = (url: string, platform: string) => {
    setLoading(platform);
    window.open(url, "_blank", "width=600,height=400,noopener,noreferrer");
    setTimeout(() => {
      setLoading(null);
      setIsOpen(false);
    }, 500);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 text-[9px] font-mono tracking-wider px-2 py-1 rounded-sm border transition-all",
          isOpen
            ? "border-acid/50 text-acid bg-acid/10"
            : "border-v-border text-v-muted2 hover:border-white/15 hover:text-v-muted"
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Link2 className="w-3 h-3" />
        )}
        SHARE
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[180px] rounded-lg z-[100] overflow-hidden"
          style={{
            background: "#0A0B0F",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] font-mono text-v-muted2 tracking-wider">Share Scan Results</span>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleShare(twitterUrl, "twitter")}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors disabled:opacity-50"
              style={{ color: "#C8D0DC", fontSize: 12 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Twitter className="w-4 h-4" style={{ color: "#1DA1F2" }} />
              <span>Twitter / X</span>
            </button>

            <button
              onClick={() => handleShare(linkedinUrl, "linkedin")}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors disabled:opacity-50"
              style={{ color: "#C8D0DC", fontSize: 12 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Linkedin className="w-4 h-4" style={{ color: "#0A66C2" }} />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => handleShare(facebookUrl, "facebook")}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors disabled:opacity-50"
              style={{ color: "#C8D0DC", fontSize: 12 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Facebook className="w-4 h-4" style={{ color: "#1877F2" }} />
              <span>Facebook</span>
            </button>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={handleCopyLink}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors disabled:opacity-50"
                style={{ color: "#C8D0DC", fontSize: 12 }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {loading === "copy" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : copied ? (
                  <span className="text-acid text-[14px]">✓</span>
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
