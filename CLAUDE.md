# CLAUDE.md — Quy tắc làm việc trong dự án này

## Về người bạn đang làm việc cùng

Giáo viên tiếng Anh, MỚI HỌC LẬP TRÌNH. Điều này thay đổi mọi thứ:

- Ưu tiên code **dễ hiểu** hơn code ngắn gọn hay "thông minh"
- Không dùng kỹ thuật nâng cao khi cách cơ bản đủ dùng
- Khi giới thiệu một khái niệm mới (hook, server action, RLS...), giải thích bằng 2–3 câu tiếng Việt ngay tại chỗ
- Trả lời bằng tiếng Việt; tên biến, hàm, bảng viết bằng tiếng Anh

## Quy trình bắt buộc cho mỗi nhiệm vụ

1. **Trước khi viết code:** mô tả cách định làm trong tối đa 5 câu + liệt kê file sẽ tạo/sửa. **Dừng lại đợi duyệt.**
2. Chỉ viết code sau khi được duyệt.
3. Chỉ sửa những file đã liệt kê. Muốn sửa thêm file khác thì hỏi trước.
4. Sau khi viết xong: nêu rõ cần chạy lệnh gì và cần bấm thử những gì để kiểm tra.

## Giới hạn cứng

- **Một nhiệm vụ, một mục tiêu.** Không tiện tay dọn dẹp hay tối ưu code cũ.
- **Không thêm thư viện mới** nếu chưa hỏi. Mỗi thư viện là một thứ phải học và bảo trì.
- **Không tạo lớp trừu tượng "cho sau này dùng".** Chỉ viết đúng thứ cần cho hôm nay.
- **Không tự động chỉnh sửa file spec, schema hay database migration** đã có, trừ khi được yêu cầu rõ.
- Nếu một nhiệm vụ cần sửa quá 4 file, dừng lại và đề xuất chia nhỏ.

## Quy ước code

- TypeScript, không dùng `any` trừ khi có lý do và ghi chú lại
- Tên bảng và cột trong database: `snake_case`, tiếng Anh, số nhiều cho tên bảng (`students`, `assignments`)
- Component React: `PascalCase`, một component một file
- Mọi truy vấn database chạm dữ liệu học sinh phải qua server, không gọi trực tiếp từ trình duyệt
- Text hiển thị cho người dùng: tiếng Việt có dấu

## Bảo mật — không thoả hiệp

Dữ liệu ở đây là của trẻ vị thành niên.

- Đáp án đúng **không bao giờ** được gửi xuống trình duyệt trước khi học sinh nộp bài
- Chấm điểm luôn thực hiện ở phía server
- Mọi bảng phải bật Row Level Security; học sinh chỉ đọc được dữ liệu của chính mình
- PIN phải được băm (hash), không lưu dạng văn bản thuần
- Không log ra console bất cứ thông tin cá nhân nào của học sinh

## Khi tôi báo lỗi

- Đọc kỹ thông báo lỗi trước khi đoán nguyên nhân
- Nêu **một** giả thuyết và **một** cách sửa, không đưa 5 phương án cùng lúc
- Nếu cùng một lỗi đã sửa 2 lần không xong: dừng lại, nói thẳng "cách tiếp cận này có vẻ sai", đề xuất hướng khác

## Khi tôi hỏi ý kiến

Nói thật. Nếu ý tưởng của tôi tệ, phức tạp quá mức, hoặc có cách đơn giản hơn — nói ngay. Đừng khen xã giao rồi mới nêu vấn đề.
