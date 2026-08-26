import { createServerClient } from "@/lib/supabase/server";

// Tìm lượt làm bài đang dở (submitted_at null) của học sinh cho 1 bài giao,
// nếu chưa có thì tạo mới — nhờ vậy HS thoát ra vào lại vẫn là đúng lượt cũ,
// không bị tạo lượt mới mỗi lần mở trang (T4.5).
export async function getOrCreateAttempt(
  assignmentId: string,
  studentId: string,
): Promise<{ id: string; submitted_at: string | null; score: number | null }> {
  const supabase = createServerClient();

  const { data: existing, error: findError } = await supabase
    .from("attempts")
    .select("id, submitted_at, score")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) {
    throw new Error(`Không đọc được lượt làm bài: ${findError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from("attempts")
    .insert({ assignment_id: assignmentId, student_id: studentId })
    .select("id, submitted_at, score")
    .single();

  if (createError) {
    throw new Error(`Không tạo được lượt làm bài: ${createError.message}`);
  }

  return created;
}

// Đọc các câu đã trả lời trong 1 lượt làm bài — dùng để hiện lại lựa chọn cũ
// khi HS thoát ra vào lại giữa chừng.
export async function getAttemptAnswers(attemptId: string): Promise<Record<string, string>> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("answers")
    .select("question_id, given_answer")
    .eq("attempt_id", attemptId);

  if (error) {
    throw new Error(`Không đọc được câu trả lời đã lưu: ${error.message}`);
  }

  const result: Record<string, string> = {};
  for (const row of data) {
    result[row.question_id] = row.given_answer;
  }
  return result;
}

export type AttemptResultQuestion = {
  question_id: string;
  content: string;
  correct_answer: string;
  explanation: string | null;
  given_answer: string | null;
  is_correct: boolean | null;
  // Đoạn văn của bài đọc hiểu, null nếu là câu độc lập (C2). Không có nó thì
  // lúc xem lại bài, câu đọc hiểu hiện trơ trọi — không hiểu vì sao mình sai.
  passage_content: string | null;
};

export type AttemptResult = {
  score: number | null;
  comment: string | null;
  questions: AttemptResultQuestion[];
};

// Đọc kết quả 1 lượt làm bài ĐÃ NỘP — chỉ lúc này mới được phép trả về
// correct_answer, vì học sinh đã nộp bài rồi (T4.7). Kiểm tra đúng chủ nhân
// lượt làm bài, tránh HS xem đáp án bài của bạn qua sửa URL.
export async function getAttemptResult(
  attemptId: string,
  studentId: string,
): Promise<AttemptResult | null> {
  const supabase = createServerClient();

  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("student_id, submitted_at, score, comment, assignment_id")
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptError) {
    throw new Error(`Không đọc được lượt làm bài: ${attemptError.message}`);
  }
  if (!attempt || attempt.student_id !== studentId || !attempt.submitted_at) {
    return null;
  }

  const { data: assignmentQuestions, error: aqError } = await supabase
    .from("assignment_questions")
    .select(
      "position, question_id, questions(content, correct_answer, explanation, passages(content))",
    )
    .eq("assignment_id", attempt.assignment_id)
    .order("position", { ascending: true });

  if (aqError) {
    throw new Error(`Không đọc được câu hỏi của bài giao: ${aqError.message}`);
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, given_answer, is_correct")
    .eq("attempt_id", attemptId);

  if (answersError) {
    throw new Error(`Không đọc được câu trả lời: ${answersError.message}`);
  }

  const answerByQuestionId = new Map(answers.map((a) => [a.question_id, a]));

  const questions = assignmentQuestions.map((row) => {
    const q = row.questions as unknown as {
      content: string;
      correct_answer: string;
      explanation: string | null;
      passages: { content: string } | null;
    };
    const answer = answerByQuestionId.get(row.question_id);
    return {
      question_id: row.question_id,
      content: q.content,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      given_answer: answer?.given_answer ?? null,
      is_correct: answer?.is_correct ?? false,
      passage_content: q.passages?.content ?? null,
    };
  });

  return { score: attempt.score, comment: attempt.comment, questions };
}

export type TeacherAttemptDetail = {
  student_id: string;
  student_name: string;
  assignment_title: string;
  submitted_at: string;
  score: number | null;
  comment: string | null;
  questions: AttemptResultQuestion[];
};

// Đọc chi tiết 1 bài đã nộp CHO GIÁO VIÊN xem (tính năng B4) — trước đây GV
// chỉ thấy điểm số, không biết học sinh chọn gì ở từng câu.
//
// Khác với getAttemptResult ở chỗ kiểm quyền: hàm kia hỏi "bài này có phải
// của em học sinh đang đăng nhập không", hàm này hỏi "lớp chứa bài giao này
// có phải lớp của thầy đang đăng nhập không" — đi ngược chuỗi
// attempts.assignment_id -> assignments.class_id -> classes.teacher_id.
// Cùng một dữ liệu nhưng hai lối vào nên phải có hai luật quyền riêng.
// Trả về null nếu không đúng quyền hoặc bài chưa nộp — trang gọi sẽ notFound().
export async function getAttemptDetailForTeacher(
  attemptId: string,
  classId: string,
  teacherId: string,
): Promise<TeacherAttemptDetail | null> {
  const supabase = createServerClient();

  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("student_id, submitted_at, score, comment, assignment_id, students(full_name)")
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptError) {
    throw new Error(`Không đọc được lượt làm bài: ${attemptError.message}`);
  }
  if (!attempt || !attempt.submitted_at) {
    return null;
  }

  // Bài giao này có thuộc đúng lớp trên URL, và lớp đó có đúng là của thầy không.
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("title, class_id, classes(teacher_id)")
    .eq("id", attempt.assignment_id)
    .eq("class_id", classId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Không đọc được bài giao: ${assignmentError.message}`);
  }
  if (!assignment) {
    return null;
  }

  const owner = assignment.classes as unknown as { teacher_id: string } | null;
  if (owner?.teacher_id !== teacherId) {
    return null;
  }

  const { data: assignmentQuestions, error: aqError } = await supabase
    .from("assignment_questions")
    .select(
      "position, question_id, questions(content, correct_answer, explanation, passages(content))",
    )
    .eq("assignment_id", attempt.assignment_id)
    .order("position", { ascending: true });

  if (aqError) {
    throw new Error(`Không đọc được câu hỏi của bài giao: ${aqError.message}`);
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, given_answer, is_correct")
    .eq("attempt_id", attemptId);

  if (answersError) {
    throw new Error(`Không đọc được câu trả lời: ${answersError.message}`);
  }

  const answerByQuestionId = new Map(answers.map((a) => [a.question_id, a]));

  const questions = assignmentQuestions.map((row) => {
    const q = row.questions as unknown as {
      content: string;
      correct_answer: string;
      explanation: string | null;
      passages: { content: string } | null;
    };
    const answer = answerByQuestionId.get(row.question_id);
    return {
      question_id: row.question_id,
      content: q.content,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      given_answer: answer?.given_answer ?? null,
      is_correct: answer?.is_correct ?? false,
      passage_content: q.passages?.content ?? null,
    };
  });

  const student = attempt.students as unknown as { full_name: string } | null;

  return {
    student_id: attempt.student_id,
    student_name: student?.full_name ?? "(không rõ tên)",
    assignment_title: assignment.title,
    submitted_at: attempt.submitted_at,
    score: attempt.score,
    comment: attempt.comment,
    questions,
  };
}
