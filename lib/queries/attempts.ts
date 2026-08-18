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
};

export type AttemptResult = {
  score: number | null;
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
    .select("student_id, submitted_at, score, assignment_id")
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
    .select("position, question_id, questions(content, correct_answer, explanation)")
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
    };
    const answer = answerByQuestionId.get(row.question_id);
    return {
      question_id: row.question_id,
      content: q.content,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      given_answer: answer?.given_answer ?? null,
      is_correct: answer?.is_correct ?? false,
    };
  });

  return { score: attempt.score, questions };
}
