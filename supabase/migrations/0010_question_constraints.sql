-- 0010_question_constraints.sql
-- Khoá các luật của bảng questions ngay trong database.
--
-- VÌ SAO: cho tới nay các luật này chỉ nằm trong code của màn nhập câu hỏi.
-- Nghĩa là ai ghi thẳng vào database (chạy SQL tay, hoặc AI ghi hộ) đều đi
-- vòng qua toàn bộ phần kiểm tra, và không có gì báo cho biết. Đặt luật ở
-- database thì mọi đường ghi đều bị chặn như nhau, không phụ thuộc ai nhớ.
--
-- Đã kiểm 125 câu đang có: tất cả đều thoả, không dòng nào bị chặn.
-- Cũng đã đối chiếu 3 đường ghi của app (createQuestion, updateQuestion,
-- createQuestionsBulk) — cả ba đều đã lưu options là NULL cho câu điền chữ,
-- nên không có tính năng nào đang chạy bị chặn nhầm.

alter table questions
  add constraint questions_grade_valid
    check (grade between 6 and 9),

  add constraint questions_difficulty_valid
    check (difficulty in ('DE', 'TB', 'KHO')),

  add constraint questions_kind_valid
    check (kind in ('MCQ', 'DIEN')),

  add constraint questions_status_valid
    check (status in ('nhap', 'da_duyet', 'an')),

  add constraint questions_content_not_blank
    check (btrim(content) <> ''),

  add constraint questions_correct_answer_not_blank
    check (btrim(correct_answer) <> ''),

  -- KHOÁ QUAN TRỌNG NHẤT. Câu trắc nghiệm chấm bằng cách so nguyên văn chuỗi,
  -- nên nếu correct_answer không trùng phương án nào thì MỌI học sinh chọn
  -- đúng vẫn bị chấm sai — mà không có dấu hiệu gì trên giao diện. Trang sửa
  -- câu hỏi hiện chỉ CẢNH BÁO chuyện này, vẫn bấm lưu được. Có khoá này thì
  -- database từ chối thẳng, không lưu nổi trạng thái hỏng đó nữa.
  --
  -- Toán tử ? trên jsonb nghĩa là "chuỗi này có nằm trong mảng không".
  add constraint questions_mcq_shape
    check (
      kind <> 'MCQ'
      or (
        jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) between 2 and 4
        and options ? correct_answer
      )
    ),

  -- Câu điền chữ không có phương án nào. Lưu NULL chứ không phải mảng rỗng,
  -- để phân biệt rõ "không có phương án" với "có mảng nhưng rỗng".
  add constraint questions_dien_no_options
    check (
      kind <> 'DIEN'
      or options is null
    );

-- CỐ Ý KHÔNG khoá hai thứ sau:
--
-- 1. Trùng nội dung đề bài. Các câu ngữ âm dùng chung một dòng đề bài
--    ("Chọn từ có trọng âm khác với các từ còn lại.") một cách hợp lệ, phần
--    khác nhau nằm ở phương án. Khoá vào là chặn nhầm.
--
-- 2. Hai phương án trùng chữ trong cùng một câu. CHECK không dùng được truy
--    vấn con nên phải viết trigger, phức tạp hơn nhiều mà giá trị thấp.
--    Màn nhập vẫn đang kiểm việc này.
