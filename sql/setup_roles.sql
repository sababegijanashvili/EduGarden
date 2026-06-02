-- Run this in the Supabase SQL Editor before using the Roles admin section.

CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_en text NOT NULL,
  role_ge text,
  badge_color text DEFAULT '#8d6e63',
  badge_text_color text DEFAULT '#ffffff',
  priority integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff ADD COLUMN IF NOT EXISTS roles jsonb;

ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
