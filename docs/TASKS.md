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

- [x] **T6.1** Bảng điểm một bài: ai nộp, ai chưa, điểm từng em
- [x] **T6.2** Thống kê câu sai nhiều nhất của bài đó
- [x] **T6.3** Trang một học sinh: lịch sử các bài đã làm + tỉ lệ đúng theo từng kỹ năng

> 🎯 Mốc tuần 6: bạn mở bảng này trước buổi dạy và biết ngay cần chữa gì.

## Tuần 7 — Chạy thử hẹp

- [x] **T7.1** Tự làm 3 bài từ đầu đến cuối với tư cách học sinh
- [x] **T7.2** Thử các trường hợp xấu: bật máy bay giữa chừng, bấm nộp hai lần, để trống, gõ tiếng Việt có dấu
- [ ] **T7.3** **Cho 3–5 học sinh làm tại lớp, có mặt bạn.** Ngồi im quan sát, không nhắc.
- [ ] **T7.4** Ghi lại mọi chỗ các em khựng lại

> 🎯 Đây là tuần giá trị nhất của cả dự án. Đừng bỏ.
> Kết quả T7.1–T7.2 (2026-08-20/21): không phát hiện lỗi logic/code — chỗ
> khựng duy nhất là độ trễ mạng (đã giảm bằng đổi region Tokyo, phần còn lại
> là đường truyền, không sửa thêm được bằng code). Phát hiện 1 bug thật qua
> quá trình test: bấm nút nhiều lần lúc trang chậm tạo dữ liệu trùng → đã sửa
> (xem T8.1 và `decisions.md` 2026-08-20). T7.3/T7.4 CHƯA làm — cần lớp thật.

## Tuần 8 — Sửa và mở rộng

- [x] **T8.1** Sửa các lỗi từ T7.4 theo thứ tự nghiêm trọng — chưa có T7.4 nên
      chưa có danh sách lỗi thật, nhưng đã chủ động sửa bug double-submit phát
      hiện được trong lúc test T7.1/T7.2 (mọi nút submit tự khoá khi đang gửi)
- [ ] **T8.2** In phiếu đăng nhập cho cả lớp — GV tự xử lý, chưa xác nhận xong
- [ ] **T8.3** Giao bài thật đầu tiên cho toàn lớp — chưa làm
- [ ] **T8.4** Ghi lại: tỉ lệ nộp đúng hạn, số lần có sự cố — **công cụ đã có**
      (dashboard tự tính ở `/classes` và `/classes/[id]`), nhưng chưa có dữ
      liệu thật vì chưa giao bài thật (T8.3)

---

## Sau MVP — chỉ mở khoá khi 3 tiêu chí trong SPEC.md đã đạt

- [ ] Luyện đề theo đúng form thi (bấm giờ, chia phần)
- [x] Bảng phân tích điểm mạnh / điểm yếu theo kỹ năng — trang `/student/skills` (HS tự xem) và khối "Kỹ năng cả lớp hay sai" ở trang lớp của GV
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
| 2026-08-18 | T6.1–T6.3 | Trang `/classes/[id]/assignments/[assignmentId]`: bảng điểm (ai nộp/chưa, điểm từng em qua `getAssignmentReport`) + thống kê câu sai nhiều nhất (`getQuestionMissStats`, chỉ tính trên lượt đã nộp). Trang `/classes/[id]/students/[studentId]`: lịch sử bài đã nộp (`getStudentAttemptHistory`) + tỉ lệ đúng theo từng kỹ năng (`getStudentSkillStats`, join qua `question_tags`/`skill_tags`). Thêm link từ trang lớp sang cả 2 trang mới                                              | Chưa test tay — cần kiểm tra số liệu đúng khi có nhiều HS/nhiều bài; `getStudentAttemptHistory` gộp bài của mọi lớp HS đó học, chưa lọc theo lớp đang xem                          |
| 2026-08-19 | Vận hành  | Test trên Vercel production lần đầu: đăng nhập → làm bài → nộp → chấm điểm chạy được thật. Sửa lỗi biến môi trường `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` bị tích "Sensitive" (che khỏi build) → bỏ tích, redeploy hết lỗi. Thêm `vercel.json` chuyển region sang Tokyo (hnd1) — giảm độ trễ đáng kể so với region mặc định (Washington) vì Supabase ở Nhật, GV ở VN | Phát sinh bug: lúc trang còn chậm, bấm "Thêm học sinh" nhiều lần liên tiếp tạo ra 15 học sinh trùng ("Nguyen Minh Ngoc") trong lớp test — chưa dọn lúc đó |
| 2026-08-20 | T7.1–T7.2, T8.1 | Dọn 14 học sinh trùng (viết script tạm chỉ đọc trước để duyệt, xoá xong kiểm tra không ai đã có `attempts` mới xoá). Sửa tận gốc bug double-submit: thêm `components/SubmitButton.tsx` dùng `useFormStatus`, áp cho mọi form ghi dữ liệu (Thêm học sinh, Tạo bài giao, Tạo lớp, Reset PIN, Đăng nhập học sinh) — nút tự khoá + đổi chữ "Đang…" lúc server đang xử lý. Chạy T7.1 (3 luồng trọn vẹn GV→HS→nộp→điểm) và T7.2 (ca xấu: mất mạng giữa chừng, bấm nộp 2 lần, bỏ trống câu, gõ dấu tiếng Việt) trên production | Không phát hiện lỗi code, chỉ còn độ trễ mạng (không sửa thêm được nhiều). T7.3/T7.4 (học sinh thật tại lớp) chưa làm |
| 2026-08-21 | Đổi cơ chế đăng nhập HS + Dashboard GV | Đổi từ sinh username/PIN ngẫu nhiên sang username+mật khẩu tự chọn: GV tự gõ khi thêm HS (`lib/actions/students.ts`), thêm trang tự đăng ký `/student-register` (`registerStudent` trong `lib/actions/studentAuth.ts`), đổi ô "PIN 6 số" ở `/student-login` thành "Mật khẩu" thường. GV tạo lớp giờ tự gõ được mã lớp (để trống vẫn tự sinh như cũ, `lib/actions/classes.ts`). Thêm nút "Xoá khỏi lớp" (`components/RemoveStudentButton.tsx`, soft-delete qua `left_at`). Thêm dashboard số liệu: `lib/queries/dashboard.ts` — tổng quan toàn bộ GV (`getTeacherDashboardStats`, hiện ở `/classes`) và riêng từng lớp (`getClassDashboardStats`, `getClassSkillMissStats` top 5 kỹ năng hay sai, `getStudentsNeedingAttention` — nộp <70% bài hoặc điểm thấp hơn lớp ≥1.5, hiện ở `/classes/[id]`). Xem chi tiết lý do đổi trong `decisions.md` | T8.2 (in phiếu) GV tự làm, T8.3 (giao bài thật) chưa làm — dashboard T8.4 mới có công cụ, chưa có dữ liệu thật để xem |
| 2026-08-22 | Thiết kế lại giao diện | **Bộ nhận diện "Vở tiếng Anh"** (`docs/DESIGN.md` đã cập nhật token thật đang dùng): nền giấy kẻ ngang, mực tím `#4c3f7a`, bút đỏ chấm bài `#c0392b`, font Baloo 2 (tiêu đề) + Be Vietnam Pro (nội dung, đủ dấu tiếng Việt). Áp cho toàn bộ 14 trang. Điểm nhấn: con dấu tròn đỏ hiện điểm ở trang kết quả, lề đỏ dọc tô dần theo tiến độ ở trang làm bài. **Cài shadcn/ui** (`components/ui/`: button, input, card, badge, separator) — ánh xạ token màu của shadcn (`--primary`, `--destructive`, `--border`…) thẳng vào bảng màu trên thay vì màu xám mặc định. **Sửa 4 lỗi giao diện thật** phát hiện qua ảnh chụp trình duyệt: (1) đường kẻ nền đè lên viền box của các trang chưa thiết kế lại → mọi box bắt buộc có `bg-surface`; (2) đường kẻ cắt ngang chữ tiêu đề trông như bị gạch chân → làm nhạt màu kẻ còn 55%; (3) form đăng nhập trôi lẻ loi giữa màn hình rộng → bọc thành "trang vở đặt trên mặt bàn tối màu"; (4) trang học sinh cố định `max-w-sm` nên desktop chữ nhỏ, trống trải → nới khung + tăng cỡ chữ/khoảng đệm theo breakpoint `md`. Đổi các nút hành động (Đăng xuất, Reset PIN, Xoá khỏi lớp, chuyển trang) từ link gạch chân sang nút bo viền thật. GV đăng nhập giờ về `/classes` (trang chủ có dashboard) thay vì lạc vào `/questions` không lối ra | Đã kiểm chứng bằng ảnh chụp Playwright ở 2 kích thước (375px/1440px) cho toàn bộ luồng GV lẫn HS, dùng tài khoản test tạm và **đã xoá sạch sau khi xong** |
| 2026-08-22 | Tính năng HS | **Trang `/student/history`** — HS tự xem lịch sử bài đã nộp (điểm, thời gian nộp). **Trang `/student/skills`** ("Kỹ năng của em") — tỉ lệ đúng theo từng kỹ năng, sắp từ làm tốt nhất xuống cần luyện thêm, thanh màu xanh/đỏ theo ngưỡng 70%, kèm khối "Nên luyện thêm" liệt kê các kỹ năng dưới ngưỡng. Cả hai dùng lại query có sẵn (`getStudentAttemptHistory`, `getStudentSkillStats` — vốn chỉ phục vụ trang GV), không viết truy vấn mới. **Dashboard HS** ở trang chủ: số bài đã làm/tổng, điểm trung bình, tỉ lệ nộp đúng hạn (`getStudentDashboardStats`) | Đây là bước đầu của mục "Bảng phân tích điểm mạnh/điểm yếu theo kỹ năng" trong danh sách Sau MVP. Các mục còn lại (luyện đề bấm giờ, tự động giao bài theo lỗ hổng, SRS từ vựng, báo cáo Zalo, luyện phát âm) chưa làm — nên chờ dữ liệu thật từ T7.3/T8.3 trước khi quyết định làm mục nào |
| 2026-08-23 | Trang trí giao diện | **Component `NotebookPage`** dùng chung cho toàn bộ 10 trang bên trong app (cả GV lẫn HS): tờ giấy vở đặt trên mặt bàn tối màu `--ink-dark`, lỗ lò xo đục dọc mép trái (class `.punch-holes` vẽ bằng radial-gradient nên tự lặp theo chiều cao trang), lề đỏ dọc. Tờ giấy có `min-height` gần bằng màn hình để không hở mảng nền tối phía dưới khi nội dung còn ít. Ba ô số liệu ở trang chủ HS đổi sang ba màu mực khác nhau (tím = đã làm, xanh = điểm TB, vàng = nộp đúng hạn) thay vì cùng màu kem. `AssignmentRunner` giữ khung giấy riêng (đã có lề tô dần theo tiến độ — điểm nhấn), chỉ dùng chung nền tối | Kiểm chứng bằng ảnh chụp Playwright ở 375px/1440px cho cả 2 khu vực; dữ liệu test tạm đã xoá sạch sau khi xong. Cố ý KHÔNG thêm doodle/sticker/gradient trang trí — xem lý do ở `decisions.md` |
