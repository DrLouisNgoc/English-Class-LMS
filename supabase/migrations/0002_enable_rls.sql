-- 0002_enable_rls.sql
-- Bật RLS cho tất cả bảng. Chưa có policy nào — mặc định chặn hết truy cập
-- từ trình duyệt (anon key). Policy chi tiết sẽ thêm khi làm T3 (đăng nhập).
-- Service role key (dùng ở server) không bị RLS chặn.

alter table teachers enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table enrollments enable row level security;
alter table skill_tags enable row level security;
alter table questions enable row level security;
alter table question_tags enable row level security;
alter table assignments enable row level security;
alter table assignment_questions enable row level security;
alter table attempts enable row level security;
alter table answers enable row level security;
