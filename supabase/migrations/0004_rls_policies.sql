-- 0004_rls_policies.sql
-- Viết luật (policy) cho RLS đã bật ở 0002. Server luôn dùng service role key
-- (bỏ qua RLS hoàn toàn) nên các policy này không đổi gì hành vi app hiện tại
-- — chỉ có tác dụng nếu sau này có code chạy bằng anon key (ví dụ Client
-- Component gọi thẳng Supabase). Mục tiêu: nếu điều đó xảy ra, GV chỉ đụng
-- được dữ liệu của chính mình thay vì mặc định bị chặn hết (an toàn hơn) hoặc
-- vô tình mở hết ra (nguy hiểm).
--
-- CHỈ áp dụng cho bảng do giáo viên sở hữu, vì GV đăng nhập qua Supabase Auth
-- nên auth.uid() nhận diện được GV (xem 0003_link_teachers_auth.sql).
--
-- Học sinh đăng nhập bằng cookie tự ký riêng (lib/supabase/studentSession.ts),
-- KHÔNG phải Supabase Auth — Postgres không có auth.uid() nào cho học sinh.
-- Vì vậy các bảng liên quan học sinh (students, enrollments, attempts,
-- answers) KHÔNG có policy trong migration này, giữ nguyên "bật RLS, không
-- policy nào cả" = mặc định chặn hết với anon key, như từ 0002. Việc lọc
-- "học sinh chỉ thấy dữ liệu của mình" tiếp tục do code server action đảm
-- nhiệm. Muốn RLS thật chặn được theo từng học sinh cần đổi cách học sinh
-- đăng nhập sang thứ Postgres nhận diện được — việc lớn hơn, để sau.

-- teachers: GV chỉ xem/sửa được đúng hồ sơ của mình
create policy "teachers_select_own" on teachers
  for select to authenticated
  using (id = auth.uid());

create policy "teachers_update_own" on teachers
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- classes: GV chỉ thao tác được lớp do mình tạo
create policy "classes_all_own" on classes
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- questions: GV chỉ thao tác được câu hỏi do mình tạo
create policy "questions_all_own" on questions
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- skill_tags: danh sách kỹ năng dùng chung cho mọi GV (không do GV nào sở
-- hữu riêng, chỉ đọc trong app) — cho mọi GV đã đăng nhập đọc được
create policy "skill_tags_select_all" on skill_tags
  for select to authenticated
  using (true);

-- question_tags: đi theo quyền của câu hỏi tương ứng
create policy "question_tags_all_via_question" on question_tags
  for all to authenticated
  using (
    exists (
      select 1 from questions
      where questions.id = question_tags.question_id
        and questions.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from questions
      where questions.id = question_tags.question_id
        and questions.teacher_id = auth.uid()
    )
  );

-- assignments: đi theo quyền của lớp tương ứng
create policy "assignments_all_via_class" on assignments
  for all to authenticated
  using (
    exists (
      select 1 from classes
      where classes.id = assignments.class_id
        and classes.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from classes
      where classes.id = assignments.class_id
        and classes.teacher_id = auth.uid()
    )
  );

-- assignment_questions: đi theo quyền của bài giao tương ứng
create policy "assignment_questions_all_via_assignment" on assignment_questions
  for all to authenticated
  using (
    exists (
      select 1 from assignments
      join classes on classes.id = assignments.class_id
      where assignments.id = assignment_questions.assignment_id
        and classes.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from assignments
      join classes on classes.id = assignments.class_id
      where assignments.id = assignment_questions.assignment_id
        and classes.teacher_id = auth.uid()
    )
  );
