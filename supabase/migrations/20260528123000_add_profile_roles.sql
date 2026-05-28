alter table public.profiles
add column if not exists role text not null default 'user'
check (role in ('user', 'moderator', 'admin'));

alter table public.profiles
add column if not exists status text not null default 'active'
check (status in ('active', 'paused', 'review', 'blocked'));

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);
