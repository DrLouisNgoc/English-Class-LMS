# SPEC — App Giao & Chấm BTVN Tiếng Anh THCS

> Dán file này vào đầu mỗi phiên làm việc với AI.
> Chỗ có `[?]` là bạn phải tự điền — đừng để AI đoán hộ.

## 1. Bối cảnh

- Người làm: 1 giáo viên, mới học lập trình, code cùng AI
- Quy mô: `[?]` học sinh, `[?]` lớp, khối `[?]`
- Thiết bị học sinh: điện thoại Android tầm trung, mạng 4G, đôi khi chập chờn
- Mục tiêu thật sự **không phải** tiết kiệm giờ chấm bài, mà là: học sinh tự luyện được ở nhà, và giáo viên nhìn thấy lỗ hổng kiến thức ngay trong tuần thay vì đợi đến kỳ thi

## 2. Ba câu chuyện người dùng của MVP

Chỉ ba câu này. Mọi thứ khác để sau.

**GV-1 — Giao bài**
Là giáo viên, tôi chọn 15–25 câu từ ngân hàng câu hỏi (lọc theo khối, kỹ năng, độ khó), giao cho một lớp, đặt hạn nộp.
*Xong khi:* bài xuất hiện trong danh sách của mọi học sinh trong lớp đó.

**HS-1 — Làm bài**
Là học sinh, tôi mở link trên điện thoại, đăng nhập bằng mã lớp + tên đăng nhập + PIN, làm bài, nộp, và thấy ngay điểm cùng phần giải thích của các câu sai.
*Xong khi:* mất mạng giữa chừng rồi vào lại vẫn không mất câu đã làm.

**GV-2 — Xem kết quả**
Là giáo viên, tôi mở một bài đã giao và thấy: ai đã nộp, ai chưa, điểm từng em, và câu nào cả lớp sai nhiều nhất.
*Xong khi:* tôi nhìn bảng đó và biết ngay buổi sau cần chữa gì.

## 3. KHÔNG làm trong phiên bản này

Đọc lại mục này mỗi khi bạn nảy ra ý tưởng mới lúc 11h đêm.

- ❌ Luyện phát âm, chấm nói
- ❌ Chấm bài viết bằng AI
- ❌ Từ vựng lặp lại ngắt quãng (SRS)
- ❌ Tài khoản và báo cáo cho phụ huynh (giai đoạn này cứ chụp màn hình gửi Zalo)
- ❌ Luyện đề bấm giờ theo form thi
- ❌ Ứng dụng cài đặt trên điện thoại
- ❌ Thanh toán, nhiều giáo viên, phân quyền phức tạp
- ❌ Giao diện đẹp — chỉ cần đọc được trên màn hình 5 inch

## 4. Ràng buộc kỹ thuật bắt buộc

1. **Chấm bài chạy ở server.** Không bao giờ gửi đáp án đúng xuống trình duyệt trước khi học sinh nộp.
2. **Lưu từng câu trả lời ngay khi học sinh bấm chọn**, không đợi lúc nộp.
3. **Đăng nhập cực đơn giản:** mã lớp + tên đăng nhập + PIN 6 số. Giáo viên tạo sẵn và reset được. Không email, không xác thực.
4. **Mobile-first.** Thiết kế cho màn hình 360px trước, màn hình lớn tính sau.
5. Học sinh không được xem bài của học sinh khác.

## 4b. Ý tưởng khác biệt hoá — SAU MVP, không code lúc này

Mục tiêu ưu tiên: khác biệt hoá lớp dạy thêm với các lớp truyền thống khác
(không chỉ tối ưu hiệu quả học thuần tuý). Ghi lại đây để không quên và không
rơi vào MVP.

**Dễ, làm sớm sau MVP:**
- Thẻ báo cáo tuần dạng ảnh dọc (kiểu Instagram Story) gửi Zalo phụ huynh —
  ưu tiên cao nhất trong nhóm này, hiệu ứng lan truyền tự nhiên
- Huy hiệu theo kỹ năng thay vì điểm số ("Đã thông thạo hiện tại hoàn thành")
- Câu hỏi 60 giây/ngày khi mở app — tạo thói quen, không phải nghĩa vụ

**Trung bình, cân nhắc thời điểm:**
- Học sinh ghi âm đọc bài, GV gửi voice note chữa lại (không cần AI chấm âm)
- Bảng xếp hạng theo tổ/nhóm nhỏ (không xếp hạng cá nhân — tránh học sinh yếu nản)
- Góc "lỗi sai kinh điển của lớp tuần này" dựa trên dữ liệu thật

**Xa, chỉ nghĩ tới sau khi MVP chạy ổn định nhiều tháng:**
- Học sinh cũ để lại lời khuyên cho học sinh mới theo chủ đề khó
- Buổi thi đấu trực tiếp cuối tháng, chiếu bảng xếp hạng realtime tại lớp

> Ghi chú: phần lớn nhóm "dễ" không cần AI hay hạ tầng phức tạp — chỉ là trình
> bày lại dữ liệu đã có trong schema (mastery, attempts, answers). Ưu tiên nhóm
> này trước khi động vào nhóm "trung bình" hay "xa".

## 5. Tiêu chí "MVP thành công"

Sau 3 tuần chạy thật với lớp:
- Tỉ lệ nộp bài đúng hạn ≥ `[?]`% (ghi lại con số hiện tại của bạn để so sánh)
- Không có sự cố mất bài làm
- Bạn thực sự mở bảng điểm trước mỗi buổi dạy

Nếu ba điều trên không đạt, **đừng xây thêm tính năng** — sửa cái đang có.

## 6. Stack

Next.js (App Router) · Supabase (Postgres + Storage) · Tailwind · deploy Vercel (region Singapore)
