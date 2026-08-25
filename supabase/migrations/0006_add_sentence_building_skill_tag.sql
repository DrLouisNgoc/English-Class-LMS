-- 0006_add_sentence_building_skill_tag.sql
-- Bổ sung 1 kỹ năng còn thiếu, phát hiện khi gán kỹ năng cho 26 câu "Chưa gắn"
-- thực tế: dạng bài "Viết câu hoàn chỉnh từ các từ gợi ý" (word-cue sentence
-- building) khác với wri.sentence_transformation (viết lại câu giữ nguyên
-- nghĩa) và wri.sentence_ordering (sắp xếp câu có sẵn) đã có ở 0005.

insert into skill_tags (code, name_vi, group_name) values
  ('wri.sentence_building', 'Viết câu từ gợi ý', 'VIẾT')
on conflict (code) do nothing;
