-- ── Sprint 8: Webhooks + Notification Prefs ──────────────────────────────────

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  url               TEXT        NOT NULL,
  events            TEXT[]      NOT NULL DEFAULT ARRAY['scan.complete'],
  secret            TEXT        NOT NULL,
  active            BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_triggered_at TIMESTAMPTZ,
  last_status       TEXT,
  last_status_code  INT
);

CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhooks_select_own" ON webhooks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "webhooks_insert_own" ON webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "webhooks_update_own" ON webhooks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "webhooks_delete_own" ON webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- Notification prefs + display_name on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name          TEXT,
  ADD COLUMN IF NOT EXISTS notification_email    TEXT,
  ADD COLUMN IF NOT EXISTS alert_threshold       INT  NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS alert_new_high        BOOL NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_scan_complete   BOOL NOT NULL DEFAULT false;
