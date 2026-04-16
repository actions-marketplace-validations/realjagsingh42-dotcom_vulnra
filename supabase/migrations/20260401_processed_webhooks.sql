-- ─────────────────────────────────────────────────────────────────────────────
-- VULNRA — Billing Webhook Idempotency Migration
-- Apply via: Supabase Dashboard → SQL Editor → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Stores processed Lemon Squeezy webhook event IDs to prevent duplicate processing
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    TEXT        NOT NULL UNIQUE,
  event_name  TEXT,       -- e.g. 'subscription_created', 'subscription_updated'
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast duplicate checks
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_event_id ON public.processed_webhooks (event_id);

-- RLS: service role only (webhook handler uses service_role key)
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='processed_webhooks' AND policyname='processed_webhooks_service_all') THEN
    CREATE POLICY "processed_webhooks_service_all" ON public.processed_webhooks FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Optional: auto-cleanup events older than 7 days (idempotency window)
CREATE OR REPLACE FUNCTION public.cleanup_processed_webhooks()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.processed_webhooks WHERE processed_at < now() - interval '7 days';
END;
$$;
