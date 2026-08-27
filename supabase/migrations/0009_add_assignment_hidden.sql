-- 0009_add_assignment_hidden.sql
-- Ẩn một bài đã giao khỏi màn hình học sinh mà KHÔNG xoá dữ liệu.
--
-- Cuối kỳ danh sách bài dài ra, học sinh mở app thấy hàng chục bài xếp
-- hàng thì rối. Nhưng xoá hẳn thì mất luôn attempts/answers — tức là mất
-- điểm, mất trang "Kỹ năng của em" và mất phần xem lại bài trong lịch sử.
--
-- Nên thay vì xoá, chỉ ghi một dấu thời gian: bài "về hưu" khỏi danh sách
-- việc cần làm, còn lịch sử thì giữ nguyên. NULL = đang hiện bình thường.
-- Bỏ ẩn chỉ cần đặt lại về NULL.

alter table assignments add column hidden_at timestamptz;
