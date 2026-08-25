-- 0008_add_passages.sql
-- Bài đọc hiểu dùng chung một đoạn văn (tính năng C2).
--
-- Vấn đề đang gặp: mỗi câu hỏi tự chứa toàn bộ nội dung, nên một bài đọc hiểu
-- 5 câu phải chép lại cả đoạn văn vào từng câu — thô, dễ sai lệch giữa các
-- câu, và sửa đoạn văn thì phải sửa 5 chỗ.
--
-- Cách làm: tách đoạn văn ra bảng riêng, câu hỏi trỏ vào bằng passage_id.

create table passages (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers (id),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Cho phép NULL vì phần lớn câu hỏi vẫn độc lập, không thuộc bài đọc nào.
-- Không có on delete cascade: xoá đoạn văn mà còn câu hỏi dùng nó thì
-- Postgres sẽ chặn lại — đúng ý, vì xoá lan sang câu hỏi là mất dữ liệu thật.
alter table questions add column passage_id uuid references passages (id);

-- Tìm nhanh các câu thuộc cùng một bài đọc.
create index questions_passage_id_idx on questions (passage_id);

-- Bật RLS như mọi bảng khác (xem 0002).
alter table passages enable row level security;

-- Policy theo đúng kiểu 0004: passages do giáo viên sở hữu, mà GV đăng nhập
-- qua Supabase Auth nên auth.uid() nhận diện được.
create policy "passages_all_own" on passages
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
