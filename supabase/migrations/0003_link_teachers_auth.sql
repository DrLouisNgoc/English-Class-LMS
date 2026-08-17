-- 0003_link_teachers_auth.sql
-- GV đăng nhập qua Supabase Auth (email + password), quản lý ở bảng auth.users.
-- Liên kết bảng teachers với auth.users: teachers.id PHẢI trùng id của user
-- tương ứng trong auth.users (không tự sinh uuid riêng nữa).

alter table teachers alter column id drop default;
alter table teachers
  add constraint teachers_id_fkey foreign key (id) references auth.users (id) on delete cascade;