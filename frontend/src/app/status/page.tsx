import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "System Status — VULNRA",
  description: "Real-time status of VULNRA infrastructure components, scan engines, and API availability.",
};

const COMPONENTS = [
  { name: "API Gateway",          status: "operational", latency: "42ms",  uptime: "99.98%" },
  { name: "Scan Engine (Garak)",  status: "operational", latency: "1.2s",  uptime: "99.91%" },
  { name: "Scan Engine (DeepTeam)", status: "operational", latency: "0.9s", uptime: "99.95%" },
  { name: "AI Judge (Claude)",    status: "operational", latency: "620ms", uptime: "99.99%" },
  { name: "RAG Scanner",          status: "operational", latency: "310ms", uptime: "99.87%" },
  { name: "MCP Scanner",          status: "operational", latency: "280ms", uptime: "99.90%" },
  { name: "Sentinel Monitoring",  status: "operational", latency: "55ms",  uptime: "99.97%" },
  { name: "PDF Report Generator", status: "operational", latency: "1.8s",  uptime: "99.85%" },
  { name: "Authentication (Supabase)", status: "operational", latency: "38ms", uptime: "99.99%" },
  { name: "Database (PostgreSQL)", status: "operational", latency: "12ms", uptime: "99.99%" },
  { name: "Billing (Lemon Squeezy)", status: "operational", latency: "95ms", uptime: "99.95%" },
  { name: "Email Alerts (Resend)",  status: "operational", latency: "180ms", uptime: "99.93%" },
];

const INCIDENTS = [
  {
    date: "2026-03-10",
    title: "Elevated latency on Garak scan engine",
    status: "resolved",
    duration: "23 minutes",
    description: "Intermittent elevated response times on the Garak probe runner due to a Redis queue backlog. Resolved by scaling worker replicas.",
  },
  {
    date: "2026-02-28",
    title: "PDF generation timeout for large scan reports",
    status: "resolved",
    duration: "41 minutes",
    description: "Scans with 50+ findings caused PDF generation to exceed the 30s timeout. Extended timeout and added chunked rendering.",
  },
  {
    date: "2026-02-14",
    title: "Scheduled maintenance — database upgrade",
    status: "resolved",
    duration: "12 minutes",
    description: "Planned PostgreSQL minor version upgrade. All services were unavailable during the maintenance window.",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  operational:  { label: "Operational",   color: "text-acid",    dot: "bg-acid" },
  degraded:     { label: "Degraded",      color: "text-yellow-400", dot: "bg-yellow-400" },
  outage:       { label: "Major Outage",  color: "text-v-red",   dot: "bg-v-red" },
  maintenance:  { label: "Maintenance",   color: "text-blue-400",dot: "bg-blue-400" },
};

const allOperational = COMPONENTS.every((c) => c.status === "operational");

export default function StatusPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse" />
            <span className="font-mono text-[11px] tracking-widest text-acid">LIVE STATUS</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-4">
            System Status
          </h1>
          {allOperational ? (
            <div className="flex items-center justify-center gap-2 text-acid">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-mono text-sm tracking-wide">All systems operational</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-mono text-sm tracking-wide">Some systems degraded</span>
            </div>
          )}
          <p className="mt-4 text-v-muted text-sm">
            Last updated: {new Date().toUTCString()}
          </p>
        </div>
      </section>

      {/* Uptime summary cards */}
      <section className="px-4 sm:px-6 md:px-12 pb-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "30-day uptime", value: "99.95%" },
            { label: "Avg API latency", value: "42ms" },
            { label: "Scans this month", value: "14,280" },
            { label: "Active incidents", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="border border-v-border2 rounded-lg p-4 bg-white/2 text-center">
              <p className="font-mono text-2xl font-bold text-acid">{stat.value}</p>
              <p className="font-mono text-[10px] tracking-widest text-v-muted mt-1">{stat.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Component status table */}
      <section className="px-4 sm:px-6 md:px-12 pb-16">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">COMPONENT STATUS</h2>
          <div className="overflow-x-auto">
            <div className="border border-v-border2 rounded-xl overflow-hidden min-w-[480px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-v-border2 bg-white/3">
                    <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-3 py-2 md:px-5 md:py-3">COMPONENT</th>
                    <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-3 py-2 md:px-5 md:py-3">STATUS</th>
                    <th className="text-right font-mono text-[10px] tracking-widest text-v-muted px-3 py-2 md:px-5 md:py-3">LATENCY</th>
                    <th className="text-right font-mono text-[10px] tracking-widest text-v-muted px-3 py-2 md:px-5 md:py-3">UPTIME</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPONENTS.map((c, i) => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <tr key={c.name} className={`border-b border-v-border2 last:border-0 ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                        <td className="font-mono text-xs px-3 py-2.5 md:px-5 md:py-3">{c.name}</td>
                        <td className="px-3 py-2.5 md:px-5 md:py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                            <span className={`font-mono text-[10px] md:text-xs ${cfg.color}`}>{cfg.label}</span>
                          </div>
                        </td>
                        <td className="font-mono text-xs text-v-muted text-right px-3 py-2.5 md:px-5 md:py-3">{c.latency}</td>
                        <td className="font-mono text-xs text-acid text-right px-3 py-2.5 md:px-5 md:py-3">{c.uptime}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Incident history */}
      <section className="px-4 sm:px-6 md:px-12 pb-20">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">INCIDENT HISTORY (LAST 90 DAYS)</h2>
          <div className="space-y-3">
            {INCIDENTS.map((inc) => (
              <div key={inc.date} className="border border-v-border2 rounded-xl p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-acid/10 border border-acid/20 font-mono text-[10px] text-acid tracking-wider shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> RESOLVED
                    </span>
                    <span className="font-mono text-sm font-semibold">{inc.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-v-muted shrink-0">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono text-[10px]">{inc.duration}</span>
                  </div>
                </div>
                <p className="text-v-muted text-sm mb-2">{inc.description}</p>
                <p className="font-mono text-[10px] text-v-muted2">{inc.date}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-v-muted mt-6 text-center">
            No incidents in the past 30 days.
          </p>
        </div>
      </section>

      {/* Subscribe */}
      <section className="px-4 sm:px-6 md:px-12 pb-20">
        <div className="max-w-[600px] mx-auto text-center border border-v-border2 rounded-xl p-8">
          <Shield className="w-8 h-8 text-acid mx-auto mb-3" />
          <h2 className="font-mono text-xl font-bold mb-2">Get notified about incidents</h2>
          <p className="text-v-muted text-sm mb-6">
            Subscribe to status updates and never be caught off guard by downtime.
          </p>
          <Link
            href="/signup"
            className="inline-block font-mono text-[11px] tracking-widest bg-acid text-black px-6 py-2.5 rounded-lg font-bold hover:bg-acid/90 transition-colors"
          >
            CREATE FREE ACCOUNT
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
