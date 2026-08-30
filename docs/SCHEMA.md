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

| cột        | kiểu        | ghi chú                                                                                                                                                                             |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id         | uuid        |                                                                                                                                                                                     |
| full_name  | text        |                                                                                                                                                                                     |
| username   | text        | duy nhất trong phạm vi một lớp (kiểm tra ở app, không có ràng buộc unique trong DB), luôn lưu chữ thường                                                                            |
| pin_hash   | text        | **băm bằng scrypt, không lưu chữ thường.** Tên cột giữ nguyên từ lúc còn là PIN ngẫu nhiên, nhưng từ 2026-08-21 chứa mật khẩu do GV hoặc chính học sinh tự đặt — xem `decisions.md` |
| created_at | timestamptz |                                                                                                                                                                                     |

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

### passages

Đoạn văn của bài đọc hiểu, để nhiều câu hỏi dùng chung thay vì chép lại vào
từng câu. Thêm ngày 2026-08-26 qua `0008_add_passages.sql`.

| cột        | kiểu        | ghi chú                                                         |
| ---------- | ----------- | --------------------------------------------------------------- |
| id         | uuid        |                                                                 |
| teacher_id | uuid        | ai sở hữu bài đọc này                                           |
| title      | text        | **chỉ giáo viên thấy**, để tìm lại bài — không gửi cho học sinh |
| content    | text        | đoạn văn học sinh đọc                                           |
| created_at | timestamptz | mặc định `now()`                                                |

⚠️ `questions.passage_id` trỏ tới bảng này **không có `on delete cascade`** —
xoá đoạn văn mà còn câu hỏi dùng nó thì Postgres chặn lại. Cố ý như vậy: mất
câu hỏi là mất cả bài làm của học sinh trỏ vào đó. Xem `decisions.md` 2026-08-26.

### questions

| cột            | kiểu  | ghi chú                                                                      |
| -------------- | ----- | ---------------------------------------------------------------------------- |
| id             | uuid  |                                                                              |
| teacher_id     | uuid  | ai sở hữu câu hỏi này                                                        |
| kind           | text  | **MCQ** (trắc nghiệm 2–4 phương án) / **DIEN** (điền chữ). Xem ghi chú dưới  |
| grade          | int   |                                                                              |
| difficulty     | text  | DE / TB / KHO                                                                |
| content        | text  | đề bài                                                                       |
| options        | jsonb | `["lives","lived","has lived","is living"]`, null nếu không phải trắc nghiệm |
| correct_answer | text  | **cột này không bao giờ được gửi xuống trình duyệt trước khi nộp bài**       |
| explanation    | text  | giải thích tiếng Việt                                                        |
| source         | text  |                                                                              |
| media_url      | text  | có sẵn từ đầu nhưng **chưa dùng ở đâu** — app chưa hiển thị được ảnh         |
| status         | text  | nhap / da_duyet / an                                                         |
| passage_id     | uuid  | bài đọc hiểu câu này dùng chung, null nếu là câu độc lập (thêm `0008`)       |

**Giá trị `kind` đang dùng thật — chỉ có đúng 2:**

- `MCQ` — trắc nghiệm. `options` chứa **từ 2 đến 4** phương án (2 phương án =
  câu Đúng/Sai). `correct_answer` lưu **nguyên văn** phương án đúng.
- `DIEN` — điền chữ, học sinh tự gõ. `options` là **null**. `correct_answer` lưu
  các cách trả lời đúng, phân cách bằng dấu `|` — ví dụ `doesn't|does not`. Bộ
  chấm bỏ qua hoa/thường, khoảng trắng thừa và dấu chấm cuối câu.

⚠️ Bản đầu tiên của tài liệu này ghi `DIEN_TU` và `VIET_LAI` — **cả hai đều
không đúng với code**. Tên thật là `DIEN`, còn dạng viết lại câu (thầy chấm tay)
**chưa làm**. Đừng ghi tay hai giá trị đó vào database: máy sẽ không chấm được.

### Luật của bảng `questions` được khoá trong database (migration `0010`)

Trước đây các luật này chỉ nằm trong code màn nhập câu hỏi, nên ai ghi thẳng vào
database (chạy SQL tay, hoặc nhờ AI ghi hộ) đều đi vòng qua hết mà không có gì
báo. Từ `0010` chúng là ràng buộc `CHECK`, mọi đường ghi đều bị chặn như nhau.

| Ràng buộc                            | Luật                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `questions_grade_valid`              | `grade` trong 6–9                                                                     |
| `questions_difficulty_valid`         | `difficulty` là `DE` / `TB` / `KHO`                                                   |
| `questions_kind_valid`               | `kind` là `MCQ` / `DIEN`                                                              |
| `questions_status_valid`             | `status` là `nhap` / `da_duyet` / `an`                                                |
| `questions_content_not_blank`        | `content` không được rỗng                                                             |
| `questions_correct_answer_not_blank` | `correct_answer` không được rỗng                                                      |
| `questions_mcq_shape`                | câu MCQ: `options` là mảng 2–4 phần tử **và** `correct_answer` phải nằm trong mảng đó |
| `questions_dien_no_options`          | câu DIEN: `options` phải là `NULL`                                                    |

`questions_mcq_shape` là cái quan trọng nhất. Câu trắc nghiệm chấm bằng cách so
nguyên văn chuỗi, nên `correct_answer` lạc khỏi danh sách phương án sẽ khiến
**mọi học sinh chọn đúng vẫn bị chấm sai**, mà giao diện không có dấu hiệu gì.
Trang sửa câu hỏi chỉ cảnh báo chuyện này chứ vẫn cho lưu; ràng buộc thì từ chối
thẳng.

Hai thứ **cố ý không khoá**: trùng nội dung đề bài (các câu ngữ âm dùng chung một
dòng đề bài một cách hợp lệ), và hai phương án trùng chữ trong cùng một câu
(`CHECK` không dùng được truy vấn con, phải viết trigger — màn nhập vẫn đang kiểm).

**Ngoặc vuông trong `content` và `options` = phần gạch chân.**

Đề thi phần ngữ âm bắt buộc gạch chân phần âm được hỏi, dạng tìm lỗi sai cũng
gạch chân bốn phần trong câu. Hai cột này là text thuần, không lưu được định
dạng chữ, nên dùng quy ước: `br[ea]d` hiện ra thành `bread` với `ea` gạch chân.

- Hàm dịch là `renderUnderline()` trong `lib/renderUnderline.tsx`. Nó cắt chuỗi
  rồi ghép thẻ `<u>` bằng React, **không** dùng `dangerouslySetInnerHTML`.
- Ngoặc mở mà thiếu ngoặc đóng thì in nguyên văn, không cố đoán.
- Dấu `______` của chỗ trống **không** bị ảnh hưởng — hai ký hiệu không đụng nhau.
- **Bộ chấm không biết gì về quy ước này**, và không cần biết: câu trắc nghiệm
  so nguyên văn, mà `given_answer` lẫn `correct_answer` đều còn nguyên dấu ngoặc
  nên vẫn khớp. Nghĩa là `correct_answer` của câu phát âm phải lưu **cả ngoặc**
  (`br[ea]d`), đúng y như chuỗi trong `options`.

### question_tags

Bảng nối questions ↔ skill_tags (một câu có thể mang nhiều tag).

| cột          | kiểu |
| ------------ | ---- |
| question_id  | uuid |
| skill_tag_id | uuid |
| is_primary   | bool |

### assignments

| cột        | kiểu        | ghi chú                       |
| ---------- | ----------- | ----------------------------- |
| id         | uuid        |                               |
| class_id   | uuid        |                               |
| title      | text        | "BTVN tuần 3 - Bị động"       |
| due_at     | timestamptz |                               |
| created_at | timestamptz |                               |
| hidden_at  | timestamptz | null = đang hiện với học sinh |

`hidden_at` là cách dọn danh sách bài mà **không** mất dữ liệu: có giờ thì bài
biến khỏi `/student/home` và không mở được bằng link cũ, nhưng `attempts` và
`answers` giữ nguyên nên điểm, lịch sử và trang "Kỹ năng của em" không đổi.
Bỏ ẩn chỉ cần đặt lại về null.

Cần phân biệt với **xoá hẳn** (`deleteAssignment`): xoá thì mất luôn bài làm
của học sinh, và vì schema không đặt `on delete cascade` ở khoá ngoại nào nên
phải xoá con trước cha theo thứ tự `answers` → `attempts` →
`assignment_questions` → `assignments`.

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

| cột           | kiểu        | ghi chú                                            |
| ------------- | ----------- | -------------------------------------------------- |
| id            | uuid        |                                                    |
| assignment_id | uuid        |                                                    |
| student_id    | uuid        |                                                    |
| started_at    | timestamptz |                                                    |
| submitted_at  | timestamptz | null nếu đang làm dở                               |
| score         | numeric     | tính ở server lúc nộp                              |
| comment       | text        | lời phê của thầy, null nếu chưa viết (thêm `0007`) |

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
