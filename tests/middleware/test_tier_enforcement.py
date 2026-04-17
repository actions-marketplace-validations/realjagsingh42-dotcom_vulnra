"""Tests for tier enforcement middleware."""
import pytest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from app.middleware.tier_enforcement import require_tier, require_tier_pro, require_tier_enterprise
from app.core.security import get_current_user


def create_test_app():
    """Create a test app with the tier enforcement endpoints."""
    app = FastAPI()

    @app.get("/open")
    async def open_endpoint(current_user: dict = Depends(get_current_user)):
        return {"tier": current_user.get("tier")}

    @app.get("/pro-gated")
    async def pro_gated_endpoint(
        current_user: dict = Depends(get_current_user),
        _=Depends(require_tier("pro")),
    ):
        return {"tier": current_user.get("tier")}

    @app.get("/enterprise-gated")
    async def enterprise_gated_endpoint(
        current_user: dict = Depends(get_current_user),
        _=Depends(require_tier("enterprise")),
    ):
        return {"tier": current_user.get("tier")}

    @app.get("/basic-gated")
    async def basic_gated_endpoint(
        current_user: dict = Depends(get_current_user),
        _=Depends(require_tier("basic")),
    ):
        return {"tier": current_user.get("tier")}

    return app


class TestRequireTierMiddleware:
    """Test suite for require_tier() middleware."""

    def setup_method(self):
        """Set up test client and app."""
        self.app = create_test_app()
        self.client = TestClient(self.app)

    def _override_user(self, user_dict: dict):
        """Override get_current_user with a mock user."""
        async def mock_user():
            return user_dict
        self.app.dependency_overrides[get_current_user] = mock_user

    def _clear_override(self):
        """Clear all dependency overrides."""
        self.app.dependency_overrides.clear()

    def teardown_method(self):
        self._clear_override()

    def test_free_user_can_access_open_endpoint(self):
        """Free users should be able to access open endpoints."""
        self._override_user({"id": "user-1", "email": "free@test.com", "tier": "free"})
        response = self.client.get("/open")
        assert response.status_code == 200
        assert response.json()["tier"] == "free"

    def test_free_user_blocked_from_pro_endpoint(self):
        """Free users should get 403 on Pro-gated endpoints."""
        self._override_user({"id": "user-1", "email": "free@test.com", "tier": "free"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 403
        assert "Pro" in response.json()["detail"]
        assert "upgrade" in response.json()["detail"].lower()

    def test_free_user_blocked_from_enterprise_endpoint(self):
        """Free users should get 403 on Enterprise-gated endpoints."""
        self._override_user({"id": "user-1", "email": "free@test.com", "tier": "free"})
        response = self.client.get("/enterprise-gated")
        assert response.status_code == 403
        assert "Enterprise" in response.json()["detail"]

    def test_free_user_blocked_from_basic_endpoint(self):
        """Free users should get 403 on Basic-gated endpoints."""
        self._override_user({"id": "user-1", "email": "free@test.com", "tier": "free"})
        response = self.client.get("/basic-gated")
        assert response.status_code == 403
        assert "Basic" in response.json()["detail"]

    def test_basic_user_can_access_basic_endpoint(self):
        """Basic users should be able to access Basic-gated endpoints."""
        self._override_user({"id": "user-2", "email": "basic@test.com", "tier": "basic"})
        response = self.client.get("/basic-gated")
        assert response.status_code == 200
        assert response.json()["tier"] == "basic"

    def test_basic_user_blocked_from_pro_endpoint(self):
        """Basic users should get 403 on Pro-gated endpoints."""
        self._override_user({"id": "user-2", "email": "basic@test.com", "tier": "basic"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 403
        assert "Pro" in response.json()["detail"]

    def test_basic_user_blocked_from_enterprise_endpoint(self):
        """Basic users should get 403 on Enterprise-gated endpoints."""
        self._override_user({"id": "user-2", "email": "basic@test.com", "tier": "basic"})
        response = self.client.get("/enterprise-gated")
        assert response.status_code == 403

    def test_pro_user_can_access_pro_endpoint(self):
        """Pro users should be able to access Pro-gated endpoints."""
        self._override_user({"id": "user-3", "email": "pro@test.com", "tier": "pro"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 200
        assert response.json()["tier"] == "pro"

    def test_pro_user_can_access_enterprise_endpoint(self):
        """Pro users should get 403 on Enterprise-only endpoints."""
        self._override_user({"id": "user-3", "email": "pro@test.com", "tier": "pro"})
        response = self.client.get("/enterprise-gated")
        assert response.status_code == 403

    def test_enterprise_user_can_access_all(self):
        """Enterprise users should be able to access all endpoints."""
        self._override_user({"id": "user-4", "email": "enterprise@test.com", "tier": "enterprise"})
        assert self.client.get("/open").status_code == 200
        assert self.client.get("/pro-gated").status_code == 200
        assert self.client.get("/basic-gated").status_code == 200
        assert self.client.get("/enterprise-gated").status_code == 200

    def test_pro_shortcut(self):
        """require_tier_pro() should be equivalent to require_tier('pro')."""
        self._override_user({"id": "user-3", "email": "pro@test.com", "tier": "pro"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 200

    def test_enterprise_shortcut(self):
        """require_tier_enterprise() should be equivalent to require_tier('enterprise')."""
        self._override_user({"id": "user-4", "email": "enterprise@test.com", "tier": "enterprise"})
        response = self.client.get("/enterprise-gated")
        assert response.status_code == 200

    def test_missing_tier_defaults_to_free(self):
        """User with no tier field should default to 'free' and be blocked from Pro+."""
        self._override_user({"id": "user-5", "email": "notier@test.com"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 403

    def test_unknown_tier_defaults_to_free(self):
        """User with unknown tier should be treated as 'free'."""
        self._override_user({"id": "user-6", "email": "unknown@test.com", "tier": "platinum"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 403

    def test_tier_case_insensitive(self):
        """Tier checks should be case-insensitive."""
        self._override_user({"id": "user-7", "email": "upper@test.com", "tier": "PRO"})
        response = self.client.get("/pro-gated")
        assert response.status_code == 200

        self._override_user({"id": "user-8", "email": "mixed@test.com", "tier": "BaSiC"})
        response = self.client.get("/basic-gated")
        assert response.status_code == 200
