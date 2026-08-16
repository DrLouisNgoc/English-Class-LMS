import { createServerClient } from "@/lib/supabase/server";

export type Question = {
  id: string;
  kind: string;
  grade: number;
  difficulty: string;
  content: string;
  correct_answer: string;
  status: string;
};

// Đọc toàn bộ câu hỏi trong ngân hàng — dùng cho trang quản lý câu hỏi của GV.
export async function getQuestions(): Promise<Question[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select("id, kind, grade, difficulty, content, correct_answer, status")
    .order("grade", { ascending: true });

  if (error) {
    throw new Error(`Không đọc được danh sách câu hỏi: ${error.message}`);
  }

  return data;
}
