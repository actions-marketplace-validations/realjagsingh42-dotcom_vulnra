"""Tests for billing endpoints."""
import hashlib
import hmac
import json
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


def test_webhook_without_signature_header():
    """Test POST /billing/webhook with secret configured but no X-Signature header.
    With LEMONSQUEEZY_WEBHOOK_SECRET set in .env, the webhook processes the payload
    (signature check is skipped when header is absent)."""
    response = client.post("/billing/webhook", json={"test": "data"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("processed", "error")


def test_webhook_valid_signature():
    """Test POST /billing/webhook with a valid HMAC-SHA256 signature.
    Uses the secret from .env (LEMONSQUEEZY_WEBHOOK_SECRET=jagdish)."""
    payload = json.dumps({"test": "data"}).encode()
    secret = "jagdish"
    digest = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    signature = f"sha256={digest}"

    response = client.post(
        "/billing/webhook",
        content=payload,
        headers={"X-Signature": signature, "Content-Type": "application/json"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "processed"


def test_webhook_invalid_signature():
    """Test POST /billing/webhook with an invalid signature returns 401."""
    payload = json.dumps({"test": "data"}).encode()
    invalid_sig = "sha256=0000000000000000000000000000000000000000000000000000000000000000"

    response = client.post(
        "/billing/webhook",
        content=payload,
        headers={"X-Signature": invalid_sig, "Content-Type": "application/json"},
    )
    assert response.status_code == 401
    assert "error" in response.json()


def test_webhook_wrong_secret_signature():
    """Test POST /billing/webhook with a signature computed with the wrong secret."""
    payload = json.dumps({"test": "data"}).encode()
    wrong_secret = "wrong-secret"
    digest = hmac.new(wrong_secret.encode(), payload, hashlib.sha256).hexdigest()
    signature = f"sha256={digest}"

    response = client.post(
        "/billing/webhook",
        content=payload,
        headers={"X-Signature": signature, "Content-Type": "application/json"},
    )
    assert response.status_code == 401
    assert "error" in response.json()


def test_webhook_signature_without_prefix():
    """Test POST /billing/webhook with signature missing the 'sha256=' prefix."""
    payload = json.dumps({"test": "data"}).encode()
    secret = "jagdish"
    digest = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

    response = client.post(
        "/billing/webhook",
        content=payload,
        headers={"X-Signature": digest, "Content-Type": "application/json"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "processed"


# ── Integration Tests: handle_webhook end-to-end ─────────────────────────────────

import asyncio
from unittest.mock import MagicMock, patch, AsyncMock
from app.api.endpoints.billing import (
    handle_webhook,
    _handle_subscription_created,
    _handle_subscription_updated,
    _handle_subscription_downgrade,
    _is_webhook_processed,
    _mark_webhook_processed,
    _variant_to_tier,
)
from app.services import supabase_service


def _build_subscription_payload(event_name: str, event_id: str, user_email: str,
                                variant_id: int = 1, status: str = "active",
                                subscription_id: str = "sub_123") -> dict:
    """Build a realistic Lemon Squeezy webhook payload."""
    return {
        "meta": {
            "event_name": event_name,
            "event_id": event_id,
            "custom_data": {"tier": None},
        },
        "data": {
            "id": subscription_id,
            "attributes": {
                "user_email": user_email,
                "variant_id": variant_id,
                "status": status,
            },
        },
    }


class _MockResult:
    """Minimal mock of supabase-py PostgrestResponse — provides .data attribute."""
    def __init__(self, data: list):
        self.data = data


class MockSupabaseTable:
    def __init__(self):
        self._data: list[dict] = []
        self._eq_field: str = ""
        self._eq_value: object = None
        self.insert_calls: list[dict] = []
        self.update_calls: list[dict] = []
        self.select_calls: list[tuple] = []

    def select(self, *args, **kwargs):
        self.select_calls.append(args)
        self._eq_field = ""
        self._eq_value = None
        return self

    def eq(self, field, value):
        self._eq_field = field
        self._eq_value = value
        return self

    def insert(self, data):
        self._data.append(data)
        return self

    def update(self, data):
        self.update_calls.append(data)
        return self

    def execute(self):
        if self._eq_field and self._eq_value is not None:
            filtered = [d for d in self._data if d.get(self._eq_field) == self._eq_value]
            return _MockResult(filtered)
        return _MockResult(list(self._data))


def _make_mock_sb():
    processed_table = MockSupabaseTable()
    profiles_table = MockSupabaseTable()
    profiles_table._data = [
        {"id": "user-uuid-123", "email": "alice@example.com"},
        {"id": "user-uuid-456", "email": "bob@example.com"},
        {"id": "user-uuid-789", "email": "carol@example.com"},
        {"id": "user-uuid-abc", "email": "dave@example.com"},
        {"id": "user-uuid-def", "email": "mallory@example.com"},
    ]

    sb = MagicMock()
    sb.table = MagicMock(side_effect=lambda name: {
        "processed_webhooks": processed_table,
        "profiles": profiles_table,
    }.get(name, MockSupabaseTable()))
    return sb, processed_table, profiles_table


def _variant_to_tier_mock(variant_id: int) -> str:
    """Deterministic mapping for tests — mirrors _variant_to_tier logic."""
    if variant_id == 1:
        return "pro"
    if variant_id == 2:
        return "enterprise"
    return "free"


class TestWebhookHandlers:
    """Unit tests for individual webhook handler functions."""

    def test_handle_subscription_created(self):
        """subscription_created updates user tier to 'pro' (variant_id=1 → pro)."""
        sb, _processed, profiles = _make_mock_sb()

        with patch.object(supabase_service, "get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload = _build_subscription_payload(
                event_name="subscription_created",
                event_id="evt_new",
                user_email="alice@example.com",
                variant_id=1,
            )
            asyncio.run(_handle_subscription_created(payload))

        assert len(profiles.update_calls) == 1
        assert profiles.update_calls[0]["tier"] == "pro"
        assert profiles.update_calls[0]["lemon_sub_id"] == "sub_123"

    def test_handle_subscription_created_enterprise(self):
        """variant_id=2 maps to enterprise tier."""
        sb, _processed, profiles = _make_mock_sb()

        with patch.object(supabase_service, "get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload = _build_subscription_payload(
                event_name="subscription_created",
                event_id="evt_new2",
                user_email="bob@example.com",
                variant_id=2,
            )
            asyncio.run(_handle_subscription_created(payload))

        assert profiles.update_calls[0]["tier"] == "enterprise"

    def test_handle_subscription_updated_active(self):
        """subscription_updated with active status keeps existing tier."""
        sb, _processed, profiles = _make_mock_sb()

        with patch.object(supabase_service, "get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload = _build_subscription_payload(
                event_name="subscription_updated",
                event_id="evt_upd",
                user_email="carol@example.com",
                variant_id=1,
                status="active",
            )
            asyncio.run(_handle_subscription_updated(payload))

        assert profiles.update_calls[0]["tier"] == "pro"

    def test_handle_subscription_updated_past_due_downgrades(self):
        """subscription_updated with past_due status downgrades to free."""
        sb, _processed, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb):
            payload = _build_subscription_payload(
                event_name="subscription_updated",
                event_id="evt_past_due",
                user_email="dave@example.com",
                variant_id=1,
                status="past_due",
            )
            asyncio.run(_handle_subscription_updated(payload))

        assert profiles.update_calls[0]["tier"] == "free"

    def test_handle_subscription_cancelled(self):
        """subscription_cancelled downgrades user to free tier."""
        sb, _processed, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb):
            payload = _build_subscription_payload(
                event_name="subscription_cancelled",
                event_id="evt_cancelled",
                user_email="mallory@example.com",
            )
            asyncio.run(_handle_subscription_downgrade(payload))

        assert profiles.update_calls[0]["tier"] == "free"
        assert profiles.update_calls[0]["lemon_sub_id"] is None

    def test_handle_subscription_expired(self):
        """subscription_expired downgrades user to free tier."""
        sb, _processed, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb):
            payload = _build_subscription_payload(
                event_name="subscription_expired",
                event_id="evt_expired",
                user_email="mallory@example.com",
            )
            asyncio.run(_handle_subscription_downgrade(payload))

        assert profiles.update_calls[0]["tier"] == "free"

    def test_handle_subscription_paused(self):
        """subscription_paused downgrades user to free tier."""
        sb, _processed, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb):
            payload = _build_subscription_payload(
                event_name="subscription_paused",
                event_id="evt_paused",
                user_email="mallory@example.com",
            )
            asyncio.run(_handle_subscription_downgrade(payload))

        assert profiles.update_calls[0]["tier"] == "free"


class TestWebhookIdempotency:
    """Tests for webhook idempotency via processed_webhooks table."""

    def test_same_event_id_processed_only_once(self):
        """Calling handle_webhook twice with the same event_id only calls update once."""
        sb, processed_table, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload = _build_subscription_payload(
                event_name="subscription_created",
                event_id="evt_idempotent",
                user_email="alice@example.com",
                variant_id=1,
            )

            asyncio.run(handle_webhook("subscription_created", payload, "evt_idempotent"))
            asyncio.run(handle_webhook("subscription_created", payload, "evt_idempotent"))

        assert len(profiles.update_calls) == 1, "Idempotency broken: update_user_subscription called twice for same event_id"

    def test_different_event_ids_processed_twice(self):
        """Two different event_ids both trigger updates."""
        sb, processed_table, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload1 = _build_subscription_payload(
                event_name="subscription_updated",
                event_id="evt_abc1",
                user_email="alice@example.com",
                variant_id=1,
                status="active",
            )
            payload2 = _build_subscription_payload(
                event_name="subscription_updated",
                event_id="evt_abc2",
                user_email="alice@example.com",
                variant_id=1,
                status="active",
            )

            asyncio.run(handle_webhook("subscription_updated", payload1, "evt_abc1"))
            asyncio.run(handle_webhook("subscription_updated", payload2, "evt_abc2"))

        assert len(profiles.update_calls) == 2

    def test_is_webhook_processed_true(self):
        """_is_webhook_processed returns True when event_id exists in table."""
        sb, processed_table, _profiles = _make_mock_sb()
        processed_table._data = [{"event_id": "evt_known"}]

        with patch("app.services.supabase_service.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing.get_supabase", return_value=sb):
            assert _is_webhook_processed("evt_known") is True

    def test_is_webhook_processed_false(self):
        """_is_webhook_processed returns False when event_id not in table."""
        sb, _processed_table, _profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb):
            assert _is_webhook_processed("evt_unknown") is False

    def test_is_webhook_processed_false_when_no_supabase(self):
        """_is_webhook_processed returns False (not raises) when Supabase unavailable."""
        with patch.object(supabase_service, "get_supabase", return_value=None):
            assert _is_webhook_processed("evt_any") is False


class TestWebhookEndpointE2E:
    """End-to-end tests for POST /billing/webhook via TestClient."""

    def _signed_payload(self, payload: dict) -> tuple[bytes, str]:
        """Return (raw_bytes, X-Signature header) for a given payload dict."""
        raw = json.dumps(payload).encode()
        digest = hmac.new(b"jagdish", raw, hashlib.sha256).hexdigest()
        return raw, f"sha256={digest}"

    def test_webhook_subscription_created_updates_tier(self):
        """Full flow: signed subscription_created webhook triggers tier update."""
        sb, processed_table, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload = _build_subscription_payload(
                event_name="subscription_created",
                event_id="evt_e2e_new",
                user_email="alice@example.com",
                variant_id=1,
            )
            raw, sig = self._signed_payload(payload)

            res = client.post(
                "/billing/webhook",
                content=raw,
                headers={"X-Signature": sig, "Content-Type": "application/json"},
            )

        assert res.status_code == 200
        assert res.json()["status"] == "processed"
        assert len(profiles.update_calls) == 1
        assert profiles.update_calls[0]["tier"] == "pro"

    def test_webhook_idempotent_via_endpoint(self):
        """Sending the same signed event twice only processes once."""
        sb, processed_table, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing.get_supabase", return_value=sb), \
             patch("app.api.endpoints.billing._variant_to_tier", side_effect=_variant_to_tier_mock):
            payload = _build_subscription_payload(
                event_name="subscription_updated",
                event_id="evt_e2e_idem",
                user_email="bob@example.com",
                variant_id=2,
                status="active",
            )
            raw, sig = self._signed_payload(payload)

            # First request
            r1 = client.post(
                "/billing/webhook",
                content=raw,
                headers={"X-Signature": sig, "Content-Type": "application/json"},
            )
            # Second request (same event_id)
            r2 = client.post(
                "/billing/webhook",
                content=raw,
                headers={"X-Signature": sig, "Content-Type": "application/json"},
            )

        assert r1.status_code == 200
        assert r2.status_code == 200
        assert len(profiles.update_calls) == 1, "Idempotency broken: only one update expected for same event_id"

    def test_webhook_unknown_event_type_processed(self):
        """Unknown event types return 200 (not 500) and mark as processed."""
        sb, processed_table, profiles = _make_mock_sb()

        with patch("app.services.supabase_service.get_supabase", return_value=sb):
            payload = {"meta": {"event_name": "order_created", "event_id": "evt_e2e_order"}}
            raw, sig = self._signed_payload(payload)

            res = client.post(
                "/billing/webhook",
                content=raw,
                headers={"X-Signature": sig, "Content-Type": "application/json"},
            )

        assert res.status_code == 200
        assert res.json()["status"] == "processed"

    def test_webhook_malformed_json_returns_400(self):
        """Malformed JSON body returns 400."""
        raw = b"not valid json{"
        digest = hmac.new(b"jagdish", raw, hashlib.sha256).hexdigest()

        res = client.post(
            "/billing/webhook",
            content=raw,
            headers={"X-Signature": f"sha256={digest}", "Content-Type": "application/json"},
        )

        assert res.status_code == 400
        assert "Invalid JSON" in res.json()["error"]
