import sys
import os
import logging
import json
import time

# Mocking parts of the app for testing the engine logic
class MockLogger:
    def info(self, msg): print(f"INFO: {msg}")
    def error(self, msg): print(f"ERROR: {msg}")
    def warning(self, msg): print(f"WARNING: {msg}")

logger = MockLogger()

def test_multi_engine():
    print("Starting Multi-Engine Scan Verification (Self-Contained)...")
    
    scan_id = "multi-test-999"
    url = "http://localhost:9999"
    tier = "pro"
    
    print(f"Running scan {scan_id} for {url} [Tier: {tier}]...")
    
    findings = []
    compliance = {}
    scan_engines = []
    max_risk = 0.0
    
    # ── 1. Garak Scan ───────────────────────────────────────────
    try:
        from app.garak_engine import run_garak_scan
        print("Calling Garak Engine...")
        garak_res = run_garak_scan(scan_id, url, tier)
        if garak_res.get("status") == "complete":
            findings.extend(garak_res.get("findings", []))
            scan_engines.append(garak_res.get("scan_engine", "garak"))
            max_risk = max(max_risk, float(garak_res.get("risk_score", 0)))
            print("✓ Garak Engine returned results.")
        else:
            print(f"! Garak Engine returned status: {garak_res.get('status')}")
    except Exception as e:
        print(f"✗ Garak engine failed: {e}")

    # ── 2. DeepTeam Scan ────────────────────────────────────────
    try:
        from app.deepteam_engine import run_deepteam_scan
        print("Calling DeepTeam Engine...")
        # Note: If no API key, it should skip gracefully with internal check
        dt_res = run_deepteam_scan(scan_id, url, tier)
        if dt_res.get("status") == "complete":
            findings.extend(dt_res.get("findings", []))
            scan_engines.append(dt_res.get("scan_engine", "deepteam_v1"))
            max_risk = max(max_risk, float(dt_res.get("risk_score", 0)))
            print("✓ DeepTeam Engine returned results.")
        else:
            print(f"! DeepTeam Engine returned status: {dt_res.get('status')} - Error: {dt_res.get('error')}")
    except Exception as e:
        print(f"✗ DeepTeam engine failed: {e}")

    print("\n--- Final Aggregated Result ---")
    print(f"Risk Score: {max_risk}")
    print(f"Engines Used: {scan_engines}")
    print(f"Total Findings: {len(findings)}")
    
    if scan_engines:
        print("✓ Orchestration logic successfully aggregated results from active engines.")
    else:
        print("✗ No engines successfully completed.")

if __name__ == "__main__":
    sys.path.append(os.getcwd())
    test_multi_engine()
