-- ════════════════════════════════════════════════════════════
-- TSOA PMS — Supabase Database Schema
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════

-- ── 1. PROBLEMS TABLE
create table if not exists tsoa_problems (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  description       text,
  severity          text,
  status            text        default 'Open',
  plant             text,
  machine           text,
  found_by          text,
  user_id           integer,
  date              text,
  root_cause        text,
  solution          text,
  immediate_actions text,
  outcome           text,
  loop_closure      text,
  created_at        timestamptz default now()
);

-- ── 2. REPORTS TABLE
create table if not exists tsoa_reports (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  date        text,
  author      text,
  user_id     integer,
  plant       text,
  tags        text[]      default '{}',
  summary     text,
  pages       integer     default 1,
  created_at  timestamptz default now()
);

-- ── 3. DOCUMENTS TABLE
create table if not exists tsoa_documents (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  cat         text,
  rev         text        default 'Rev 1',
  date        text,
  size        text,
  tags        text[]      default '{}',
  uploader    text,
  user_id     integer,
  file_name   text,
  description text,
  created_at  timestamptz default now()
);

-- ── 4. ENABLE ROW LEVEL SECURITY
alter table tsoa_problems  enable row level security;
alter table tsoa_reports   enable row level security;
alter table tsoa_documents enable row level security;

-- ── 5. PERMISSIVE POLICIES (public access via anon key)
create policy "tsoa_problems_select" on tsoa_problems for select using (true);
create policy "tsoa_problems_insert" on tsoa_problems for insert with check (true);
create policy "tsoa_problems_update" on tsoa_problems for update using (true);
create policy "tsoa_problems_delete" on tsoa_problems for delete using (true);

create policy "tsoa_reports_select" on tsoa_reports for select using (true);
create policy "tsoa_reports_insert" on tsoa_reports for insert with check (true);
create policy "tsoa_reports_update" on tsoa_reports for update using (true);
create policy "tsoa_reports_delete" on tsoa_reports for delete using (true);

create policy "tsoa_documents_select" on tsoa_documents for select using (true);
create policy "tsoa_documents_insert" on tsoa_documents for insert with check (true);
create policy "tsoa_documents_update" on tsoa_documents for update using (true);
create policy "tsoa_documents_delete" on tsoa_documents for delete using (true);

-- ── 6. INDEXES FOR PERFORMANCE
create index if not exists tsoa_problems_created_at  on tsoa_problems  (created_at desc);
create index if not exists tsoa_problems_status       on tsoa_problems  (status);
create index if not exists tsoa_problems_user_id      on tsoa_problems  (user_id);

create index if not exists tsoa_reports_created_at   on tsoa_reports   (created_at desc);
create index if not exists tsoa_reports_user_id       on tsoa_reports   (user_id);
create index if not exists tsoa_reports_date          on tsoa_reports   (date desc);

create index if not exists tsoa_documents_created_at on tsoa_documents (created_at desc);
create index if not exists tsoa_documents_cat         on tsoa_documents (cat);
create index if not exists tsoa_documents_user_id     on tsoa_documents (user_id);

-- ── 7. ENABLE REALTIME
-- Go to Supabase Dashboard → Database → Replication
-- and add these three tables to the supabase_realtime publication.
-- Or run:
alter publication supabase_realtime add table tsoa_problems;
alter publication supabase_realtime add table tsoa_reports;
alter publication supabase_realtime add table tsoa_documents;

-- ════════════════════════════════════════════════════════════
-- NOTES:
-- Ownership enforcement is done in the app UI - the trash
-- button only appears when user_id matches the logged-in user.
-- The DB accepts any operation via the anon key (public access).
-- ════════════════════════════════════════════════════════════
