"""Tests for billing endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_plans():
    """Test GET /billing/plans endpoint."""
    response = client.get("/billing/plans")
    assert response.status_code == 200
    
    data = response.json()
    assert "plans" in data
    assert len(data["plans"]) == 3
    
    # Check plan structure
    for plan in data["plans"]:
        assert "id" in plan
        assert "name" in plan
        assert "price" in plan
        assert "features" in plan
        assert "tier" in plan


def test_get_subscription_unauthorized():
    """Test GET /billing/subscription without auth."""
    response = client.get("/billing/subscription")
    assert response.status_code == 401  # Unauthorized (requires Bearer token)


def test_create_checkout_unauthorized():
    """Test POST /billing/checkout without auth."""
    response = client.post("/billing/checkout", json={
        "product_variant_id": 123456
    })
    assert response.status_code == 401  # Unauthorized (requires Bearer token)


def test_webhook_without_secret():
    """Test POST /billing/webhook without webhook secret."""
    response = client.post("/billing/webhook", json={"test": "data"})
    assert response.status_code == 200
    assert response.json() == {"status": "ignored"}
