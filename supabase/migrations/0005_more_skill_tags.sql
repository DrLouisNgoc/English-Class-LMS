-- 0005_more_skill_tags.sql
-- Bổ sung danh sách kỹ năng tiếng Anh THCS (khối 6-9) cho `skill_tags`, dựa
-- theo Chương trình GDPT 2018 môn Tiếng Anh và cấu trúc đề thi tuyển sinh
-- vào 10 (nguồn đề ngân hàng câu hỏi đang dùng).
--
-- Chỉ THÊM, không sửa/xoá 6 kỹ năng đã seed từ trước (xem supabase/seed.sql)
-- — is_primary trong question_tags đang trỏ tới các id đó.
--
-- Không có nhóm Nghe/Nói vì ngân hàng câu hỏi hiện tại chỉ ở dạng văn bản
-- (MCQ đọc/viết) — luyện phát âm cần tính năng riêng (xem docs/TASKS.md,
-- mục Sau MVP: "Luyện phát âm").

insert into skill_tags (code, name_vi, group_name) values
  -- NGỮ ÂM — 2 câu đầu đề vào 10 thường hỏi trọng âm/phát âm
  ('pho.stress', 'Trọng âm', 'NGỮ ÂM'),
  ('pho.pronunciation', 'Phát âm (âm khác biệt)', 'NGỮ ÂM'),

  -- NGỮ PHÁP — mở rộng thêm các điểm ngữ pháp trọng tâm THCS
  ('gra.tense', 'Thì của động từ', 'NGỮ PHÁP'),
  ('gra.passive', 'Câu bị động', 'NGỮ PHÁP'),
  ('gra.relative_clause', 'Mệnh đề quan hệ', 'NGỮ PHÁP'),
  ('gra.reported_speech', 'Câu tường thuật', 'NGỮ PHÁP'),
  ('gra.comparison', 'So sánh hơn / nhất / bằng', 'NGỮ PHÁP'),
  ('gra.article', 'Mạo từ (a/an/the)', 'NGỮ PHÁP'),
  ('gra.preposition', 'Giới từ', 'NGỮ PHÁP'),
  ('gra.gerund_infinitive', 'Danh động từ & động từ nguyên mẫu', 'NGỮ PHÁP'),
  ('gra.modal_verb', 'Động từ khuyết thiếu', 'NGỮ PHÁP'),
  ('gra.word_form', 'Dạng từ (biến đổi từ loại)', 'NGỮ PHÁP'),
  ('gra.error_identification', 'Tìm và sửa lỗi sai', 'NGỮ PHÁP'),

  -- TỪ VỰNG — mở rộng thêm
  ('voc.phrasal_verb', 'Cụm động từ (phrasal verb)', 'TỪ VỰNG'),
  ('voc.synonym_antonym', 'Từ đồng nghĩa / trái nghĩa', 'TỪ VỰNG'),

  -- ĐỌC HIỂU — mở rộng thêm các dạng câu hỏi đọc hiểu cụ thể
  ('read.main_idea', 'Ý chính của đoạn văn', 'ĐỌC HIỂU'),
  ('read.detail', 'Chi tiết trong bài (đúng/sai)', 'ĐỌC HIỂU'),
  ('read.reference', 'Từ thay thế / tham chiếu (it, this, they...)', 'ĐỌC HIỂU'),
  ('read.inference', 'Suy luận từ bài đọc', 'ĐỌC HIỂU'),
  ('read.vocab_in_context', 'Đoán nghĩa từ qua ngữ cảnh', 'ĐỌC HIỂU'),

  -- VIẾT — nhóm mới, các dạng bài biến đổi câu/đoạn văn
  ('wri.sentence_transformation', 'Viết lại câu (giữ nguyên nghĩa)', 'VIẾT'),
  ('wri.sentence_ordering', 'Sắp xếp câu / đoạn văn hợp lý', 'VIẾT'),

  -- GIAO TIẾP — nhóm mới
  ('com.functional_language', 'Chức năng giao tiếp (mời, xin lỗi, đề nghị...)', 'GIAO TIẾP')
on conflict (code) do nothing;
