# decisions.md — Nhật ký quyết định kiến trúc

> Mỗi lần đổi cách làm so với trước, ghi 3 dòng ở đây. Không cần dài — mục đích
> là 6 tháng sau bạn (hoặc AI) không hỏi lại "tại sao lúc trước làm thế này".

---

**2026-08-15 — Chọn Server Actions thay vì API routes cho mọi thao tác ghi dữ liệu**
Lý do: một cách làm duy nhất cho một loại việc, tránh AI trộn hai kiểu giữa các
phiên làm việc. Next.js App Router hỗ trợ tốt, không cần viết thêm route thủ công.

**2026-08-15 — Đăng nhập học sinh bằng mã lớp + username + PIN, không dùng email**
Lý do: học sinh cấp 2 không có email riêng, dễ quên mật khẩu. Giáo viên tạo tài
khoản sẵn và reset PIN được.
> ⚠️ Đổi lại một phần ngày 2026-08-21, xem quyết định bên dưới.

**2026-08-19 — Chuyển Vercel sang region Tokyo (hnd1)**
Lý do: mặc định Vercel chạy function ở Washington (Mỹ) trong khi Supabase đặt ở
Nhật và người dùng ở Việt Nam — độ trễ cao, giao diện load chậm mọi thao tác.
Thêm `vercel.json` với `"regions": ["hnd1"]`. Bài học kèm theo: biến môi trường
`NEXT_PUBLIC_*` không được tích "Sensitive" trên Vercel, vì loại biến này cần
đọc được LÚC BUILD, mà Sensitive giấu khỏi build — chỉ để Sensitive cho biến
đọc lúc runtime (`SUPABASE_SERVICE_ROLE_KEY`, `STUDENT_SESSION_SECRET`).

**2026-08-20 — Mọi form ghi dữ liệu phải tự khoá nút lúc đang gửi**
Lý do: lúc trang còn chậm (trước khi đổi region), GV bấm "Thêm học sinh" nhiều
lần liên tiếp vì tưởng không phản hồi → tạo hàng loạt học sinh trùng trong DB
(phải dọn tay). Từ nay mọi nút submit dùng chung component `SubmitButton`
(`useFormStatus` của `react-dom`) hoặc `useTransition` cho action gọi trực
tiếp — không viết `<button type="submit">` trần cho form ghi dữ liệu nữa.

**2026-08-21 — Bỏ sinh username/PIN ngẫu nhiên, chuyển sang username + mật khẩu
tự chọn (GV gõ tay hoặc HS tự đăng ký)**
Lý do: PIN 6 số ngẫu nhiên + việc phải in phiếu phát tay không hợp với cách GV
muốn vận hành lớp — muốn tự kiểm soát tài khoản hoặc để HS tự đăng ký như ứng
dụng thông thường. Đổi cụ thể:
- GV thêm học sinh: tự gõ username + mật khẩu (form `/classes/[id]`), không
  còn sinh ngẫu nhiên (bỏ `usernameBase`/`randomPin` khỏi luồng thêm mới —
  `resetStudentPin` vẫn còn sinh ngẫu nhiên cho tính năng reset).
- Thêm trang `/student-register`: học sinh tự đăng ký bằng mã lớp GV cấp + tự
  chọn username/mật khẩu.
- Cột `students.pin_hash` KHÔNG đổi tên/schema — vẫn băm bằng scrypt, chỉ đổi
  ý nghĩa dữ liệu bên trong (mật khẩu tự chọn thay vì PIN ngẫu nhiên).
- Trang đăng nhập HS đổi ô "PIN 6 số" thành "Mật khẩu" (bỏ giới hạn 6 ký tự số).
- Username luôn lưu chữ thường (cả 2 luồng) để tránh học sinh gõ nhầm hoa/thường.

**2026-08-21 — "Xoá học sinh" khỏi lớp là soft-delete, không xoá bảng**
Lý do: bảng `enrollments` đã có sẵn cột `left_at` đúng cho việc này. Nút "Xoá
khỏi lớp" chỉ set `left_at = now()`, không đụng tới `students`/`attempts` —
giữ nguyên lịch sử điểm cũ, học sinh chỉ không đăng nhập được nữa (điều kiện
đăng nhập/liệt kê học sinh lớp đều lọc `left_at is null`).

## 2026-08-22 — Không dùng plugin sinh design system tự động

**Bối cảnh:** thử cài `ui-ux-pro-max` (plugin GitHub) để hỗ trợ thiết kế.

**Kết quả:** plugin không nạp được — `marketplace.json` của nó dùng field `"id"`
không tương thích với Claude Code 2.1.126. Đã gỡ sạch.

**Quyết định:** không tìm plugin thay thế. Cách plugin đó hoạt động (chọn từ 79
style dựng sẵn + 192 palette theo ngành) đi ngược điều đang cần: thiết kế phải
bám chất liệu cụ thể của sản phẩm này (vở học sinh, bút đỏ chấm bài), không phải
ghép công thức có sẵn — đó chính là thứ tạo ra giao diện "AI slop".

**Cách làm thay thế:** thiết kế một trang thật trước (trang làm bài), rồi mới rút
token màu/font dùng chung ra từ đó. Không dựng design system trừu tượng trước khi
có trang thật.

## 2026-08-22 — Không dùng Figma cho dự án này

**Lý do:** vòng lặp "sửa code → chụp ảnh trình duyệt thật → xem lại" nhanh và
chính xác hơn dựng mockup rời trong Figma rồi code lại từ đầu. Ảnh chụp thật đã
giúp phát hiện 4 lỗi giao diện mà nhìn code không thấy được.

## 2026-08-22 — shadcn/ui: giữ token màu của dự án, không dùng màu mặc định

**Vấn đề:** `shadcn init` ghi đè `app/globals.css` (chèn bảng màu xám mặc định) và
`app/layout.tsx` (đổi font nội dung từ Be Vietnam Pro sang Geist).

**Xử lý:** hoàn nguyên font, và ánh xạ các biến ngữ nghĩa của shadcn vào bảng màu
"Vở tiếng Anh" (`--primary: var(--ink)`, `--destructive: var(--red-pen)`,
`--card: var(--surface)`…). Nhờ vậy mọi component shadcn thêm sau này tự động
đúng tông, không phải sửa từng cái. Đã bỏ khối `.dark` vì dự án không dùng
chế độ tối.

## 2026-08-23 — Trang trí phải là bố cục có nghĩa, không phải hoạ tiết lấp chỗ

**Yêu cầu ban đầu:** trang quá đơn giản, đơn điệu, nhiều khoảng trống hai bên
trên màn hình rộng — cần trang trí thêm cho đẹp và lấp đầy.

**Quyết định:** lấp khoảng trống bằng **bố cục có lý do** thay vì hoạ tiết suông.
Cụ thể: dựng khung `NotebookPage` — tờ giấy vở thật (lỗ lò xo, lề đỏ) đặt trên
mặt bàn tối màu. Khoảng hai bên giờ là "mặt bàn", có vai trò rõ ràng, đồng thời
khớp luôn với 4 trang đăng nhập vốn đã trình bày theo cách này từ trước.

**Cố ý không làm:** doodle, sticker, gradient nền, khối trang trí rỗng. Lý do:
đây là app học sinh dùng hằng ngày — hoạ tiết thừa gây mỏi mắt và làm loãng nội
dung. Chỗ đáng "vui mắt" nhất (màn hình kết quả) đã có con dấu điểm đỏ rồi.

**Thêm màu ở đâu:** các ô số liệu, mỗi ô một màu mực theo ý nghĩa — màu ở đây
mang thông tin (phân biệt loại số liệu), không phải để cho đẹp.

## 2026-08-23 — Giao diện trống vì thiếu dữ liệu, không phải thiếu hoạ tiết

**Yêu cầu ban đầu:** giao diện vẫn hơi trống, nghĩ rằng do chưa đủ tính năng.

**Chẩn đoán ngược lại:** hạ tầng đã đủ (12 trang, dashboard GV, thống kê kỹ
năng, lịch sử nộp bài) nhưng không có gì để hiển thị, vì ngân hàng chỉ có 20 câu
seed và `/questions` là trang **chỉ đọc** — muốn thêm câu phải viết SQL tay.
Nghĩa là GV chưa tự vận hành được app. Đây mới là nút thắt thật.

**Quyết định:** ưu tiên tuyệt đối cho công cụ soạn câu hỏi (thêm/sửa/xoá + dán
hàng loạt) trước mọi tính năng khác. Sau khi có nó, GV nhập đề của mình một buổi
tối là toàn bộ dashboard tự đầy lên, không cần viết thêm dòng code nào.

## 2026-08-23 — Câu hỏi mới lưu thẳng "da_duyet", không có bước duyệt

Chỉ có một GV dùng app, tự soạn tự duyệt là vô nghĩa. Câu hỏi tạo qua giao diện
lưu thẳng `status = "da_duyet"` để giao bài được ngay. Cột `status` vẫn giữ vì
`getFilteredQuestions` đang lọc theo nó, và giá trị `"an"` được tận dụng cho
việc ẩn câu hỏi (xem mục dưới).

## 2026-08-23 — Xoá câu hỏi đã giao thì ẩn, không xoá thật

`assignment_questions` và `answers` đều có khoá ngoại trỏ tới `questions`, không
có `on delete cascade`. Xoá thật một câu đã giao sẽ hỏng dữ liệu bài cũ của học
sinh. Nên: câu chưa dùng ở đâu thì xoá thật; câu đã nằm trong bài tập thì đổi
`status = "an"` — biến mất khỏi trang giao bài mới, bài cũ giữ nguyên.

## 2026-08-23 — App chỉ hỗ trợ trắc nghiệm đúng 4 phương án

Form soạn câu và trang dán hàng loạt đều bắt buộc đúng 4 phương án. Đề tiếng Anh
ở Việt Nam gần như luôn 4 phương án, và một luật duy nhất thì dễ nhớ hơn là mỗi
chỗ một kiểu. Câu tách ra không đủ 4 phương án bị tô đỏ và chặn lưu.

**Hệ quả cần biết:** nếu trong database có sẵn câu 3 phương án (từ seed hoặc
nhập tay qua SQL), khi bấm Sửa sẽ phải điền thêm ô thứ 4 mới lưu được.

## 2026-08-23 — Bảng xếp hạng chỉ hiện Top 5 và thứ hạng của chính mình

SPEC ghi "học sinh không xem được bài của nhau". Bảng xếp hạng là vùng xám, nên
giới hạn lại: `getClassLeaderboard` chỉ trả **tên + điểm tích luỹ** của bạn cùng
lớp, và trang chỉ hiện 5 bạn đứng đầu cộng thứ hạng riêng của em. Bạn xếp cuối
không bị nêu tên. Không bao giờ trả điểm từng bài của bạn khác.

**Điểm tích luỹ, chuỗi ngày, huy hiệu đều tính ra từ `attempts`/`answers` sẵn
có** — không thêm bảng, không thêm cột, nên không bao giờ lệch với điểm thật.
