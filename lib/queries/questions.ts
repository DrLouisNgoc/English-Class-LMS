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

// Số câu hiển thị mỗi trang ở /questions.
export const QUESTIONS_PER_PAGE = 50;

export type QuestionsPage = {
  questions: QuestionWithSkillTag[];
  total: number;
  page: number;
  totalPages: number;
};

// Đọc MỘT TRANG câu hỏi, không phải toàn bộ ngân hàng.
//
// Trước đây hàm này lấy tất cả câu hỏi về một lượt. Chạy được khi ngân hàng
// còn nhỏ, nhưng Supabase mặc định chỉ trả tối đa 1000 dòng mỗi truy vấn —
// vượt mốc đó thì trang lặng lẽ hiện thiếu câu mà KHÔNG báo lỗi gì, thầy sẽ
// tưởng câu hỏi bị mất. Nên phải phân trang trước khi ngân hàng lớn lên.
export async function getQuestions(page = 1): Promise<QuestionsPage> {
  const supabase = createServerClient();

  const currentPage = Math.max(1, Math.floor(page));
  const from = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const to = from + QUESTIONS_PER_PAGE - 1;

  // count: "exact" bảo Supabase đếm tổng số câu trong bảng, tách rời với số
  // câu thật sự trả về — nhờ đó biết có tất cả bao nhiêu trang.
  const {
    data: rows,
    error: rowsError,
    count,
  } = await supabase
    .from("questions")
    .select("id, kind, grade, difficulty, content, correct_answer, status", { count: "exact" })
    .order("grade", { ascending: true })
    // Sắp thêm theo id: hai câu cùng khối mà không có thứ tự cố định thì mỗi
    // lần truy vấn database có thể trả khác thứ tự, làm một câu hiện ở cả hai
    // trang còn câu khác biến mất.
    .order("id", { ascending: true })
    .range(from, to);

  if (rowsError) {
    throw new Error(`Không đọc được danh sách câu hỏi: ${rowsError.message}`);
  }

  // Chỉ lấy kỹ năng của những câu ĐANG hiện trên trang này, không lấy của cả
  // ngân hàng — nếu không thì vẫn dính đúng giới hạn 1000 dòng vừa nói.
  const pageIds = rows.map((row) => row.id);
  const { data: tagRows, error: tagError } = await supabase
    .from("question_tags")
    .select("question_id, skill_tags(id, name_vi)")
    .eq("is_primary", true)
    .in("question_id", pageIds.length > 0 ? pageIds : ["00000000-0000-0000-0000-000000000000"]);

  if (tagError) {
    throw new Error(`Không đọc được kỹ năng của câu hỏi: ${tagError.message}`);
  }

  const skillByQuestionId = new Map<string, { id: string; name_vi: string }>();
  for (const row of tagRows) {
    const skillTag = row.skill_tags as unknown as { id: string; name_vi: string };
    skillByQuestionId.set(row.question_id, skillTag);
  }

  const total = count ?? 0;

  return {
    questions: rows.map((question) => {
      const skillTag = skillByQuestionId.get(question.id);
      return {
        ...question,
        skill_tag_id: skillTag?.id ?? null,
        skill_tag_name: skillTag?.name_vi ?? null,
      };
    }),
    total,
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(total / QUESTIONS_PER_PAGE)),
  };
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

// Số câu mỗi trang ở màn giao bài.
//
// Trước đây trang này KHÔNG phân trang vì sợ chuyển trang làm mất tick đã
// chọn. Giờ QuestionPicker (components/QuestionPicker.tsx) tự lưu tick vào
// localStorage nên chuyển trang không còn mất gì — có thể phân trang bình
// thường như /questions.
export const ASSIGN_QUESTION_LIMIT = 100;

export type FilteredQuestions = {
  questions: Question[];
  // Tổng số câu THOẢ BỘ LỌC, có thể lớn hơn số câu trả về ở trên.
  total: number;
  page: number;
  totalPages: number;
};

// Đọc câu hỏi theo bộ lọc (khối/độ khó/kỹ năng) — dùng cho trang GV chọn câu
// hỏi để giao bài. Chỉ lấy câu đã duyệt (status = "da_duyet").
export async function getFilteredQuestions(
  filter: QuestionFilter,
  page = 1,
): Promise<FilteredQuestions> {
  const supabase = createServerClient();

  const currentPage = Math.max(1, Math.floor(page));
  const from = (currentPage - 1) * ASSIGN_QUESTION_LIMIT;
  const to = from + ASSIGN_QUESTION_LIMIT - 1;

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
      return { questions: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  let query = supabase
    .from("questions")
    .select("id, kind, grade, difficulty, content, correct_answer, status", { count: "exact" })
    .eq("status", "da_duyet")
    .order("grade", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (filter.grade) {
    query = query.eq("grade", filter.grade);
  }
  if (filter.difficulty) {
    query = query.eq("difficulty", filter.difficulty);
  }
  if (questionIds) {
    query = query.in("id", questionIds);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Không đọc được danh sách câu hỏi: ${error.message}`);
  }

  const total = count ?? data.length;

  return {
    questions: data,
    total,
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(total / ASSIGN_QUESTION_LIMIT)),
  };
}
