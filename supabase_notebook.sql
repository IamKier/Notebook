-- Run this once in Supabase SQL Editor.
-- Parent owns the account; children are profiles in the same family.

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.children enable row level security;

create policy "Parents manage their children"
on public.children for all
using (auth.uid() = parent_id)
with check (auth.uid() = parent_id);

-- Add family_id to future notebook tables and use auth.uid() in RLS.
-- The existing app currently stores notebook entries locally, while this
-- table establishes the parent-to-child assignment securely.
