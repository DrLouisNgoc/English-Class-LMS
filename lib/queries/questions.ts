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

export type QuestionWithSkillTag = Question & {
  skill_tag_id: string | null;
  skill_tag_name: string | null;
};

// Đọc toàn bộ câu hỏi trong ngân hàng, kèm tên kỹ năng đang gắn (nếu có) — dùng
// cho trang quản lý câu hỏi của GV, để thấy ngay câu nào còn "Chưa gắn".
export async function getQuestions(): Promise<QuestionWithSkillTag[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select("id, kind, grade, difficulty, content, correct_answer, status")
    .order("grade", { ascending: true });

  if (error) {
    throw new Error(`Không đọc được danh sách câu hỏi: ${error.message}`);
  }

  const { data: tagRows, error: tagError } = await supabase
    .from("question_tags")
    .select("question_id, skill_tags(id, name_vi)")
    .eq("is_primary", true);

  if (tagError) {
    throw new Error(`Không đọc được kỹ năng của câu hỏi: ${tagError.message}`);
  }

  const skillByQuestionId = new Map<string, { id: string; name_vi: string }>();
  for (const row of tagRows) {
    const skillTag = row.skill_tags as unknown as { id: string; name_vi: string };
    skillByQuestionId.set(row.question_id, skillTag);
  }

  return data.map((question) => {
    const skillTag = skillByQuestionId.get(question.id);
    return {
      ...question,
      skill_tag_id: skillTag?.id ?? null,
      skill_tag_name: skillTag?.name_vi ?? null,
    };
  });
}

export type QuestionDetail = {
  id: string;
  kind: string;
  grade: number;
  difficulty: string;
  content: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  source: string | null;
  status: string;
  skill_tag_id: string | null;
  // Bài đọc hiểu câu này dùng chung, null nếu là câu độc lập (C2).
  passage_id: string | null;
};

// Đọc đầy đủ một câu hỏi để đổ vào form sửa. Khác getQuestions ở chỗ lấy thêm
// options, explanation, source và kỹ năng chính đang gắn.
export async function getQuestionById(id: string): Promise<QuestionDetail | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status, passage_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Không đọc được câu hỏi: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Cột options là kiểu jsonb nên TypeScript không biết trước bên trong là gì.
  // Kiểm tra lại lúc chạy rồi mới ép về mảng chuỗi cho chắc.
  const options = Array.isArray(data.options) ? data.options.map((option) => String(option)) : [];

  const { data: tagRow, error: tagError } = await supabase
    .from("question_tags")
    .select("skill_tag_id")
    .eq("question_id", id)
    .eq("is_primary", true)
    .maybeSingle();

  if (tagError) {
    throw new Error(`Không đọc được kỹ năng của câu hỏi: ${tagError.message}`);
  }

  return { ...data, options, skill_tag_id: tagRow?.skill_tag_id ?? null };
}

export type SkillTag = {
  id: string;
  code: string;
  name_vi: string;
  group_name: string;
};

// Đọc toàn bộ skill_tags — dùng cho dropdown lọc theo kỹ năng lúc GV giao bài.
export async function getSkillTags(): Promise<SkillTag[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("skill_tags")
    .select("id, code, name_vi, group_name")
    .order("group_name", { ascending: true });

  if (error) {
    throw new Error(`Không đọc được danh sách kỹ năng: ${error.message}`);
  }

  return data;
}

export type QuestionFilter = {
  grade?: number;
  difficulty?: string;
  skillTagId?: string;
};

// Đọc câu hỏi theo bộ lọc (khối/độ khó/kỹ năng) — dùng cho trang GV chọn câu
// hỏi để giao bài. Chỉ lấy câu đã duyệt (status = "da_duyet").
export async function getFilteredQuestions(filter: QuestionFilter): Promise<Question[]> {
  const supabase = createServerClient();

  // Lọc theo kỹ năng phải đi qua bảng nối question_tags trước, lấy ra danh
  // sách question_id rồi mới lọc bảng questions — vì 1 câu có thể mang nhiều tag.
  let questionIds: string[] | null = null;
  if (filter.skillTagId) {
    const { data: tagRows, error: tagError } = await supabase
      .from("question_tags")
      .select("question_id")
      .eq("skill_tag_id", filter.skillTagId);

    if (tagError) {
      throw new Error(`Không lọc được theo kỹ năng: ${tagError.message}`);
    }

    questionIds = tagRows.map((row) => row.question_id);
    if (questionIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("questions")
    .select("id, kind, grade, difficulty, content, correct_answer, status")
    .eq("status", "da_duyet")
    .order("grade", { ascending: true });

  if (filter.grade) {
    query = query.eq("grade", filter.grade);
  }
  if (filter.difficulty) {
    query = query.eq("difficulty", filter.difficulty);
  }
  if (questionIds) {
    query = query.in("id", questionIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Không đọc được danh sách câu hỏi: ${error.message}`);
  }

  return data;
}
