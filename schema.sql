-- ═══════════════════════════════════════════════════════
-- GYMOS — Schema completo para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

-- Extensión UUID
create extension if not exists "uuid-ossp";

-- ── GYMS ────────────────────────────────────────────────
create table gyms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- ── PROFILES ────────────────────────────────────────────
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('trainer', 'client')),
  full_name text,
  phone text,
  gym_id uuid references gyms(id),
  status text default 'pending' check (status in ('pending', 'active', 'inactive')),
  created_at timestamptz default now()
);

-- ── MACHINES ────────────────────────────────────────────
create table machines (
  id uuid default uuid_generate_v4() primary key,
  gym_id uuid references gyms(id) on delete cascade,
  name text not null,
  category text not null,
  available boolean default true,
  created_at timestamptz default now()
);

-- ── ASSESSMENTS (test inicial del cliente) ───────────────
create table assessments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade unique,
  -- Datos personales
  age int,
  weight numeric,
  height numeric,
  sex text,
  injuries text,
  -- Objetivos
  goal text,
  specific_goal text,
  -- Nivel físico
  gym_exp text,
  gym_days int,
  gym_days_min int,
  gym_days_max int,
  session_time text,
  fitness_level text,
  benchmarks text,
  -- Vida diaria
  occupation text,
  daily_steps text,
  sleep text,
  -- Test físico (lo completa el entrenador)
  physical_test_done boolean default false,
  fms_squat text,
  fms_lunge text,
  fms_shoulder text,
  fms_hamstring text,
  test_plank int,
  test_pushup int,
  weak_zones text,
  strengthen_zones text,
  test_notes text,
  -- Análisis corporal (lo carga el nutricionista / entrenador)
  body_fat_pct numeric,
  muscle_mass_kg numeric,
  visceral_fat int,
  analysis_date date,
  analysis_notes text,
  -- Control
  client_completed boolean default false,
  trainer_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── WORKOUT PLANS ────────────────────────────────────────
create table workout_plans (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  gym_id uuid references gyms(id),
  month int not null,
  year int not null,
  days_per_week int not null,
  plan_data jsonb not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── DAILY QR ────────────────────────────────────────────
create table daily_qr (
  id uuid default uuid_generate_v4() primary key,
  gym_id uuid references gyms(id) on delete cascade,
  date date not null,
  code char(6) not null,
  created_at timestamptz default now(),
  unique(gym_id, date)
);

-- ── ATTENDANCE ──────────────────────────────────────────
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  gym_id uuid references gyms(id),
  date date default current_date,
  plan_day_index int,
  created_at timestamptz default now(),
  unique(client_id, date)
);

-- ── PAYMENTS ────────────────────────────────────────────
create table payments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references profiles(id) on delete cascade,
  gym_id uuid references gyms(id),
  amount numeric not null,
  due_date date not null,
  paid_date date,
  status text default 'pending' check (status in ('pending', 'paid', 'overdue')),
  notes text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table gyms enable row level security;
alter table machines enable row level security;
alter table assessments enable row level security;
alter table workout_plans enable row level security;
alter table daily_qr enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;

-- PROFILES
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Trainers read gym clients" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'trainer' and p.gym_id = profiles.gym_id)
);
create policy "Trainers update gym clients" on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'trainer' and p.gym_id = profiles.gym_id)
);

-- GYMS
create policy "Trainers manage own gym" on gyms for all using (owner_id = auth.uid());
create policy "Clients read own gym" on gyms for select using (
  exists (select 1 from profiles where id = auth.uid() and gym_id = gyms.id)
);

-- MACHINES
create policy "Trainers manage machines" on machines for all using (
  exists (select 1 from gyms where id = machines.gym_id and owner_id = auth.uid())
);
create policy "Clients read gym machines" on machines for select using (
  exists (select 1 from profiles where id = auth.uid() and gym_id = machines.gym_id)
);

-- ASSESSMENTS
create policy "Clients manage own assessment" on assessments for all using (client_id = auth.uid());
create policy "Trainers manage gym assessments" on assessments for all using (
  exists (
    select 1 from profiles p
    join profiles c on c.id = assessments.client_id
    where p.id = auth.uid() and p.role = 'trainer' and p.gym_id = c.gym_id
  )
);

-- WORKOUT PLANS
create policy "Clients read own plans" on workout_plans for select using (client_id = auth.uid());
create policy "Trainers manage gym plans" on workout_plans for all using (
  exists (select 1 from gyms where id = workout_plans.gym_id and owner_id = auth.uid())
);

-- DAILY QR
create policy "Trainers manage QR" on daily_qr for all using (
  exists (select 1 from gyms where id = daily_qr.gym_id and owner_id = auth.uid())
);
create policy "Clients read QR" on daily_qr for select using (
  exists (select 1 from profiles where id = auth.uid() and gym_id = daily_qr.gym_id)
);

-- ATTENDANCE
create policy "Clients manage own attendance" on attendance for all using (client_id = auth.uid());
create policy "Trainers read gym attendance" on attendance for select using (
  exists (select 1 from gyms where id = attendance.gym_id and owner_id = auth.uid())
);

-- PAYMENTS
create policy "Clients read own payments" on payments for select using (client_id = auth.uid());
create policy "Trainers manage gym payments" on payments for all using (
  exists (select 1 from gyms where id = payments.gym_id and owner_id = auth.uid())
);

-- ═══════════════════════════════════════════════════════
-- TRIGGER: auto-update assessments.updated_at
-- ═══════════════════════════════════════════════════════
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger assessments_updated_at
  before update on assessments
  for each row execute function update_updated_at();
