import { createServerClient } from "@/lib/supabase/server";

export type Passage = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  // Số câu hỏi đang dùng đoạn văn này — để trang quản lý báo trước cho GV
  // biết xoá được hay không (còn câu hỏi dùng thì không xoá được).
  question_count: number;
};

// Toàn bộ bài đọc của 1 giáo viên, mới nhất trước. Luôn lọc theo teacher_id
// để GV này không đọc được bài đọc của GV khác.
export async function getPassages(teacherId: string): Promise<Passage[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("passages")
    .select("id, title, content, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Không đọc được danh sách bài đọc: ${error.message}`);
  }

  if (data.length === 0) {
    return [];
  }

  // Đếm câu hỏi của từng bài đọc bằng 1 truy vấn cho cả danh sách, thay vì
  // hỏi database một lần cho mỗi bài đọc (n+1 lần gọi, chậm khi nhiều bài).
  const { data: questions, error: countError } = await supabase
    .from("questions")
    .select("passage_id")
    .in(
      "passage_id",
      data.map((row) => row.id),
    );

  if (countError) {
    throw new Error(`Không đếm được câu hỏi của bài đọc: ${countError.message}`);
  }

  const countByPassageId = new Map<string, number>();
  for (const row of questions) {
    const current = countByPassageId.get(row.passage_id) ?? 0;
    countByPassageId.set(row.passage_id, current + 1);
  }

  return data.map((row) => ({
    ...row,
    question_count: countByPassageId.get(row.id) ?? 0,
  }));
}

// Đọc 1 bài đọc cụ thể — trả null nếu không tồn tại hoặc không phải của GV
// này, để trang gọi tự quyết định đá về đâu.
export async function getPassageById(
  passageId: string,
  teacherId: string,
): Promise<Passage | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("passages")
    .select("id, title, content, created_at")
    .eq("id", passageId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không đọc được bài đọc: ${error.message}`);
  }
  if (!data) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("passage_id", passageId);

  if (countError) {
    throw new Error(`Không đếm được câu hỏi của bài đọc: ${countError.message}`);
  }

  return { ...data, question_count: count ?? 0 };
}
