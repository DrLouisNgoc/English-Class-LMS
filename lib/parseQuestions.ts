// Bộ tách đề: nhận một đoạn văn bản GV dán từ file Word hoặc từ web, trả về
// danh sách câu hỏi trắc nghiệm đã tách sẵn.
//
// Đây là một "hàm thuần tuý" (pure function) — nghĩa là nó chỉ nhận vào chuỗi
// và trả ra kết quả, không đọc database, không gọi mạng. Nhờ vậy nó chạy được
// cả trong trình duyệt lẫn trên server, và muốn kiểm tra thì chỉ cần gọi thử
// với một đoạn text mẫu.

export type ParsedQuestion = {
  content: string;
  options: string[];
  // null = trong đề dán vào không ghi đáp án đúng, GV sẽ tự chọn ở màn xem trước.
  correctIndex: number | null;
  explanation: string | null;
};

// "1." / "1)" / "Câu 1:" / "Question 1." — dấu đầu một câu hỏi mới.
const QUESTION_START = /^(?:c[âa]u|question|q)?\s*(\d{1,3})\s*[.):]\s*(.*)$/i;

// "A." / "B)" / "c:" — dấu một phương án. Chỉ nhận A-D.
const OPTION_LINE = /^([A-Da-d])\s*[.):]\s*(.+)$/;

// "Đáp án: B" / "ĐA: B" / "Answer: B" / "Key - B"
const ANSWER_LINE = /^(?:đ[áa]p\s*[áa]n|đ\.?a|answer|key)\s*[:\-.]?\s*([A-Da-d])\b/i;

// "Giải thích: ..." / "Explanation: ..."
const EXPLANATION_LINE = /^(?:gi[ảa]i\s*th[íi]ch|explanation)\s*[:\-.]?\s*(.*)$/i;

// Gom các mẩu đang tích luỹ thành một câu hỏi hoàn chỉnh. Trả về null nếu
// mẩu đang dở không đủ điều kiện (chưa có nội dung, hoặc chưa đủ 2 phương án).
function finishQuestion(draft: {
  contentLines: string[];
  options: string[];
  correctIndex: number | null;
  explanation: string | null;
}): ParsedQuestion | null {
  const content = draft.contentLines.join("\n").trim();

  if (!content || draft.options.length < 2) {
    return null;
  }

  return {
    content,
    options: draft.options,
    // Đề ghi đáp án là chữ D nhưng câu đó chỉ có 3 phương án => bỏ qua, để GV tự chọn.
    correctIndex:
      draft.correctIndex !== null && draft.correctIndex < draft.options.length
        ? draft.correctIndex
        : null,
    explanation: draft.explanation,
  };
}

// Độ dài tối thiểu để coi phần đầu là đoạn văn đọc hiểu. Một dòng hướng dẫn
// kiểu "Chọn đáp án đúng nhất" chỉ khoảng 30–80 ký tự; đoạn đọc hiểu ngắn
// nhất trong đề THCS cũng trên 200. Đặt ngưỡng ở đây để tránh nhận nhầm dòng
// hướng dẫn thành đoạn văn.
const MIN_PASSAGE_LENGTH = 200;

// Tìm đoạn văn đọc hiểu trong đề vừa dán (C2). Chỉ xét phần TRƯỚC câu số 1 —
// đó là chỗ đoạn văn luôn nằm trong đề thi thật. Trả null nếu phần đó quá
// ngắn (chỉ là tiêu đề hoặc dòng hướng dẫn).
//
// Cố ý không cố đoán giỏi hơn thế: máy đoán sai thì rối hơn là không đoán.
// Đoạn tìm được sẽ hiện ra ở màn xem trước để thầy sửa hoặc bỏ đi.
export function detectPassage(text: string): string | null {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const before: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.match(QUESTION_START)) {
      break;
    }
    if (line) {
      before.push(line);
    }
  }

  const passage = before.join("\n").trim();
  return passage.length >= MIN_PASSAGE_LENGTH ? passage : null;
}

export function parseQuestions(text: string): ParsedQuestion[] {
  const results: ParsedQuestion[] = [];

  let draft = {
    contentLines: [] as string[],
    options: [] as string[],
    correctIndex: null as number | null,
    explanation: null as string | null,
  };
  // Đã bắt đầu đọc một câu hỏi hay chưa — dùng để bỏ qua phần đầu đề (tiêu đề,
  // hướng dẫn làm bài...) nằm trước câu số 1.
  let started = false;

  const pushDraft = () => {
    const question = finishQuestion(draft);
    if (question) {
      results.push(question);
    }
    draft = { contentLines: [], options: [], correctIndex: null, explanation: null };
  };

  // \r\n của Word và \n của web đều quy về \n cho dễ xử lý.
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    // 1) Dòng mở đầu một câu hỏi mới => chốt câu đang dở lại rồi bắt đầu câu mới.
    const questionMatch = line.match(QUESTION_START);
    if (questionMatch) {
      if (started) {
        pushDraft();
      }
      started = true;
      const firstLine = questionMatch[2].trim();
      draft.contentLines = firstLine ? [firstLine] : [];
      continue;
    }

    if (!started) {
      continue;
    }

    // 2) Dòng ghi đáp án đúng: đổi chữ cái thành số thứ tự (A=0, B=1, C=2, D=3).
    const answerMatch = line.match(ANSWER_LINE);
    if (answerMatch) {
      draft.correctIndex = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
      continue;
    }

    // 3) Dòng giải thích.
    const explanationMatch = line.match(EXPLANATION_LINE);
    if (explanationMatch) {
      draft.explanation = explanationMatch[1].trim() || null;
      continue;
    }

    // 4) Dòng phương án A/B/C/D.
    const optionMatch = line.match(OPTION_LINE);
    if (optionMatch) {
      draft.options.push(optionMatch[2].trim());
      continue;
    }

    // 5) Còn lại: coi là phần tiếp theo của đề bài — nhưng chỉ khi chưa có
    // phương án nào. Nếu đã sang phần phương án rồi thì dòng lạ là rác, bỏ qua,
    // để tránh nuốt nhầm chữ vào đề bài.
    if (draft.options.length === 0) {
      draft.contentLines.push(line);
    }
  }

  if (started) {
    pushDraft();
  }

  return results;
}
