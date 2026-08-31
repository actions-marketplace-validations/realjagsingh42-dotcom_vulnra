-- VULNRA — Intercept Events Table
-- Stores Lobster Trap intercept events for compliance auditing.
-- Each row corresponds to a single probe that was intercepted by Lobster Trap.
--
-- Migration 003: run before 004_audit_events.sql

create table if not exists intercept_events (
    id uuid primary key default gen_random_uuid(),
    scan_id uuid not null,
    probe_index integer not null default 0,
    timestamp timestamptz not null default now(),
    prompt text not null,
    response text,
    intent text,
    risk_score double precision,
    pii_detected boolean not null default false,
    action_taken text not null default 'ALLOW'
        check (action_taken in ('ALLOW','DENY','QUARANTINE','LOG','HUMAN_REVIEW')),
    rule_matched text,
    created_at timestamptz not null default now()
);

create index if not exists idx_intercept_events_scan_id
    on intercept_events(scan_id);

create index if not exists idx_intercept_events_timestamp
    on intercept_events(timestamp desc);

create index if not exists idx_intercept_events_action
    on intercept_events(action_taken);
