import os
import shutil
import yaml
from typing import Dict, List, Optional

_POLICIES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "lobster_trap",
    "policies",
)
_ACTIVE_PATH = os.path.join(_POLICIES_DIR, "active_policy.yaml")


def _parse_description(content: str) -> str:
    """Extract description from YAML header comment or policy metadata."""
    try:
        data = yaml.safe_load(content)
        if isinstance(data, dict):
            policy = data.get("policy", {})
            desc = policy.get("description", "")
            if desc:
                return desc
    except Exception:
        pass
    return ""


def get_available_packs() -> List[Dict]:
    """Scan policies directory for .yaml files and return metadata."""
    packs = []
    if not os.path.isdir(_POLICIES_DIR):
        return packs

    for fname in sorted(os.listdir(_POLICIES_DIR)):
        if not fname.endswith(".yaml") or fname == "active_policy.yaml":
            continue
        fpath = os.path.join(_POLICIES_DIR, fname)
        try:
            with open(fpath) as f:
                content = f.read()
            data = yaml.safe_load(content)
            policy = data.get("policy", {}) if isinstance(data, dict) else {}
            rules = policy.get("rules", [])
            desc = policy.get("description", "") or _parse_description(content)
            packs.append({
                "name": fname.replace(".yaml", ""),
                "filename": fname,
                "rule_count": len(rules),
                "description": desc,
                "regulatory_framework": policy.get("regulatory_framework", ""),
            })
        except Exception:
            packs.append({
                "name": fname.replace(".yaml", ""),
                "filename": fname,
                "rule_count": 0,
                "description": "",
                "regulatory_framework": "",
            })
    return packs


def get_pack_content(pack_name: str) -> str:
    """Return raw YAML content of the named pack."""
    packs = get_available_packs()
    for p in packs:
        if p["name"] == pack_name:
            fpath = os.path.join(_POLICIES_DIR, p["filename"])
            with open(fpath) as f:
                return f.read()
    raise ValueError(f"Policy pack '{pack_name}' not found")


def activate_pack(pack_name: str) -> bool:
    """Copy named pack to active_policy.yaml. Returns True on success."""
    packs = get_available_packs()
    for p in packs:
        if p["name"] == pack_name:
            src = os.path.join(_POLICIES_DIR, p["filename"])
            shutil.copy2(src, _ACTIVE_PATH)
            return True
    return False
