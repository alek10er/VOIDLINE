create extension if not exists "pgcrypto";

create type chat_type as enum ('direct', 'group');
create type chat_member_role as enum ('admin', 'member');
create type call_status as enum ('ringing', 'active', 'ended');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  type chat_type not null,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_members (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role chat_member_role not null default 'member',
  primary key (chat_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  type chat_type not null,
  provider text not null check (provider = 'livekit'),
  room_name text not null,
  status call_status not null default 'ringing',
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.calls enable row level security;

create policy "profiles self access"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "chat membership read"
on public.chats
for select
using (
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = chats.id and cm.user_id = auth.uid()
  )
);

create policy "chat membership write"
on public.chats
for insert
with check (true);

create policy "chat_members visible by members"
on public.chat_members
for select
using (
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = chat_members.chat_id and cm.user_id = auth.uid()
  )
);

create policy "chat_members manage own rows"
on public.chat_members
for insert
with check (auth.uid() = user_id);

create policy "messages visible by chat members"
on public.messages
for select
using (
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = messages.chat_id and cm.user_id = auth.uid()
  )
);

create policy "messages insert by chat members"
on public.messages
for insert
with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = messages.chat_id and cm.user_id = auth.uid()
  )
);

create policy "calls visible by members"
on public.calls
for select
using (
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = calls.chat_id and cm.user_id = auth.uid()
  )
);

create policy "calls insert by members"
on public.calls
for insert
with check (
  auth.uid() = created_by and
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = calls.chat_id and cm.user_id = auth.uid()
  )
);

create policy "calls update by members"
on public.calls
for update
using (
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = calls.chat_id and cm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.chat_members cm
    where cm.chat_id = calls.chat_id and cm.user_id = auth.uid()
  )
);

alter publication supabase_realtime add table public.messages;
