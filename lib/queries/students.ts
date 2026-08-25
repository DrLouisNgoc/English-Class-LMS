import { createServerClient } from "@/lib/supabase/server";

export type StudentRow = {
  id: string;
  full_name: string;
  username: string;
};

// Đọc danh sách học sinh đang học trong một lớp — không bao giờ trả về pin_hash.
export async function getStudentsInClass(classId: string): Promise<StudentRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select("students(id, full_name, username)")
    .eq("class_id", classId)
    .is("left_at", null);

  if (error) {
    throw new Error(`Không đọc được danh sách học sinh: ${error.message}`);
  }

  return data.flatMap((row) => row.students);
}

// Kiểm tra học sinh này có đang học lớp classId không — dùng để chặn GV xem
// trang chi tiết học sinh của lớp không phải mình dạy (qua sửa URL).
export async function isStudentInClass(studentId: string, classId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .is("left_at", null)
    .maybeSingle();

  return Boolean(data);
}

export type StudentAttemptRow = {
  id: string;
  assignment_id: string;
  assignment_title: string;
  submitted_at: string;
  score: number | null;
  // Có lời phê của thầy hay không (B4) — để trang lịch sử của học sinh gắn
  // nhãn nhắc em vào đọc. Chỉ cần biết có/không nên không lấy cả nội dung.
  has_comment: boolean;
};

// Lịch sử các bài đã nộp của 1 học sinh, mới nhất trước — dùng cho trang chi
// tiết học sinh của GV (T6.3).
export async function getStudentAttemptHistory(studentId: string): Promise<StudentAttemptRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("attempts")
    .select("id, assignment_id, submitted_at, score, comment, assignments(title)")
    .eq("student_id", studentId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(`Không đọc được lịch sử làm bài: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    assignment_id: row.assignment_id,
    assignment_title: (row.assignments as unknown as { title: string }).title,
    submitted_at: row.submitted_at as string,
    score: row.score,
    has_comment: Boolean(row.comment),
  }));
}

export type StudentSkillStat = {
  skill_tag_id: string;
  name_vi: string;
  correct: number;
  total: number;
};

// Tỉ lệ đúng theo từng kỹ năng, tính trên toàn bộ câu đã trả lời trong các
// bài ĐÃ NỘP — dùng cho trang chi tiết học sinh của GV (T6.3).
export async function getStudentSkillStats(studentId: string): Promise<StudentSkillStat[]> {
  const supabase = createServerClient();

  const { data: attempts, error: attemptError } = await supabase
    .from("attempts")
    .select("id")
    .eq("student_id", studentId)
    .not("submitted_at", "is", null);

  if (attemptError) {
    throw new Error(`Không đọc được lượt làm bài: ${attemptError.message}`);
  }

  const attemptIds = attempts.map((a) => a.id);
  if (attemptIds.length === 0) {
    return [];
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, is_correct")
    .in("attempt_id", attemptIds);

  if (answersError) {
    throw new Error(`Không đọc được câu trả lời: ${answersError.message}`);
  }

  const questionIds = [...new Set(answers.map((a) => a.question_id))];
  if (questionIds.length === 0) {
    return [];
  }

  const { data: tags, error: tagsError } = await supabase
    .from("question_tags")
    .select("question_id, skill_tags(id, name_vi)")
    .in("question_id", questionIds);

  if (tagsError) {
    throw new Error(`Không đọc được nhãn kỹ năng: ${tagsError.message}`);
  }

  const isCorrectByQuestionId = new Map(answers.map((a) => [a.question_id, a.is_correct]));
  const stats = new Map<string, { name_vi: string; correct: number; total: number }>();

  for (const tag of tags) {
    const skillTag = tag.skill_tags as unknown as { id: string; name_vi: string };
    const isCorrect = isCorrectByQuestionId.get(tag.question_id);
    const entry = stats.get(skillTag.id) ?? { name_vi: skillTag.name_vi, correct: 0, total: 0 };
    entry.total++;
    if (isCorrect) entry.correct++;
    stats.set(skillTag.id, entry);
  }

  return [...stats.entries()].map(([skill_tag_id, entry]) => ({ skill_tag_id, ...entry }));
}
