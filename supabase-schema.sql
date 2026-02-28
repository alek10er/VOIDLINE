-- Создайте расширение, если оно еще не включено
create extension if not exists "pgcrypto";

-- Профили пользователей, связанные с auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Автообновление updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Заполняем profile после регистрации пользователя
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Тестовый пользователь (ТОЛЬКО ДЛЯ DEV/STAGING)
-- Email: test@voidline.dev
-- Password: VoidlineTest123!
do $$
declare
  test_user_id uuid := '11111111-1111-4111-8111-111111111111';
begin
  if not exists (select 1 from auth.users where email = 'test@voidline.dev') then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'test@voidline.dev',
      crypt('VoidlineTest123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"voidline_test","first_name":"Test","last_name":"User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at,
      last_sign_in_at
    )
    values (
      gen_random_uuid(),
      test_user_id,
      jsonb_build_object(
        'sub', test_user_id::text,
        'email', 'test@voidline.dev'
      ),
      'email',
      test_user_id::text,
      now(),
      now(),
      now()
    )
    on conflict do nothing;
  end if;
end;
$$;
