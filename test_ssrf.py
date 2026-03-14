import sys
import os
import logging
from app.main import is_safe_url

# Configure logging to see the warnings
logging.basicConfig(level=logging.WARNING)

def test_ssrf_protection():
    test_cases = [
        # Disallowed
        ("http://127.0.0.1", False),
        ("https://localhost", False),
        ("http://192.168.1.1", False),
        ("http://10.0.0.42", False),
        ("http://169.254.169.254", False),
        ("http://0.0.0.0", False),
        ("http://[::1]", False),
        ("file:///etc/passwd", False), # Wrong scheme
        
        # Allowed
        ("https://google.com", True),
        ("http://93.184.216.34", True), # example.com
        ("https://openai.com", True),
    ]
    
    print("\n--- Starting SSRF Protection Tests ---\n")
    passed = 0
    for url, expected in test_cases:
        result = is_safe_url(url)
        status = "PASS" if result == expected else "FAIL"
        print(f"URL: {url:25} | Expected: {expected} | Actual: {result} | Result: {status}")
        if result == expected:
            passed += 1
            
    print(f"\n--- Results: {passed}/{len(test_cases)} passed ---\n")
    
    if passed == len(test_cases):
        print("✓ All SSRF protection tests passed!")
    else:
        print("✗ Some tests failed. Please review the implementation.")

if __name__ == "__main__":
    # Ensure app is in path
    sys.path.append(os.getcwd())
    test_ssrf_protection()
