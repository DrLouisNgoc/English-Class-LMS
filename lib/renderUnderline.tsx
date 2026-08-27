// Gạch chân một phần của đề bài hoặc phương án.
//
// Đề thi vào 10 phần ngữ âm luôn gạch chân phần âm được hỏi ("br<u>ea</u>d"),
// dạng tìm lỗi sai cũng gạch chân bốn phần A/B/C/D ngay trong câu. Nhưng
// database chỉ lưu được văn bản thuần, không lưu được định dạng chữ.
//
// Cách giải quyết: thầy gõ "br[ea]d" — phần trong ngoặc vuông là phần cần
// gạch chân. Hàm này cắt chuỗi tại các cặp ngoặc rồi bọc phần bên trong bằng
// thẻ <u>. Học sinh thấy chữ gạch chân, không bao giờ thấy dấu ngoặc.
//
// VÌ SAO KHÔNG LƯU THẲNG HTML vào database: nếu lưu "br<u>ea</u>d" thì lúc
// hiển thị phải dùng `dangerouslySetInnerHTML` — đúng như tên gọi, React coi
// đó là nguy hiểm vì bất cứ thẻ HTML nào lọt vào cũng chạy được, kể cả mã
// độc. Cách cắt chuỗi rồi ghép thẻ <u> bằng React thì React tự bảo vệ.
//
// File này để đuôi .tsx (không phải .ts) vì nó trả về thẻ React chứ không
// phải chuỗi. Nó không đọc database nên dùng được ở cả trang server lẫn
// component chạy trong trình duyệt.

import type { ReactNode } from "react";

// Tìm mọi cặp [..] có ít nhất một ký tự bên trong.
const UNDERLINE_PATTERN = /\[([^\]]+)\]/g;

export function renderUnderline(text: string): ReactNode {
  // Tuyệt đại đa số câu hỏi không có ngoặc — trả lại đúng chuỗi ban đầu,
  // không đụng gì tới nó.
  if (!text.includes("[")) {
    return text;
  }

  // Ghép dần các mẩu: đoạn chữ thường và đoạn gạch chân xen kẽ nhau.
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(UNDERLINE_PATTERN)) {
    const start = match.index ?? 0;

    // Đoạn chữ thường nằm giữa cặp ngoặc trước và cặp ngoặc này.
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    // React cần `key` cho mỗi thẻ nằm trong mảng; vị trí trong chuỗi là
    // giá trị duy nhất sẵn có nên dùng luôn.
    parts.push(
      <u key={start} className="underline decoration-2 underline-offset-4">
        {match[1]}
      </u>,
    );

    lastIndex = start + match[0].length;
  }

  // Phần đuôi sau cặp ngoặc cuối cùng. Cũng là chỗ xử lý ngoặc lệch: gõ
  // thiếu ngoặc đóng thì không cặp nào khớp, cả câu rơi vào đây và được in
  // nguyên văn. Cố ý không đoán ý thầy — máy đoán sai còn rối hơn không đoán.
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Bọc cả cụm vào MỘT thẻ <span>. Bắt buộc, không phải cho đẹp:
  // ô chọn đáp án là một khung `flex` có `gap-3` — nghĩa là mọi phần tử con
  // bên trong đều bị đẩy cách nhau 12px. Trả về ba mẩu rời (br / ea / d) thì
  // chúng thành ba phần tử con và chữ "bread" bị xé thành "br ea d".
  // Gói lại thành một thẻ thì cả cụm chỉ còn là một phần tử con, chữ liền lại.
  return <span>{parts}</span>;
}
