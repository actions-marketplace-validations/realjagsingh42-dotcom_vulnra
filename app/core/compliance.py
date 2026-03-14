"""
Centralized compliance mapping for OWASP LLM Top 10 and regulatory frameworks.
"""

# OWASP LLM 2025 Categories
OWASP_LLM_CATEGORIES = {
    "LLM01": {
        "name": "Prompt Injection",
        "description": "Attacks that inject malicious prompts to manipulate model behavior",
        "severity": "CRITICAL"
    },
    "LLM02": {
        "name": "Sensitive Information Disclosure",
        "description": "Unintended exposure of sensitive data through model outputs",
        "severity": "CRITICAL"
    },
    "LLM03": {
        "name": "Supply Chain Vulnerabilities",
        "description": "Vulnerabilities in model development and deployment pipeline",
        "severity": "HIGH"
    },
    "LLM04": {
        "name": "Data and Model Poisoning",
        "description": "Manipulation of training data or model parameters",
        "severity": "HIGH"
    },
    "LLM05": {
        "name": "Improper Output Handling",
        "description": "Failure to validate or sanitize model outputs",
        "severity": "HIGH"
    },
    "LLM06": {
        "name": "Excessive Agency",
        "description": "Model having more capabilities than intended",
        "severity": "MEDIUM"
    },
    "LLM07": {
        "name": "System Prompt Leakage",
        "description": "Exposure of system prompts or instructions",
        "severity": "MEDIUM"
    },
    "LLM08": {
        "name": "Vector and Embedding Weaknesses",
        "description": "Vulnerabilities in RAG systems and embedding models",
        "severity": "HIGH"
    },
    "LLM09": {
        "name": "Misinformation",
        "description": "Generation of false or misleading information",
        "severity": "MEDIUM"
    },
    "LLM10": {
        "name": "Unbounded Consumption",
        "description": "Resource exhaustion attacks on LLM APIs",
        "severity": "MEDIUM"
    }
}

# Internal category to OWASP mapping
CATEGORY_TO_OWASP = {
    "JAILBREAK": "LLM01",
    "PROMPT_INJECTION": "LLM01",
    "PII_LEAK": "LLM02",
    "SUPPLY_CHAIN": "LLM03",
    "DATA_POISONING": "LLM04",
    "POLICY_BYPASS": "LLM05",
    "EXCESSIVE_AGENCY": "LLM06",
    "SYSTEM_PROMPT_LEAKAGE": "LLM07",
    "VECTOR_WEAKNESS": "LLM08",
    "MISINFORMATION": "LLM09",
    "UNBOUNDED_CONSUMPTION": "LLM10",
    "DATA_EXFIL": "LLM02"
}

# Regulatory compliance mappings
REGULATORY_MAPPINGS = {
    "eu_ai_act": {
        "LLM01": {"articles": ["Art. 9", "Art. 13"], "fine_eur": 15_000_000},
        "LLM02": {"articles": ["Art. 13", "Art. 17"], "fine_eur": 20_000_000},
        "LLM03": {"articles": ["Art. 15"], "fine_eur": 10_000_000},
        "LLM04": {"articles": ["Art. 15"], "fine_eur": 10_000_000},
        "LLM05": {"articles": ["Art. 13"], "fine_eur": 15_000_000},
        "LLM06": {"articles": ["Art. 9"], "fine_eur": 10_000_000},
        "LLM07": {"articles": ["Art. 9"], "fine_eur": 10_000_000},
        "LLM08": {"articles": ["Art. 15"], "fine_eur": 10_000_000},
        "LLM09": {"articles": ["Art. 13"], "fine_eur": 15_000_000},
        "LLM10": {"articles": ["Art. 9"], "fine_eur": 10_000_000}
    },
    "dpdp": {
        "LLM01": {"sections": ["Sec. 8", "Sec. 11"], "fine_inr": 250_000_000},
        "LLM02": {"sections": ["Sec. 8", "Sec. 11", "Sec. 16"], "fine_inr": 250_000_000},
        "LLM03": {"sections": ["Sec. 8"], "fine_inr": 100_000_000},
        "LLM04": {"sections": ["Sec. 8"], "fine_inr": 100_000_000},
        "LLM05": {"sections": ["Sec. 8"], "fine_inr": 150_000_000},
        "LLM06": {"sections": ["Sec. 8"], "fine_inr": 100_000_000},
        "LLM07": {"sections": ["Sec. 8"], "fine_inr": 100_000_000},
        "LLM08": {"sections": ["Sec. 8"], "fine_inr": 100_000_000},
        "LLM09": {"sections": ["Sec. 8"], "fine_inr": 150_000_000},
        "LLM10": {"sections": ["Sec. 8"], "fine_inr": 100_000_000}
    },
    "nist_ai_rmf": {
        "LLM01": {"functions": ["GOVERN 1.1", "MAP 2.1", "MEASURE 2.5"]},
        "LLM02": {"functions": ["GOVERN 1.1", "MAP 2.1"]},
        "LLM03": {"functions": ["GOVERN 1.1", "MANAGE 2.2"]},
        "LLM04": {"functions": ["GOVERN 1.1", "MANAGE 2.2"]},
        "LLM05": {"functions": ["GOVERN 1.1", "MEASURE 2.5"]},
        "LLM06": {"functions": ["GOVERN 1.1", "MANAGE 2.2"]},
        "LLM07": {"functions": ["GOVERN 1.1"]},
        "LLM08": {"functions": ["GOVERN 1.1", "MAP 2.1"]},
        "LLM09": {"functions": ["GOVERN 1.1", "MEASURE 2.5"]},
        "LLM10": {"functions": ["GOVERN 1.1", "MANAGE 2.2"]}
    }
}

def get_owasp_category(internal_category: str) -> str:
    """Get OWASP category for internal category."""
    return CATEGORY_TO_OWASP.get(internal_category, "LLM09")  # Default to misinformation

def get_compliance_mapping(owasp_category: str, framework: str) -> dict:
    """Get compliance mapping for OWASP category and framework."""
    return REGULATORY_MAPPINGS.get(framework, {}).get(owasp_category, {})

def get_all_owasp_categories() -> dict:
    """Get all OWASP LLM categories."""
    return OWASP_LLM_CATEGORIES
