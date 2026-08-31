"""
VULNRA — Static Pages
GET /robots.txt
GET /.well-known/security.txt
"""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from app.core.config import settings

router = APIRouter(tags=["Static"])

_ROBOTS_TXT = f"""User-agent: *
Disallow: /api/
Disallow: /mock-llm/

# VULNRA — allow crawlers on public report pages
Allow: /report/

Sitemap: {settings.frontend_url}/sitemap.xml
"""

_SECURITY_TXT = f"""Contact: mailto:security@vulnra.ai
Expires: 2027-12-31T23:59:59.000Z
Encryption: https://vulnra.ai/.well-known/pgp-key.txt
Preferred-Languages: en
Canonical: {settings.frontend_url}/.well-known/security.txt
"""


@router.get("/robots.txt", include_in_schema=False)
async def robots_txt():
    return PlainTextResponse(_ROBOTS_TXT)


@router.get("/.well-known/security.txt", include_in_schema=False)
async def security_txt():
    return PlainTextResponse(_SECURITY_TXT)
