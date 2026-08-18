# TASKS — Bảng nhiệm vụ

> Mỗi nhiệm vụ = 1–3 giờ = 1 commit = 1 phiên làm việc với AI.
> Xong một cái thì tick `[x]` và ghi một dòng nhật ký ở cuối file.
> **Không nhảy cóc.** Thứ tự này được sắp để mỗi bước đều chạy được ngay.

---

## Tuần 1 — Làm quen vòng lặp

- [x] **T1.1** Cài Node.js, tạo project Next.js chạy được ở máy (`npm run dev`)
- [x] **T1.2** Đẩy lên GitHub, deploy Vercel, mở được trên điện thoại
- [x] **T1.3** Sửa một dòng chữ → push → thấy nó đổi trên điện thoại sau 1 phút

> 🎯 Mốc tuần 1: bạn hiểu vòng lặp _sửa code → đẩy lên → thấy kết quả_. Chưa cần hiểu React.

## Tuần 2 — Dữ liệu chạm được màn hình

- [x] **T2.1** Tạo project Supabase, chạy migration tạo bảng theo SCHEMA.md
- [x] **T2.2** Bật Row Level Security cho tất cả bảng
- [x] **T2.3** Nhập tay 20 câu hỏi + bảng skill_tags (dùng file Excel đã chuẩn bị)
- [x] **T2.4** Trang `/questions` hiển thị danh sách câu hỏi lấy từ database

> 🎯 Mốc tuần 2: dữ liệu thật từ database hiện lên web. Đây là lúc thấy "à, nó hoạt động thế này".

## Tuần 3 — Đăng nhập

- [x] **T3.1** GV đăng nhập bằng email (Supabase Auth)
- [x] **T3.2** GV tạo lớp, hệ thống sinh mã lớp ngẫu nhiên
- [x] **T3.3** GV thêm học sinh: nhập tên → hệ thống sinh username + PIN 6 số → hiện ra để in phát cho HS
- [x] **T3.4** HS đăng nhập bằng mã lớp + username + PIN (PIN phải được băm)
- [x] **T3.5** GV reset được PIN của một học sinh

> 🎯 Mốc tuần 3: một học sinh thật đăng nhập được trên điện thoại của em.
> ⚠️ Test bằng điện thoại thật, không phải chế độ mobile của trình duyệt.

## Tuần 4–5 — Trái tim của app

- [x] **T4.1** GV chọn câu hỏi (lọc theo khối/kỹ năng/độ khó) và tạo bài giao cho lớp
- [x] **T4.2** HS đăng nhập thấy danh sách bài được giao + hạn nộp
- [x] **T4.3** Màn hình làm bài: hiện 1 câu mỗi màn hình, có nút trước/sau, thanh tiến độ
- [x] **T4.4** Lưu câu trả lời **ngay khi bấm chọn** (không đợi nộp)
- [x] **T4.5** Thoát ra vào lại vẫn giữ nguyên bài đang làm dở
- [x] **T4.6** Nộp bài → **server chấm** → trả về điểm
- [x] **T4.7** Màn hình kết quả: điểm, câu nào sai, đáp án đúng, giải thích tiếng Việt

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

| Ngày       | Nhiệm vụ  | Xong gì                                                                                                                                                                                                                                                                                                                                   | Còn vướng gì                                                                                                                                                                     |
| ---------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-16 | T1.1–T1.3 | Khung Next.js chạy được, đẩy GitHub, deploy Vercel, vòng lặp sửa→push→thấy đổi trên điện thoại hoạt động                                                                                                                                                                                                                                  | Ban đầu Vercel tự clone repo riêng do GitHub App chưa cấp quyền vào repo gốc — đã cấp quyền và import lại                                                                        |
| 2026-08-16 | T2.1–T2.4 | Tạo project Supabase, chạy migration 11 bảng, bật RLS (chưa có policy), seed 20 câu (lấy từ đề thi vào 10 Hà Nội thay vì tự soạn) + 6 skill_tags, trang `/questions` đọc dữ liệu thật                                                                                                                                                     | Trang `/questions` lúc đầu rỗng vì RLS chặn anon key — đổi sang service role key ở server; RLS còn để trống policy, sẽ làm khi có đăng nhập thật (T3)                            |
| 2026-08-17 | T3.1      | GV đăng nhập bằng email qua Supabase Auth. Thêm `@supabase/ssr` để giữ phiên đăng nhập qua cookie, `middleware.ts` chặn `/questions` khi chưa đăng nhập, migration 0003 liên kết `teachers.id` = `auth.users.id`, trang `/teacher-login` + nút đăng xuất                                                                                  | Tài khoản GV đầu tiên tạo thủ công qua Supabase Dashboard, chưa có màn hình đăng ký                                                                                              |
| 2026-08-18 | T3.2      | GV tạo lớp: trang `/classes` có form tạo lớp (tên, khối) + sinh mã lớp 6 ký tự ngẫu nhiên (bỏ 0/O/1/I tránh nhầm), thử lại khi trùng mã. Đổi `middleware.ts` → `proxy.ts` theo quy ước Next.js 16, thêm Prettier                                                                                                                          | Trang `/questions` từng lỗi build trên Vercel do prerender tĩnh cố đọc Supabase lúc build — sửa bằng `force-dynamic`, áp dụng luôn cho `/classes`                                |
| 2026-08-18 | T3.3      | Trang `/classes/[id]`: GV thêm học sinh (chỉ nhập tên) → server tự sinh username (tên + số ngẫu nhiên, duy nhất trong lớp) và PIN 6 số, băm PIN bằng `crypto.scrypt` (Node có sẵn, không thêm thư viện). PIN gốc chỉ hiện 1 lần ngay sau khi tạo để in phát                                                                               | Chưa có màn hình đăng nhập học sinh dùng username/PIN này (T3.4) và chưa có nút reset PIN (T3.5)                                                                                 |
| 2026-08-18 | T3.4      | HS đăng nhập bằng mã lớp + username + PIN. Không dùng Supabase Auth (HS không có email) — tự ký cookie phiên riêng (`crypto.createHmac`), băm/so PIN bằng `timingSafeEqual` tránh lộ thời gian so sánh. Đổi `app/(student)` route group thành `app/student` thư mục thật để `proxy.ts` chặn gọn 1 tiền tố URL, cập nhật `ARCHITECTURE.md` | Cần thêm biến môi trường mới `STUDENT_SESSION_SECRET` (chuỗi bí mật tự đặt) vào `.env.local` và Vercel; trang `/student/home` mới chỉ là màn chào tạm, chưa có bài tập thật (T4) |
| 2026-08-18 | T3.5      | GV reset PIN học sinh: nút "Reset PIN" cạnh mỗi học sinh trong `/classes/[id]`, sinh PIN mới ghi đè `pin_hash`, hiện PIN mới 1 lần y như lúc tạo học sinh                                                                                                                                                                                 | Hoàn tất Tuần 3 — mốc "một học sinh thật đăng nhập được trên điện thoại" đã đạt về mặt kỹ thuật, còn thiếu bước test bằng điện thoại thật theo cảnh báo trong TASKS.md           |
| 2026-08-18 | T4.1      | Trang `/classes/[id]/assign`: GV lọc câu hỏi theo khối/độ khó/kỹ năng (query string), tick chọn câu, nhập tiêu đề + hạn nộp → tạo 1 dòng `assignments` + nhiều dòng `assignment_questions` giữ thứ tự. Thêm `getFilteredQuestions`/`getSkillTags` vào `lib/queries/questions.ts`                                                        | Chưa có màn hình HS thấy bài được giao (T4.2)                                                                                                                                     |
| 2026-08-18 | T4.2      | Trang `/student/home`: thêm `getAssignmentsForStudent` (join qua `enrollments` lấy các lớp HS đang học, rồi lấy `assignments` của các lớp đó), hiện danh sách bài + tên lớp + hạn nộp, sắp theo hạn nộp gần nhất                                                                                                                         | Chưa làm được bài — chỉ mới thấy danh sách (T4.3 trở đi)                                                                                                                          |
| 2026-08-18 | T4.3–T4.7 | Trang `/student/assignments/[id]`: `AssignmentRunner` (client component) hiện 1 câu/màn, thanh tiến độ, nút Trước/Sau, tự lưu đáp án qua server action `saveAnswer` ngay khi chọn/gõ. `getOrCreateAttempt` tái dùng lượt làm dở thay vì tạo mới mỗi lần mở — giữ tiến độ khi thoát ra vào lại. Nộp bài gọi `submitAttempt`: chấm ở server (so `given_answer` với `correct_answer` đọc trực tiếp từ DB, không qua trình duyệt), ghi `is_correct` + `score`, chuyển sang `/student/assignments/[id]/result` hiện điểm + câu sai + đáp án đúng + giải thích. `getAssignmentQuestions` cố ý không lấy cột `correct_answer` | Tuần 4–5 hoàn tất về code — chưa test tay đầy đủ trên trình duyệt/điện thoại thật (F12 kiểm tra `correct_answer` không lộ, test thoát/vào lại giữa chừng)                          |
