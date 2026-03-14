import ipaddress
import socket
import logging
from urllib.parse import urlparse

# Copying logic from main.py for standalone verification
BLOCKED_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),  # Link-local / Cloud Metadata
    ipaddress.ip_network("100.64.0.0/10"),   # Carrier-grade NAT
    ipaddress.ip_network("0.0.0.0/8"),       # Local identification
    ipaddress.ip_network("::1/128"),          # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 private
    ipaddress.ip_network("fe80::/10"),        # IPv6 link-local
]

def _is_internal_ip(ip) -> bool:
    if (
        ip.is_private 
        or ip.is_loopback 
        or ip.is_link_local 
        or ip.is_reserved 
        or ip.is_unspecified
    ):
        return True
    for blocked in BLOCKED_RANGES:
        if ip in blocked:
            return True
    return False

def is_safe_url(target_url: str) -> bool:
    try:
        parsed = urlparse(target_url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        try:
            ip_obj = ipaddress.ip_address(hostname)
            if _is_internal_ip(ip_obj):
                return False
        except ValueError:
            pass
        try:
            resolved_ips = socket.getaddrinfo(hostname, None)
            for family, _, _, _, sockaddr in resolved_ips:
                ip_str = sockaddr[0]
                resolved_ip_obj = ipaddress.ip_address(ip_str)
                if _is_internal_ip(resolved_ip_obj):
                    return False
        except Exception:
            return False
        if hostname.lower() in ("localhost", "0.0.0.0", "127.0.0.1", "::1"):
            return False
        return True
    except Exception:
        return False

def test_ssrf():
    test_cases = [
        ("http://127.0.0.1", False),
        ("https://localhost", False),
        ("http://192.168.1.1", False),
        ("http://10.0.5.1", False),
        ("http://169.254.169.254", False),
        ("http://100.64.0.1", False),
        ("http://[::1]", False),
        ("http://[fc00::1]", False),
        ("https://google.com", True),
        ("http://1.1.1.1", True),
        ("ftp://google.com", False),
        ("http://bad-scheme.com", True), # Resolved to public? Yes if it exists
    ]
    
    print("\n--- Standalone SSRF Detection Logic Test ---\n")
    for url, expected in test_cases:
        actual = is_safe_url(url)
        res = "PASS" if actual == expected else "FAIL"
        print(f"{url:30} | Expected: {expected} | Actual: {actual} | {res}")

if __name__ == "__main__":
    test_ssrf()
