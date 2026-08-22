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

## Token (đã chốt — bản "Vở tiếng Anh", cập nhật 22/8)

> Bản token màu vàng/xanh mực bên dưới (bản đầu) đã bị thay bằng bản này khi
> thực sự bắt tay thiết kế UI (không làm trước khi có trang thật, xem trò
> chuyện lúc thiết kế trang làm bài). Giữ lại token này làm chuẩn — trang mới
> tạo phải dùng đúng các biến trong `app/globals.css`, không tự bịa màu mới.

**Ý tưởng cốt lõi:** chất liệu vở học sinh tiếng Anh thật — giấy kẻ ngang, lề
đỏ, mực tím quen thuộc thời đi học, con dấu/bút đỏ chấm bài của giáo viên.
Khác ed-tech phương Tây lạnh lùng — vừa quen thuộc với học sinh Việt Nam, vừa
có điểm nhấn riêng (con dấu điểm số, khoanh tròn đáp án như phiếu bài tập thật).

**Biến CSS** (định nghĩa ở `app/globals.css`, dùng qua class Tailwind
`bg-*`/`text-*`/`border-*` tương ứng):

| Biến CSS | Class Tailwind | Mã màu | Dùng cho |
|---|---|---|---|
| `--paper` | `bg-paper` | `#efe7d2` | Nền `body` toàn site (đã có kẻ dòng ngang) |
| `--surface` | `bg-surface` | `#fffcf5` | Nền các "thẻ"/box (form, card, list item) — **bắt buộc** có, không để trong suốt vì sẽ bị đè bởi kẻ dòng nền |
| `--surface-border` | `border-surface-border` | `#e4dcc8` | Viền thẻ |
| `--ink` | `text-ink` / `bg-ink` | `#4c3f7a` | Tiêu đề, link, nút chính (mực tím) |
| `--ink-dark` | `hover:bg-ink-dark` | `#382e5c` | Hover của nút/link màu ink |
| `--text` | `text-text` | `#332b47` | Chữ nội dung thường (dùng `/60` cho chữ phụ, VD `text-text/60`) |
| `--red-pen` | `text-red-pen` / `border-red-pen` | `#c0392b` | Lỗi form, câu sai, điểm nhấn "chấm bài" |
| `--gold` | `bg-gold` | `#e0a526` | Nút CTA nổi bật (VD "Nộp bài"), cảnh báo nhẹ |
| `--correct` | `text-correct` | `#4c9a5b` | Câu đúng, thông báo thành công |
| `--rule-line` | (dùng trong `body`) | `#d9cba5` | Đường kẻ ngang nền giấy |

**Font** (khai báo ở `app/layout.tsx` qua `next/font/google`):

- Tiêu đề: **Baloo 2** (600/700), class `font-display` — font tròn, hơi giống nét chữ viết tay học sinh, dùng tiết chế (chỉ tiêu đề)
- Nội dung: **Be Vietnam Pro** (400/500/600) — mặc định của `body`, không cần thêm class

**Quy tắc bắt buộc khi tạo trang mới:**

1. Mọi box/card/form phải có `bg-surface border border-surface-border` (hoặc
   `bg-white` cho card nổi hẳn như trang làm bài) — không để viền không có
   nền, sẽ bị kẻ dòng ngang của `body` đè lên, rất khó nhìn (lỗi đã gặp 2 lần).
2. Không dùng `text-zinc-*`, `text-gray-*`, `bg-black`, `border-gray-300` mặc
   định của Tailwind nữa — dùng đúng token trong bảng trên.
3. Nút chính: `rounded-full bg-ink hover:bg-ink-dark text-white`. Input:
   `rounded-lg border border-ink/15 bg-white focus:border-ink`.

## Điểm nhấn duy nhất — màn hình kết quả sau khi nộp bài

Điểm số hiện như con dấu tròn màu đỏ (`border-red-pen`, xoay nhẹ `-rotate-3`)
giống con dấu chấm bài thật. Câu đúng: dấu ✓ màu `--correct`. Câu sai: dấu ✗
màu `--red-pen`, kèm đáp án đúng + giải thích tiếng Việt. Đây là chỗ đầu tư
chăm chút kỹ nhất; mọi màn hình khác giữ tối giản, dùng đúng token trên.

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
