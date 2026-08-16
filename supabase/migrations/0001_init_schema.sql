-- 0001_init_schema.sql
-- Tạo bảng theo docs/SCHEMA.md. Chưa bật Row Level Security ở đây — xem 0002.

create table teachers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers (id),
  name text not null,
  join_code text not null unique,
  grade int not null,
  is_active bool not null default true
);

create table students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  username text not null,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id),
  class_id uuid not null references classes (id),
  joined_at timestamptz not null default now(),
  left_at timestamptz
);

create table skill_tags (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_vi text not null,
  group_name text not null
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers (id),
  kind text not null,
  grade int not null,
  difficulty text not null,
  content text not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  source text,
  media_url text,
  status text not null default 'nhap'
);

create table question_tags (
  question_id uuid not null references questions (id),
  skill_tag_id uuid not null references skill_tags (id),
  is_primary bool not null default false,
  primary key (question_id, skill_tag_id)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id),
  title text not null,
  due_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table assignment_questions (
  assignment_id uuid not null references assignments (id),
  question_id uuid not null references questions (id),
  position int not null,
  primary key (assignment_id, question_id)
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments (id),
  student_id uuid not null references students (id),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts (id),
  question_id uuid not null references questions (id),
  given_answer text,
  is_correct bool,
  answered_at timestamptz not null default now(),
  seconds_spent int,
  unique (attempt_id, question_id)
);
