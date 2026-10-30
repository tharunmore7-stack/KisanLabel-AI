/*
# Create scans table for KisanLabel AI

## Purpose
Stores pesticide-label scan records so users can revisit past analyses. This is
a single-tenant app (no sign-in screen requested), so scans are intentionally
shared and accessible to the anon-key frontend.

## New Tables
- `scans`
  - `id` (uuid, primary key)
  - `product_name` (text, nullable - extracted product name from label)
  - `manufacturer` (text, nullable)
  - `ai_mode` (text, not null - "online" | "offline")
  - `language` (text, not null - explanation language code, e.g. "en")
  - `analysis` (jsonb, not null - full structured analysis result)
  - `image_count` (integer, not null default 0)
  - `created_at` (timestamptz, default now())

## Security
- RLS enabled on `scans`.
- CRUD granted to `anon` + `authenticated` (single-tenant, shared data).
- Policies allow all CRUD for anon + authenticated because scan history is
  intentionally public/shared within this app.
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text,
  manufacturer text,
  ai_mode text NOT NULL,
  language text NOT NULL,
  analysis jsonb NOT NULL,
  image_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON scans TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_scans" ON scans;
CREATE POLICY "anon_select_scans" ON scans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans" ON scans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scans" ON scans;
CREATE POLICY "anon_update_scans" ON scans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scans;
CREATE POLICY "anon_delete_scans" ON scans FOR DELETE
  TO anon, authenticated USING (true);
