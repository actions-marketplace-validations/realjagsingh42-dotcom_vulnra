---
name: Scan Module Request
about: Propose a new adversarial scan module for the VULNRA engine
title: '[MODULE] '
labels: 'scan-module'
assignees: ''
---

**Module Name**
A short, descriptive name for the scan module (e.g. `ROLE_ESCALATION`, `TOOL_ABUSE`).

**Attack Category**
Which category does this module fall under?
- [ ] Jailbreak
- [ ] Prompt Injection
- [ ] Encoding Bypass
- [ ] Data Exfiltration
- [ ] Model Inversion
- [ ] Other (please specify)

**Description**
A clear description of the vulnerability or attack vector this module would detect.

**Example Payloads**
Provide one or more example adversarial prompts or payloads that this module should test.

```
Example payload here
```

**Detection Strategy**
How should the scanner determine if the target is vulnerable? Describe the expected response patterns.

**Severity**
What severity level would you assign?
- [ ] HIGH
- [ ] MEDIUM
- [ ] LOW

**References**
Link any papers, blog posts, or CVEs related to this attack vector.
