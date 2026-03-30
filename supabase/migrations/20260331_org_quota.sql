-- org_daily_quota table: Track daily scan usage per organization
-- Enables shared quota pooling for org members

-- Add org_id to scans table if not exists
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS org_daily_quota (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    scans_used INT NOT NULL DEFAULT 0,
    UNIQUE(org_id, date)
);

CREATE INDEX IF NOT EXISTS idx_org_daily_quota_date ON org_daily_quota (date);

ALTER TABLE org_daily_quota ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage (for API operations)
DROP POLICY IF EXISTS "org_daily_quota_service_manage" ON org_daily_quota;
CREATE POLICY "org_daily_quota_service_manage" ON org_daily_quota FOR ALL USING (true) WITH CHECK (true);
