// Bảng tra chữ hiển thị cho các mã lưu trong database.
//
// Database lưu mã ngắn tiếng Anh ("MCQ", "TB") vì tên cột và giá trị trong
// database dùng tiếng Anh theo quy ước dự án. Nhưng màn hình phải hiện tiếng
// Việt — trước đây danh sách câu hỏi in thẳng "Khối 9 · TB · MCQ", giáo viên
// phải tự dịch trong đầu.
//
// File riêng, KHÔNG để chung với lib/queries/questions.ts: file đó gọi
// createServerClient (code server), mà QuestionsBulkTagList là component chạy
// trong trình duyệt — import từ đó sẽ kéo cả code server xuống trình duyệt.

const KIND_LABELS: Record<string, string> = {
  MCQ: "Trắc nghiệm",
  DIEN: "Điền chữ",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  DE: "Dễ",
  TB: "Trung bình",
  KHO: "Khó",
};

// Trả lại chính mã nếu gặp giá trị lạ — thà hiện "XYZ" còn hơn hiện ô trống
// khiến không ai biết dữ liệu có vấn đề.
export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}

export function difficultyLabel(difficulty: string): string {
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}
