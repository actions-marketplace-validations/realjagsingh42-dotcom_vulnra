import sys
import os
import logging
from app.garak_engine import run_garak_scan, garak_available

# Configure logging to see what's happening
logging.basicConfig(level=logging.INFO)

def test_integration():
    print("Checking if Garak is available...")
    if not garak_available():
        print("FAILED: Garak environment not found or not functional.")
        return

    print("Garak is available. Running a test scan (Free tier)...")
    # Using a dummy URL - Garak will try to probe it. 
    # Even if it fails to connect, we want to see it execute the process.
    scan_id = "test-scan-123"
    result = run_garak_scan(scan_id, "http://localhost:9999", tier="free")
    
    print("\nScan Result:")
    print(f"Scan ID: {result.get('scan_id')}")
    print(f"Status: {result.get('status')}")
    print(f"Engine: {result.get('scan_engine')}")
    print(f"Risk Score: {result.get('risk_score')}")
    print(f"Findings Count: {len(result.get('findings', []))}")
    
    if result.get('scan_engine') == 'garak_v2':
        print("\nSUCCESS: Real Garak engine was used.")
    else:
        print("\nWARNING: Fallback mock engine was used.")

if __name__ == "__main__":
    # Ensure app is in path
    sys.path.append(os.getcwd())
    test_integration()
