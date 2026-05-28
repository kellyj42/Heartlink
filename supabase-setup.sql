create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  gender text check (gender in ('Male', 'Female')),
  dating_goal text,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  status text not null default 'active' check (status in ('active', 'paused', 'review', 'blocked')),
  matchmaking_answers jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.profiles
add column if not exists role text not null default 'user'
check (role in ('user', 'moderator', 'admin'));
alter table public.profiles
add column if not exists status text not null default 'active'
check (status in ('active', 'paused', 'review', 'blocked'));
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);
create extension if not exists pgcrypto;
create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'denied')),
  created_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  unique (sender_id, receiver_id),
  check (sender_id <> receiver_id)
);
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  check (sender_id <> receiver_id)
);
create table if not exists public.photo_likes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  liker_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, image_url, liker_id),
  check (profile_id <> liker_id)
);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
alter table public.chat_messages
add column if not exists read_at timestamptz;
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = timezone('utc', now());
return new;
end;
$$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before
update on public.profiles for each row execute function public.set_updated_at();
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set
  search_path = public as $$ begin
insert into public.profiles (
    id,
    full_name,
    email,
    gender,
    dating_goal
  )
values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      'HeartLink User'
    ),
    lower(new.email),
    case
      when new.raw_user_meta_data->>'gender' = 'Female' then 'Female'
      else 'Male'
    end,
    coalesce(
      new.raw_user_meta_data->>'dating_goal',
      'Long-term relationship'
    )
  ) on conflict (id) do nothing;
return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute function public.handle_new_user();
alter table public.profiles enable row level security;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for
select using (auth.uid() = id);
drop policy if exists "Authenticated users can view all profiles" on public.profiles;
create policy "Authenticated users can view all profiles" on public.profiles for
select using (auth.role() = 'authenticated');
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for
insert with check (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for
update using (auth.uid() = id) with check (auth.uid() = id);
alter table public.connection_requests enable row level security;
drop policy if exists "Users can view their own connection requests" on public.connection_requests;
create policy "Users can view their own connection requests" on public.connection_requests for
select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "Users can send connection requests" on public.connection_requests;
create policy "Users can send connection requests" on public.connection_requests for
insert with check (auth.uid() = sender_id);
drop policy if exists "Users can respond to received requests" on public.connection_requests;
create policy "Users can respond to received requests" on public.connection_requests for
update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);
alter table public.chat_messages enable row level security;
drop policy if exists "Accepted users can view chat messages" on public.chat_messages;
create policy "Accepted users can view chat messages" on public.chat_messages for
select using (
    (auth.uid() = sender_id or auth.uid() = receiver_id)
    and exists (
      select 1
      from public.connection_requests cr
      where cr.status = 'accepted'
        and (
          (cr.sender_id = chat_messages.sender_id and cr.receiver_id = chat_messages.receiver_id)
          or (cr.sender_id = chat_messages.receiver_id and cr.receiver_id = chat_messages.sender_id)
        )
    )
  );
drop policy if exists "Accepted users can send chat messages" on public.chat_messages;
create policy "Accepted users can send chat messages" on public.chat_messages for
insert with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.connection_requests cr
      where cr.status = 'accepted'
        and (
          (cr.sender_id = chat_messages.sender_id and cr.receiver_id = chat_messages.receiver_id)
          or (cr.sender_id = chat_messages.receiver_id and cr.receiver_id = chat_messages.sender_id)
        )
    )
  );
drop policy if exists "Users can mark received messages as read" on public.chat_messages;
create policy "Users can mark received messages as read" on public.chat_messages for
update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);
alter table public.photo_likes enable row level security;
drop policy if exists "Authenticated users can view photo likes" on public.photo_likes;
create policy "Authenticated users can view photo likes" on public.photo_likes for
select using (auth.role() = 'authenticated');
drop policy if exists "Users can like other users photos" on public.photo_likes;
create policy "Users can like other users photos" on public.photo_likes for
insert with check (auth.uid() = liker_id and auth.uid() <> profile_id);
drop policy if exists "Users can remove their own photo likes" on public.photo_likes;
create policy "Users can remove their own photo likes" on public.photo_likes for
delete using (auth.uid() = liker_id);
drop policy if exists "Anyone can view profile photos" on storage.objects;
create policy "Anyone can view profile photos" on storage.objects for
select using (bucket_id = 'profile-photos');
drop policy if exists "Users can upload their own profile photos" on storage.objects;
create policy "Users can upload their own profile photos" on storage.objects for
insert with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "Users can update their own profile photos" on storage.objects;
create policy "Users can update their own profile photos" on storage.objects for
update using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "Users can delete their own profile photos" on storage.objects;
create policy "Users can delete their own profile photos" on storage.objects for
delete using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
