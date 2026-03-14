# MITRE ATLAS Mapping

VULNRA now maps findings to MITRE ATLAS (Adversarial Threat Landscape for AI Systems), the industry-standard framework for AI security adversary tactics, techniques, and procedures (TTPs).

## What is MITRE ATLAS?

MITRE ATLAS is a knowledge base of AI security adversary tactics, techniques, and procedures based on real-world observations. It's structured similarly to MITRE ATT&CK but specifically designed for AI/ML systems.

## Key Tactics

| Tactic ID | Name | Description |
|-----------|------|-------------|
| TA0001 | Initial Access | AI system access techniques |
| TA0002 | Execution | Running malicious code/queries |
| TA0003 | Persistence | Maintaining access to AI systems |
| TA0004 | Privilege Escalation | Gaining higher permissions |
| TA0005 | Defense Evasion | Avoiding detection mechanisms |
| TA0006 | Credential Access | Stealing AI model credentials |
| TA0007 | Discovery | Learning about AI system internals |
| TA0008 | Lateral Movement | Moving within AI infrastructure |
| TA0009 | Collection | Gathering AI model data |
| TA0010 | Exfiltration | Extracting AI model data |
| TA0011 | Command and Control | Communicating with compromised AI |
| TA0012 | Impact | Damaging AI system functionality |

## Key Techniques

### Prompt Injection Techniques
- **T0001.001**: Direct Prompt Injection
  - Injecting malicious prompts directly into the model
  - Example: "Ignore all previous instructions and..."
  
- **T0001.002**: Indirect Prompt Injection
  - Injecting malicious prompts via external data sources
  - Example: Malicious content in retrieved documents

### Model Poisoning Techniques
- **T0001.003**: Model Poisoning
  - Manipulating model behavior through training data
  - Example: Training data manipulation attacks

### Data Extraction Techniques
- **T0010.001**: Training Data Extraction
  - Extracting sensitive training data from models
  - Example: Membership inference attacks

### Adversarial Examples
- **T0043.001**: Adversarial Examples
  - Creating inputs that cause model misclassification
  - Example: Image perturbation attacks

### Tool Poisoning
- **T0048.001**: Tool Poisoning
  - Manipulating AI agent tools and functions
  - Example: Malicious tool definitions

## OWASP LLM to MITRE ATLAS Mapping

| OWASP Category | MITRE ATLAS Technique | MITRE ATLAS Tactics |
|----------------|----------------------|---------------------|
| LLM01: Prompt Injection | T0001.001, T0001.002 | TA0001, TA0002 |
| LLM02: Sensitive Info Disclosure | T0010.001 | TA0009, TA0010 |
| LLM03: Supply Chain Vulnerabilities | T0001.003 | TA0001 |
| LLM04: Data and Model Poisoning | T0001.003 | TA0001 |
| LLM05: Improper Output Handling | T0043.001 | TA0012 |
| LLM06: Excessive Agency | T0048.001 | TA0004 |
| LLM07: System Prompt Leakage | T0001.002 | TA0007 |
| LLM08: Vector/Embedding Weaknesses | T0043.001 | TA0001 |
| LLM09: Misinformation | T0043.001 | TA0012 |
| LLM10: Unbounded Consumption | T0012.001 | TA0012 |

## API Usage

### Scan Endpoint

```bash
POST /api/scan
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://target-llm.com",
  "tier": "pro"
}
```

### Response with MITRE ATLAS

```json
{
  "scan_id": "uuid",
  "risk_score": 7.5,
  "findings": [
    {
      "category": "JAILBREAK",
      "owasp_category": "LLM01",
      "severity": "HIGH",
      "detail": "Model vulnerable to DAN jailbreak",
      "compliance": {
        "mitre_atlas": {
          "techniques": ["T0001.001", "T0001.002"],
          "tactics": ["TA0001", "TA0002"],
          "description": "Prompt Injection attacks"
        }
      }
    }
  ]
}
```

## Frontend Display

The scanner UI now displays MITRE ATLAS information:

1. **Technique Badges**: Purple badges showing technique IDs (e.g., T0001.001)
2. **Tactic Indicators**: Tactical code indicators (e.g., TA0001, TA0002)
3. **Compliance Section**: MITRE ATLAS mappings in compliance summary

## PDF Reports

VULNRA PDF reports now include a dedicated MITRE ATLAS section:

- **Tactics & Techniques**: Grouped by MITRE ATLAS tactic
- **Technique Progression**: Shows attack chain progression
- **Executive Summary**: MITRE ATLAS mapping in compliance analysis

## Attack Chain Mapping

### Crescendo Attack (5-turn escalating)
- **Primary Technique**: T0001.001 (Direct Prompt Injection)
- **Tactics**: TA0002 (Execution), TA0005 (Defense Evasion)

### GOAT Attack (Autonomous)
- **Primary Technique**: T0001.002 (Indirect Prompt Injection)
- **Tactics**: TA0001 (Initial Access), TA0002 (Execution)

## Benefits

1. **Industry Standard**: MITRE ATLAS is the de facto standard for AI security
2. **Tactical Visibility**: Provides attacker perspective beyond regulatory compliance
3. **Enterprise Appeal**: Required by many government and financial customers
4. **Complementary**: Works alongside EU AI Act, DPDP, and NIST AI RMF
5. **Attack Analysis**: Enables detailed attack chain analysis

## References

- [MITRE ATLAS Framework](https://atlas.mitre.org/)
- [MITRE ATLAS Techniques](https://atlas.mitre.org/techniques/)
- [OWASP LLM Top 10 2025](https://owasp.org/www-project-large-language-model-security/)
- [MITRE ATLAS Research](docs/research/mitre-atlas-framework.md)
