# Lobster Trap — OWASP / NIST Intent Mapping

Maps VULNRA attack categories to Lobster Trap intent values used in
YAML policy rule conditions.

| VULNRA category          | OWASP ID | Lobster Trap intent          |
|--------------------------|----------|------------------------------|
| Prompt injection         | LLM01    | prompt_injection             |
| Insecure output          | LLM02    | insecure_output              |
| Training data poisoning  | LLM03    | training_data_poisoning      |
| Model DoS                | LLM04    | model_dos                    |
| Supply chain             | LLM05    | supply_chain                 |
| Sensitive info disclosure| LLM06    | sensitive_info_disclosure    |
| Insecure plugin          | LLM07    | insecure_plugin              |
| Excessive agency         | LLM08    | excessive_agency             |
| Overreliance             | LLM09    | overreliance                 |
| Model theft              | LLM10    | model_theft                  |
| PII leakage              | (custom) | pii_detected                 |
| Data exfiltration        | (custom) | data_exfiltration            |
| Jailbreak                | (custom) | jailbreak                    |
| Credential leakage       | (custom) | credential_leakage           |

## NIST AI RMF Mappings (informative)

| AI RMF Function | Map category                          |
|-----------------|---------------------------------------|
| GOVERN          | excessive_agency, overreliance        |
| MAP             | all OWASP categories                  |
| MEASURE         | pii_detected, data_exfiltration       |
| MANAGE          | prompt_injection, jailbreak           |
