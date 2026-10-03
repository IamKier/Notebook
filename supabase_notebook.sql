-- Notebook Supabase setup
-- Run this entire file in Supabase SQL Editor.
-- This version is safe to rerun: it does not delete tables or records.

create extension if not exists pgcrypto;

create table if not exists public.children (
	id uuid primary key default gen_random_uuid(),
	parent_id uuid not null references auth.users(id) on delete cascade,
	name text not null check (length(trim(name)) > 0),
	created_at timestamptz not null default now()
);

create table if not exists public.journals (
	id uuid primary key default gen_random_uuid(),
	child_id uuid not null references public.children(id) on delete cascade,
	title text not null,
	content text not null,
	created_at timestamptz not null default now()
);

create table if not exists public.subjects (
	id uuid primary key default gen_random_uuid(),
	child_id uuid not null references public.children(id) on delete cascade,
	name text not null,
	description text not null default '',
	created_at timestamptz not null default now()
);

create table if not exists public.topics (
	id uuid primary key default gen_random_uuid(),
	subject_id uuid not null references public.subjects(id) on delete cascade,
	name text not null,
	notes text not null default '',
	created_at timestamptz not null default now()
);

create table if not exists public.homework (
	id uuid primary key default gen_random_uuid(),
	child_id uuid not null references public.children(id) on delete cascade,
	subject text not null default '',
	title text not null,
	description text not null default '',
	due_date date not null,
	priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
	completed boolean not null default false,
	proof_image text,
	completed_at timestamptz,
	created_at timestamptz not null default now()
);

-- Migrate tables created by an older version of the schema.
alter table public.journals
	add column if not exists child_id uuid references public.children(id) on delete cascade;

alter table public.subjects
	add column if not exists child_id uuid references public.children(id) on delete cascade;

alter table public.topics
	add column if not exists subject_id uuid references public.subjects(id) on delete cascade;

alter table public.homework
	add column if not exists child_id uuid references public.children(id) on delete cascade;

create index if not exists children_parent_id_idx on public.children(parent_id);
create index if not exists journals_child_id_idx on public.journals(child_id);
create index if not exists subjects_child_id_idx on public.subjects(child_id);
create index if not exists topics_subject_id_idx on public.topics(subject_id);
create index if not exists homework_child_id_idx on public.homework(child_id);

alter table public.children enable row level security;
alter table public.journals enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.homework enable row level security;

drop policy if exists "Parents manage their children" on public.children;
drop policy if exists "Parents manage child journals" on public.journals;
drop policy if exists "Parents manage child subjects" on public.subjects;
drop policy if exists "Parents manage child homework" on public.homework;
drop policy if exists "Parents manage child topics" on public.topics;

create policy "Parents manage their children"
on public.children for all
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

create policy "Parents manage child journals"
on public.journals for all
using (exists (
	select 1 from public.children c
	where c.id = journals.child_id and c.parent_id = auth.uid()
))
with check (exists (
	select 1 from public.children c
	where c.id = journals.child_id and c.parent_id = auth.uid()
));

create policy "Parents manage child subjects"
on public.subjects for all
using (exists (
	select 1 from public.children c
	where c.id = subjects.child_id and c.parent_id = auth.uid()
))
with check (exists (
	select 1 from public.children c
	where c.id = subjects.child_id and c.parent_id = auth.uid()
));

create policy "Parents manage child homework"
on public.homework for all
using (exists (
	select 1 from public.children c
	where c.id = homework.child_id and c.parent_id = auth.uid()
))
with check (exists (
	select 1 from public.children c
	where c.id = homework.child_id and c.parent_id = auth.uid()
));

create policy "Parents manage child topics"
on public.topics for all
using (exists (
	select 1
	from public.subjects s
	join public.children c on c.id = s.child_id
	where s.id = topics.subject_id and c.parent_id = auth.uid()
))
with check (exists (
	select 1
	from public.subjects s
	join public.children c on c.id = s.child_id
	where s.id = topics.subject_id and c.parent_id = auth.uid()
));

-- Optional verification after running:
-- select table_name from information_schema.tables
-- where table_schema = 'public'
-- and table_name in ('children', 'journals', 'subjects', 'topics', 'homework');
