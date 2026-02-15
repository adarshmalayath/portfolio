# Supabase SQL Setup

This setup stores portfolio content in a SQL database (Postgres on Supabase) and edits it via section-wise admin forms.

## 1) Create Supabase Project
1. Create/open a Supabase project.
2. In `Project Settings -> API`, copy:
   - `Project URL`
   - `anon public key`
3. Put them in:
   - `/Users/adarsh/Documents/Portfolio/supabase-config.js`

## 2) Enable Google Auth
1. Supabase Dashboard -> `Authentication -> Providers -> Google`.
2. Enable Google provider and configure client id/secret.
3. In `Authentication -> URL Configuration`, add:
   - Site URL: `https://adarshmalayath.github.io/portfolio/`
   - Redirect URL: `https://adarshmalayath.github.io/portfolio/admin.html`

## 3) Run SQL Schema
Open Supabase SQL editor and run:

```sql
create table if not exists public.portfolio_content (
  id integer primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null
);

alter table public.portfolio_content enable row level security;

create policy "public_read_portfolio_content"
on public.portfolio_content
for select
to public
using (true);

create policy "admin_insert_portfolio_content"
on public.portfolio_content
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'adarshmalayath@gmail.com');

create policy "admin_update_portfolio_content"
on public.portfolio_content
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'adarshmalayath@gmail.com')
with check ((auth.jwt() ->> 'email') = 'adarshmalayath@gmail.com');

insert into public.portfolio_content (id, content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
```

## 4) Admin Allowlist
Set allowed admin in:
- `/Users/adarsh/Documents/Portfolio/supabase-config.js`

```js
supabaseAdmin.allowedEmails = ["adarshmalayath@gmail.com"];
```

## 5) Deploy
Push changes to GitHub:

```bash
cd /Users/adarsh/Documents/Portfolio
git add .
git commit -m "Configure Supabase SQL settings"
git push
```

## Notes
- Public site reads SQL row `portfolio_content(id=1)`.
- Admin writes only after Google login and allowlist check.
- SQL RLS policies enforce write restrictions server-side.
