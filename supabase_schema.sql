-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Contacts (Customers)
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  wa_id text unique not null, -- WhatsApp ID (e.g. 62812345678)
  name text,
  push_name text,
  profile_pic_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Conversations (Chat Sessions)
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade not null,
  status text default 'active', -- active, resolved, blocked
  last_message_at timestamp with time zone default now(),
  unread_count integer default 0,
  -- For AI control
  ai_mode boolean default true, -- true = AI handles it, false = Admin took over
  pinned boolean default false,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default now()
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender text not null, -- 'user', 'ai', 'admin', 'system'
  content text,
  media_url text,
  media_type text, -- 'image', 'video', 'document'
  status text default 'sent', -- sent, delivered, read, failed
  wa_message_id text, -- External ID from WhatsApp
  created_at timestamp with time zone default now()
);

-- Knowledge Base for AI
create table knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  category text default 'general', -- menu, promo, sop, faq
  question text not null,
  answer text not null,
  tags text[] default array[]::text[],
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Reservations
create table reservations (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  status text default 'pending', -- pending, confirmed, cancelled, completed
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  details jsonb, -- party size, special requests
  google_event_id text, -- link to Google Calendar
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS Policies (Simple for now, can be hardened later)
alter table contacts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table knowledge_base enable row level security;
alter table reservations enable row level security;

-- Allow anon/authenticated access for now (since we are using specialized client in Next.js)
-- In production, we should restrict this.
create policy "Allow public access for dev" on contacts for all using (true);
create policy "Allow public access for dev" on conversations for all using (true);
create policy "Allow public access for dev" on messages for all using (true);
create policy "Allow public access for dev" on knowledge_base for all using (true);
create policy "Allow public access for dev" on reservations for all using (true);
