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
