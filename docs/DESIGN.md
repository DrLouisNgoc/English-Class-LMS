# DESIGN.md — Hệ thống thị giác tối giản

> Không phải giai đoạn thiết kế riêng. Chốt 1 lần ở cuối Ngày 1 (30–45 phút),
> áp vào `components/ui/`, dùng lại mọi nơi. Đổi giữa chừng = phá vỡ nhất quán.

## Nguyên tắc

- **Nhất quán quan trọng hơn đẹp.** Một bộ màu/font áp dụng đúng mọi nơi tốt hơn
  nhiều màn hình "đẹp" nhưng mỗi cái một kiểu.
- **Dồn công sức vào một chỗ:** màn hình kết quả sau khi nộp bài — khoảnh khắc
  cảm xúc nhất, dễ khiến học sinh khoe bạn bè hoặc phụ huynh chú ý nhất.
- **Tránh khuôn mẫu "AI làm design":** nền kem be + serif tương phản cao, hoặc
  nền đen + accent xanh lá/cam chói. Chọn màu gắn với thương hiệu lớp bạn.
- Mobile trước (360–390px), màn hình lớn tính sau.
- Font phải có đủ dấu tiếng Việt — kiểm tra trước khi chọn trên Google Fonts.

## Token (đã chốt)

**Ý tưởng cốt lõi:** số hoá hình ảnh "bút đỏ chấm bài" quen thuộc với mọi học
sinh và phụ huynh Việt Nam, nhưng làm ấm áp và động viên thay vì đáng sợ. Đây
là điểm khác biệt so với ed-tech kiểu phương Tây lạnh lùng — vừa quen vừa mới.

**Màu:**

- primary (vàng nghệ ấm, gợi "sao bé ngoan"): `#E3993A`
- accent (xanh mực giáo viên, nút chính/liên kết): `#1F5C56`
- success (xanh lá dịu, câu đúng): `#4B8F5E`
- error / sửa lỗi (đỏ mực chấm bài — dùng có chủ đích, xem "Điểm nhấn" dưới): `#C2483B`
- background (trắng ấm trung tính, KHÔNG dùng màu kem be — đó là khuôn mẫu AI phổ biến): `#FAFAF8`
- text (đen ánh xanh, không đen tuyệt đối — đỡ gắt mắt trên điện thoại): `#212B2A`

**Font:**

- Tiêu đề: Be Vietnam Pro (600/700) — font người Việt thiết kế, hỗ trợ dấu tốt, có cá tính
- Nội dung / điểm số: Inter — rõ ràng, hỗ trợ dấu tiếng Việt tốt, dễ đọc bảng điểm trên màn hình nhỏ

**Khoảng cách:** dùng thang cố định `4 / 8 / 12 / 16 / 24 / 32px`, không tự chọn
tuỳ hứng.

## Điểm nhấn duy nhất — màn hình kết quả sau khi nộp bài

Câu đúng: hiện dấu ✓ nét vẽ tay màu xanh mực (accent). Câu sai: chú thích kiểu
"bút đỏ" nhẹ nhàng (màu error) kèm giải thích tiếng Việt — đóng khung như một
lời sửa của giáo viên ("cùng sửa nhé"), không phải dấu ✗ đỏ chói gây sợ hãi.
Đây là chỗ duy nhất được đầu tư chăm chút kỹ; mọi màn hình khác giữ tối giản,
kỷ luật, dùng đúng token trên.

## Thứ tự làm

1. Ngày 1 — áp token trên vào Tailwind config + `components/ui/` (khoảng 30–45 phút, không hơn)
2. Ngày 6–8 — màn hình làm bài & kết quả dùng đúng token; chăm chút thêm cho
   điểm nhấn ✓/bút đỏ ở màn hình kết quả
3. **Sau khi test với học sinh thật** — mới thêm animation, huy hiệu, hiệu ứng.
   Không thêm trước, vì cần biết luồng cơ bản chạy mượt trước khi tô điểm.

## Không làm ở giai đoạn này

Landing page marketing, illustration riêng, logo, Figma mockup đầy đủ trước khi
code. Xem `SPEC.md` mục 4b cho danh sách ý tưởng khác biệt hoá — phần lớn thuộc
Sau MVP.
