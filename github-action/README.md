# VULNRA LLM Security Scan

> **`vulra/vulnra-scan-action@v1`** — Run AI vulnerability audits against your LLM API in CI/CD.

Automatically scan your LLM API endpoints for vulnerabilities in CI/CD pipelines.

## Usage

```yaml
- uses: vulnra/vulnra-scan-action@v1
  with:
    api_key: ${{ secrets.VULNRA_API_KEY }}
    target_url: 'https://your-llm-api.com/v1/chat/completions'
    tier: 'pro'
    fail_on_risk_score: '70'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| api_key | Yes | - | Your VULNRA API key |
| target_url | Yes | - | LLM endpoint to scan |
| tier | No | free | free, pro, or enterprise |
| scan_engine | No | crescendo | crescendo, goat, or combined |
| fail_on_risk_score | No | 70 | Fail if score >= this value |

## Outputs

| Output | Description |
|--------|-------------|
| risk_score | Final risk score 0-100 |
| scan_id | Scan ID for full report |
| findings_count | Number of findings |

## Example Workflow

```yaml
name: LLM Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vulnra/vulnra-scan-action@v1
        with:
          api_key: ${{ secrets.VULNRA_API_KEY }}
          target_url: ${{ secrets.LLM_ENDPOINT }}
          fail_on_risk_score: '70'
```

## Getting an API Key

1. Sign up at [vulnra.com](https://vulnra.com)
2. Go to Settings → API Keys
3. Create a new API key
4. Add it as a secret in your GitHub repository: Settings → Secrets → Actions

## Security

All API keys are stored as GitHub Secrets and never exposed in logs or error messages.
