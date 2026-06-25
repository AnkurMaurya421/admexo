-- Run this in the Supabase SQL editor

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  requirement text not null,
  category text,
  priority text,
  created_at timestamptz default now(),

  email_sent boolean default false,
  email_sent_at timestamptz,

  opened boolean default false,
  opened_at timestamptz,
  open_count int default 0,

  clicked boolean default false,
  clicked_at timestamptz,
  click_count int default 0
);

-- Service role key bypasses RLS, so RLS can stay enabled with no public policies.
alter table leads enable row level security;
