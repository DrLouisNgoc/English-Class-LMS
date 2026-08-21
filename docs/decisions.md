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
