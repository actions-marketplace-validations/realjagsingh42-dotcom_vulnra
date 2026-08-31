import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShieldTab from "../ShieldTab";
import type { InterceptEvent, PolicyPack } from "@/types/api";

// ── Mock API module ─────────────────────────────────────────────────────────

const mockGetInterceptEvents = vi.fn();
const mockGetPolicyPacks = vi.fn();

vi.mock("@/utils/api-client", () => ({
  getInterceptEvents: (...args: unknown[]) => mockGetInterceptEvents(...args),
  getPolicyPacks: (...args: unknown[]) => mockGetPolicyPacks(...args),
  getComplianceSummary: vi.fn().mockResolvedValue({ by_event_type: {}, by_owasp_category: {} }),
  activatePolicyPack: vi.fn().mockResolvedValue({ success: true }),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<InterceptEvent>): InterceptEvent {
  return {
    id: "evt-" + Math.random().toString(36).slice(2, 8),
    scan_id: "test-123",
    probe_index: null,
    timestamp: new Date().toISOString(),
    prompt: "Test prompt content",
    action_taken: "ALLOW",
    pii_detected: false,
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ShieldTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton loader on initial load", async () => {
    const neverResolve = new Promise<InterceptEvent[]>(() => {});
    mockGetInterceptEvents.mockReturnValue(neverResolve);
    mockGetPolicyPacks.mockReturnValue(neverResolve);

    render(<ShieldTab scanId="test-123" scanStatus="running" isAdmin={false} />);

    expect(screen.getByText("Intercept Events")).toBeInTheDocument();
    expect(screen.queryByText("No intercept events yet")).not.toBeInTheDocument();
  });

  it("renders DENY badge with red background class", async () => {
    const event = makeEvent({ action_taken: "DENY" });
    mockGetInterceptEvents.mockResolvedValue([event]);
    mockGetPolicyPacks.mockResolvedValue([]);

    render(<ShieldTab scanId="test-123" scanStatus="complete" isAdmin={false} />);

    await waitFor(() => {
      expect(screen.getByText("Denied")).toBeInTheDocument();
    });

    const badge = screen.getByText("Denied");
    expect(badge.className).toContain("bg-v-red");
  });

  it("renders empty state when no events exist", async () => {
    mockGetInterceptEvents.mockResolvedValue([]);
    mockGetPolicyPacks.mockResolvedValue([]);

    render(<ShieldTab scanId="test-123" scanStatus="complete" isAdmin={false} />);

    await waitFor(() => {
      expect(screen.getByText("No intercept events yet")).toBeInTheDocument();
    });
  });

  it("shows COVERED status in heatmap for prompt_injection intent", async () => {
    const event = makeEvent({
      intent: "prompt_injection",
      action_taken: "DENY",
    });
    mockGetInterceptEvents.mockResolvedValue([event]);
    mockGetPolicyPacks.mockResolvedValue([
      { name: "hipaa_pack", rule_count: 8, filename: "hipaa_pack.yaml" } as PolicyPack,
    ]);

    render(<ShieldTab scanId="test-123" scanStatus="complete" isAdmin={false} />);

    await waitFor(() => {
      expect(screen.getByText("Covered")).toBeInTheDocument();
    });

    const llm01Cells = screen.getAllByText(/LLM01/);
    expect(llm01Cells.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Prompt Injection")).toBeInTheDocument();
  });
});
