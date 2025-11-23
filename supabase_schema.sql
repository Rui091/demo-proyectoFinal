-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text check (role in ('admin', 'user')) default 'user',
  created_at timestamptz default now()
);

-- Create devices table
create table if not exists public.devices (
  id uuid default uuid_generate_v4() primary key,
  model text not null,
  type text check (type in ('robot', 'drone')) not null,
  capacity_kg float not null,
  battery_autonomy text not null,
  serial_number text unique not null,
  status text check (status in ('available', 'busy', 'maintenance')) default 'available',
  action text not null, -- e.g., "CREATE", "UPDATE", "DELETE"
  table_name text not null,
  record_id uuid,
  performed_by uuid references public.profiles(id),
  details text,
  timestamp timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.requests enable row level security;
alter table public.audit_logs enable row level security;

-- Policies (Drop existing before creating to avoid errors)
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

drop policy if exists "Devices are viewable by everyone" on devices;
drop policy if exists "Admins can insert devices" on devices;
drop policy if exists "Admins can update devices" on devices;

drop policy if exists "Users can see own requests" on requests;
drop policy if exists "Users can create requests" on requests;
drop policy if exists "Admins can update requests" on requests;

drop policy if exists "Admins can view audit logs" on audit_logs;
drop policy if exists "System can insert audit logs" on audit_logs;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Devices Policies
create policy "Devices are viewable by everyone" on devices for select using (true);
create policy "Admins can insert devices" on devices for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update devices" on devices for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Requests Policies
create policy "Users can see own requests" on requests for select using (auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can create requests" on requests for insert with check (auth.uid() = user_id);
create policy "Admins can update requests" on requests for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Audit Logs Policies
create policy "Admins can view audit logs" on audit_logs for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "System can insert audit logs" on audit_logs for insert with check (true);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup (Drop if exists)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
