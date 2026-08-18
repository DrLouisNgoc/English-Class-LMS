# SCHEMA — Bản nháp

> ⚠️ Đây là **bản nháp để bạn phản biện**, không phải để dùng luôn.
> Trước khi chốt, hãy chạy bài kiểm tra ở cuối file. Đổi schema sau khi đã có
> dữ liệu thật là việc tốn kém nhất trong toàn bộ dự án.

## Các bảng của MVP

### teachers

| cột        | kiểu        | ghi chú                                         |
| ---------- | ----------- | ----------------------------------------------- |
| id         | uuid        | khoá chính                                      |
| email      | text        | dùng Supabase Auth cho GV (chỉ GV mới có email) |
| full_name  | text        |                                                 |
| created_at | timestamptz |                                                 |

### classes

| cột        | kiểu | ghi chú                                     |
| ---------- | ---- | ------------------------------------------- |
| id         | uuid |                                             |
| teacher_id | uuid | → teachers.id                               |
| name       | text | "8A - Tối T3,T6"                            |
| join_code  | text | mã lớp ngắn, duy nhất, HS dùng để đăng nhập |
| grade      | int  | 6/7/8/9                                     |
| is_active  | bool | lớp cũ thì tắt đi, KHÔNG xoá                |

### students

| cột        | kiểu        | ghi chú                        |
| ---------- | ----------- | ------------------------------ |
| id         | uuid        |                                |
| full_name  | text        |                                |
| username   | text        | duy nhất trong phạm vi một lớp |
| pin_hash   | text        | **băm, không lưu PIN thô**     |
| created_at | timestamptz |                                |

### enrollments

Bảng nối. **Không nhét `class_id` thẳng vào `students`** — vì học sinh có thể chuyển lớp hoặc học 2 khoá cùng lúc, và bạn cần giữ lại dữ liệu cũ.

| cột        | kiểu        | ghi chú           |
| ---------- | ----------- | ----------------- |
| id         | uuid        |                   |
| student_id | uuid        | → students.id     |
| class_id   | uuid        | → classes.id      |
| joined_at  | timestamptz |                   |
| left_at    | timestamptz | null nếu đang học |

### skill_tags

| cột        | kiểu | ghi chú                     |
| ---------- | ---- | --------------------------- |
| id         | uuid |                             |
| code       | text | `gra.tense.present_perfect` |
| name_vi    | text | "Thì hiện tại hoàn thành"   |
| group_name | text | "NGỮ PHÁP"                  |

### questions

| cột            | kiểu  | ghi chú                                                                      |
| -------------- | ----- | ---------------------------------------------------------------------------- |
| id             | uuid  |                                                                              |
| teacher_id     | uuid  | ai sở hữu câu hỏi này                                                        |
| kind           | text  | MCQ / DIEN_TU / VIET_LAI / ...                                               |
| grade          | int   |                                                                              |
| difficulty     | text  | DE / TB / KHO                                                                |
| content        | text  | đề bài                                                                       |
| options        | jsonb | `["lives","lived","has lived","is living"]`, null nếu không phải trắc nghiệm |
| correct_answer | text  | **cột này không bao giờ được gửi xuống trình duyệt trước khi nộp bài**       |
| explanation    | text  | giải thích tiếng Việt                                                        |
| source         | text  |                                                                              |
| media_url      | text  |                                                                              |
| status         | text  | nhap / da_duyet                                                              |

### question_tags

Bảng nối questions ↔ skill_tags (một câu có thể mang nhiều tag).

| cột          | kiểu |
| ------------ | ---- |
| question_id  | uuid |
| skill_tag_id | uuid |
| is_primary   | bool |

### assignments

| cột        | kiểu        | ghi chú                 |
| ---------- | ----------- | ----------------------- |
| id         | uuid        |                         |
| class_id   | uuid        |                         |
| title      | text        | "BTVN tuần 3 - Bị động" |
| due_at     | timestamptz |                         |
| created_at | timestamptz |                         |

### assignment_questions

| cột           | kiểu | ghi chú    |
| ------------- | ---- | ---------- |
| assignment_id | uuid |            |
| question_id   | uuid |            |
| position      | int  | thứ tự câu |

> Lưu ý: lưu tham chiếu `question_id` chứ không copy nội dung câu hỏi. Nhưng nếu
> sau này bạn sửa một câu hỏi đã giao, bài cũ sẽ đổi theo. Chấp nhận được ở MVP;
> nếu thấy phiền, sau này thêm cột `snapshot jsonb`.

### attempts

Một lần học sinh làm một bài.

| cột           | kiểu        | ghi chú               |
| ------------- | ----------- | --------------------- |
| id            | uuid        |                       |
| assignment_id | uuid        |                       |
| student_id    | uuid        |                       |
| started_at    | timestamptz |                       |
| submitted_at  | timestamptz | null nếu đang làm dở  |
| score         | numeric     | tính ở server lúc nộp |

### answers

| cột           | kiểu        | ghi chú                                           |
| ------------- | ----------- | ------------------------------------------------- |
| id            | uuid        |                                                   |
| attempt_id    | uuid        |                                                   |
| question_id   | uuid        |                                                   |
| given_answer  | text        |                                                   |
| is_correct    | bool        | server ghi, không phải trình duyệt                |
| answered_at   | timestamptz |                                                   |
| seconds_spent | int         | **đừng bỏ cột này** — sau này là dữ liệu quý nhất |

Ràng buộc: `unique(attempt_id, question_id)` — mỗi câu một câu trả lời, ghi đè khi HS đổi ý.

---

## Bài kiểm tra trước khi chốt schema

Dán đoạn này cho AI cùng với schema trên:

> Với schema này, hãy viết câu SQL cho từng câu hỏi dưới đây. Nếu câu nào không
> trả lời được, chỉ rõ thiếu bảng hay thiếu cột nào:
>
> 1. Học sinh Minh yếu nhất ở kỹ năng nào trong 3 tháng qua?
> 2. Câu hỏi nào cả lớp 8A sai nhiều nhất học kỳ này?
> 3. Những em nào chưa nộp bài tập hạn hôm nay?
> 4. Một học sinh chuyển từ 8A sang 8B thì dữ liệu bài làm cũ có còn truy được không?
> 5. Điểm trung bình của lớp 8A theo từng tuần trong 2 tháng qua?
> 6. Câu nào học sinh làm nhanh bất thường (nghi ngờ đoán bừa hoặc chép)?

Nếu AI phải vòng vo mới viết được, schema có vấn đề. Sửa **bây giờ**.

## Việc phải làm ngay sau khi tạo bảng

Bật Row Level Security cho **tất cả** các bảng. Supabase mặc định để mở — nếu quên bước này, bất kỳ ai có link cũng đọc được toàn bộ dữ liệu học sinh.
