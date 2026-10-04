-- Run this migration in the Supabase SQL editor.
-- The policies grant read-only access to the designated admin account while
-- leaving the existing parent policies in place for every other account.

drop policy if exists "Notebook admin can view all children" on public.children;
create policy "Notebook admin can view all children"
on public.children
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'kenjicondez32@gmail.com');

drop policy if exists "Notebook admin can view all subjects" on public.subjects;
create policy "Notebook admin can view all subjects"
on public.subjects
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'kenjicondez32@gmail.com');

drop policy if exists "Notebook admin can view all topics" on public.topics;
create policy "Notebook admin can view all topics"
on public.topics
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'kenjicondez32@gmail.com');
