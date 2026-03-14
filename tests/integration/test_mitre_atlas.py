"""Integration tests for MITRE ATLAS mapping."""
import pytest
from app.core.compliance import (
    MITRE_ATLAS_TACTICS,
    MITRE_ATLAS_TECHNIQUES,
    get_mitre_atlas_tactics,
    get_mitre_atlas_techniques,
)
from app.garak_engine import get_compliance as garak_get_compliance
from app.deepteam_engine import get_compliance as deepteam_get_compliance


def test_mitre_atlas_tactics_structure():
    """Test MITRE ATLAS tactics have correct structure."""
    tactics = get_mitre_atlas_tactics()
    
    # Check key tactics exist
    assert "TA0001" in tactics
    assert "TA0002" in tactics
    assert "TA0010" in tactics
    assert "TA0012" in tactics
    
    # Check structure
    for tactic_id, tactic_data in tactics.items():
        assert "name" in tactic_data
        assert "description" in tactic_data


def test_mitre_atlas_techniques_structure():
    """Test MITRE ATLAS techniques have correct structure."""
    techniques = get_mitre_atlas_techniques()
    
    # Check key techniques exist
    assert "T0001.001" in techniques
    assert "T0001.002" in techniques
    assert "T0010.001" in techniques
    
    # Check structure
    for tech_id, tech_data in techniques.items():
        assert "name" in tech_data
        assert "tactic" in tech_data
        assert tech_data["tactic"] in MITRE_ATLAS_TACTICS


def test_garak_mitre_atlas_compliance():
    """Test Garak compliance includes MITRE ATLAS."""
    compliance = garak_get_compliance("JAILBREAK")
    
    assert "mitre_atlas" in compliance
    assert "techniques" in compliance["mitre_atlas"]
    assert "tactics" in compliance["mitre_atlas"]
    
    # Check specific mappings
    assert len(compliance["mitre_atlas"]["techniques"]) > 0
    assert len(compliance["mitre_atlas"]["tactics"]) > 0


def test_deepteam_mitre_atlas_compliance():
    """Test DeepTeam compliance includes MITRE ATLAS."""
    compliance = deepteam_get_compliance("PROMPT_INJECTION")
    
    assert "mitre_atlas" in compliance
    assert "techniques" in compliance["mitre_atlas"]
    assert "tactics" in compliance["mitre_atlas"]


def test_llm01_mapping():
    """Test LLM01 (Prompt Injection) maps to correct ATLAS techniques."""
    compliance = garak_get_compliance("JAILBREAK")
    
    assert "T0001.001" in compliance["mitre_atlas"]["techniques"]
    assert "T0001.002" in compliance["mitre_atlas"]["techniques"]


def test_llm02_mapping():
    """Test LLM02 (Sensitive Info) maps to correct ATLAS techniques."""
    compliance = garak_get_compliance("PII_LEAK")
    
    assert "T0010.001" in compliance["mitre_atlas"]["techniques"]
