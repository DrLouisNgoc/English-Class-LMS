# TASKS — Bảng nhiệm vụ

> Mỗi nhiệm vụ = 1–3 giờ = 1 commit = 1 phiên làm việc với AI.
> Xong một cái thì tick `[x]` và ghi một dòng nhật ký ở cuối file.
> **Không nhảy cóc.** Thứ tự này được sắp để mỗi bước đều chạy được ngay.

---

## Tuần 1 — Làm quen vòng lặp

- [x] **T1.1** Cài Node.js, tạo project Next.js chạy được ở máy (`npm run dev`)
- [x] **T1.2** Đẩy lên GitHub, deploy Vercel, mở được trên điện thoại
- [x] **T1.3** Sửa một dòng chữ → push → thấy nó đổi trên điện thoại sau 1 phút

> 🎯 Mốc tuần 1: bạn hiểu vòng lặp *sửa code → đẩy lên → thấy kết quả*. Chưa cần hiểu React.

## Tuần 2 — Dữ liệu chạm được màn hình

- [x] **T2.1** Tạo project Supabase, chạy migration tạo bảng theo SCHEMA.md
- [x] **T2.2** Bật Row Level Security cho tất cả bảng
- [x] **T2.3** Nhập tay 20 câu hỏi + bảng skill_tags (dùng file Excel đã chuẩn bị)
- [x] **T2.4** Trang `/questions` hiển thị danh sách câu hỏi lấy từ database

> 🎯 Mốc tuần 2: dữ liệu thật từ database hiện lên web. Đây là lúc thấy "à, nó hoạt động thế này".

## Tuần 3 — Đăng nhập

- [ ] **T3.1** GV đăng nhập bằng email (Supabase Auth)
- [ ] **T3.2** GV tạo lớp, hệ thống sinh mã lớp ngẫu nhiên
- [ ] **T3.3** GV thêm học sinh: nhập tên → hệ thống sinh username + PIN 6 số → hiện ra để in phát cho HS
- [ ] **T3.4** HS đăng nhập bằng mã lớp + username + PIN (PIN phải được băm)
- [ ] **T3.5** GV reset được PIN của một học sinh

> 🎯 Mốc tuần 3: một học sinh thật đăng nhập được trên điện thoại của em.
> ⚠️ Test bằng điện thoại thật, không phải chế độ mobile của trình duyệt.

## Tuần 4–5 — Trái tim của app

- [ ] **T4.1** GV chọn câu hỏi (lọc theo khối/kỹ năng/độ khó) và tạo bài giao cho lớp
- [ ] **T4.2** HS đăng nhập thấy danh sách bài được giao + hạn nộp
- [ ] **T4.3** Màn hình làm bài: hiện 1 câu mỗi màn hình, có nút trước/sau, thanh tiến độ
- [ ] **T4.4** Lưu câu trả lời **ngay khi bấm chọn** (không đợi nộp)
- [ ] **T4.5** Thoát ra vào lại vẫn giữ nguyên bài đang làm dở
- [ ] **T4.6** Nộp bài → **server chấm** → trả về điểm
- [ ] **T4.7** Màn hình kết quả: điểm, câu nào sai, đáp án đúng, giải thích tiếng Việt

> 🎯 Mốc tuần 5: một học sinh làm trọn vẹn một bài và thấy điểm.
> ⚠️ Kiểm tra bắt buộc: mở F12 → tab Network → xác nhận `correct_answer` KHÔNG
> xuất hiện ở bất kỳ đâu trước khi nộp bài.

## Tuần 6 — Giáo viên nhìn thấy gì

- [ ] **T6.1** Bảng điểm một bài: ai nộp, ai chưa, điểm từng em
- [ ] **T6.2** Thống kê câu sai nhiều nhất của bài đó
- [ ] **T6.3** Trang một học sinh: lịch sử các bài đã làm + tỉ lệ đúng theo từng kỹ năng

> 🎯 Mốc tuần 6: bạn mở bảng này trước buổi dạy và biết ngay cần chữa gì.

## Tuần 7 — Chạy thử hẹp

- [ ] **T7.1** Tự làm 3 bài từ đầu đến cuối với tư cách học sinh
- [ ] **T7.2** Thử các trường hợp xấu: bật máy bay giữa chừng, bấm nộp hai lần, để trống, gõ tiếng Việt có dấu
- [ ] **T7.3** **Cho 3–5 học sinh làm tại lớp, có mặt bạn.** Ngồi im quan sát, không nhắc.
- [ ] **T7.4** Ghi lại mọi chỗ các em khựng lại

> 🎯 Đây là tuần giá trị nhất của cả dự án. Đừng bỏ.

## Tuần 8 — Sửa và mở rộng

- [ ] **T8.1** Sửa các lỗi từ T7.4 theo thứ tự nghiêm trọng
- [ ] **T8.2** In phiếu đăng nhập cho cả lớp
- [ ] **T8.3** Giao bài thật đầu tiên cho toàn lớp
- [ ] **T8.4** Ghi lại: tỉ lệ nộp đúng hạn, số lần có sự cố

---

## Sau MVP — chỉ mở khoá khi 3 tiêu chí trong SPEC.md đã đạt

- [ ] Luyện đề theo đúng form thi (bấm giờ, chia phần)
- [ ] Bảng phân tích điểm mạnh / điểm yếu theo kỹ năng
- [ ] Tự động giao bài theo lỗ hổng của từng em
- [ ] Từ vựng lặp lại ngắt quãng (SRS)
- [ ] Báo cáo tuần xuất ảnh gửi Zalo
- [ ] Luyện phát âm (Azure Pronunciation Assessment)

---

## Nhật ký

Ghi mỗi lần làm xong một nhiệm vụ. Dòng này là thứ giúp bạn (và AI) quay lại
đúng mạch sau vài ngày bận.

| Ngày | Nhiệm vụ | Xong gì | Còn vướng gì |
|---|---|---|---|
| 2026-08-16 | T1.1–T1.3 | Khung Next.js chạy được, đẩy GitHub, deploy Vercel, vòng lặp sửa→push→thấy đổi trên điện thoại hoạt động | Ban đầu Vercel tự clone repo riêng do GitHub App chưa cấp quyền vào repo gốc — đã cấp quyền và import lại |
| 2026-08-16 | T2.1–T2.4 | Tạo project Supabase, chạy migration 11 bảng, bật RLS (chưa có policy), seed 20 câu (lấy từ đề thi vào 10 Hà Nội thay vì tự soạn) + 6 skill_tags, trang `/questions` đọc dữ liệu thật | Trang `/questions` lúc đầu rỗng vì RLS chặn anon key — đổi sang service role key ở server; RLS còn để trống policy, sẽ làm khi có đăng nhập thật (T3) |
