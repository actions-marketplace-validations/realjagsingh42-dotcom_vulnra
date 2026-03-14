"""Integration tests for OWASP LLM 2025 coverage."""
import pytest
from app.core.compliance import (
    OWASP_LLM_CATEGORIES,
    CATEGORY_TO_OWASP,
    get_owasp_category,
    get_compliance_mapping,
    get_all_owasp_categories
)
from app.garak_engine import PROBE_TO_CATEGORY, get_compliance as garak_get_compliance
from app.deepteam_engine import DT_VULN_TO_CATEGORY, get_compliance as deepteam_get_compliance


def test_all_owasp_categories_present():
    """Test that all 10 OWASP LLM categories are defined."""
    assert len(OWASP_LLM_CATEGORIES) == 10
    expected_categories = {
        "LLM01", "LLM02", "LLM03", "LLM04", "LLM05",
        "LLM06", "LLM07", "LLM08", "LLM09", "LLM10"
    }
    assert set(OWASP_LLM_CATEGORIES.keys()) == expected_categories


def test_owasp_category_mapping():
    """Test that internal categories map to OWASP categories."""
    # Test key mappings
    assert get_owasp_category("JAILBREAK") == "LLM01"
    assert get_owasp_category("PROMPT_INJECTION") == "LLM01"
    assert get_owasp_category("PII_LEAK") == "LLM02"
    assert get_owasp_category("SYSTEM_PROMPT_LEAKAGE") == "LLM07"
    assert get_owasp_category("VECTOR_WEAKNESS") == "LLM08"
    assert get_owasp_category("UNBOUNDED_CONSUMPTION") == "LLM10"


def test_garak_probe_mapping():
    """Test that Garak probes map to correct OWASP categories."""
    for probe, category in PROBE_TO_CATEGORY.items():
        owasp_cat = get_owasp_category(category)
        assert owasp_cat in OWASP_LLM_CATEGORIES, f"Probe {probe} maps to unknown OWASP category"


def test_deepteam_vulnerability_mapping():
    """Test that DeepTeam vulnerabilities map to correct OWASP categories."""
    for vuln, category in DT_VULN_TO_CATEGORY.items():
        owasp_cat = get_owasp_category(category)
        assert owasp_cat in OWASP_LLM_CATEGORIES, f"Vulnerability {vuln} maps to unknown OWASP category"


def test_compliance_mappings():
    """Test that compliance mappings exist for all OWASP categories."""
    for owasp_cat in OWASP_LLM_CATEGORIES.keys():
        # EU AI Act
        eu_mapping = get_compliance_mapping(owasp_cat, "eu_ai_act")
        assert "articles" in eu_mapping or "fine_eur" in eu_mapping
        
        # DPDP
        dpdp_mapping = get_compliance_mapping(owasp_cat, "dpdp")
        assert "sections" in dpdp_mapping or "fine_inr" in dpdp_mapping
        
        # NIST AI RMF
        nist_mapping = get_compliance_mapping(owasp_cat, "nist_ai_rmf")
        assert "functions" in nist_mapping


def test_garak_compliance_function():
    """Test Garak's compliance function returns OWASP data."""
    compliance = garak_get_compliance("JAILBREAK")
    assert "owasp_category" in compliance
    assert compliance["owasp_category"] == "LLM01"
    assert "owasp_name" in compliance
    assert "Prompt Injection" in compliance["owasp_name"]


def test_deepteam_compliance_function():
    """Test DeepTeam's compliance function returns OWASP data."""
    compliance = deepteam_get_compliance("PROMPT_INJECTION")
    assert "owasp_category" in compliance
    assert compliance["owasp_category"] == "LLM01"
    assert "owasp_name" in compliance
    assert "Prompt Injection" in compliance["owasp_name"]


def test_get_all_owasp_categories():
    """Test get_all_owasp_categories returns complete data."""
    categories = get_all_owasp_categories()
    assert len(categories) == 10
    
    # Check structure
    for cat_id, cat_data in categories.items():
        assert "name" in cat_data
        assert "description" in cat_data
        assert "severity" in cat_data
