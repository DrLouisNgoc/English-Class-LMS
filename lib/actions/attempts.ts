"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";

// Server action HS gọi ngay khi chọn/gõ đáp án cho 1 câu — không đợi bấm nộp
// bài (T4.4). "upsert" nghĩa là: chưa có thì tạo mới, có rồi thì ghi đè —
// nhờ ràng buộc unique(attempt_id, question_id) trong database.
export async function saveAnswer(attemptId: string, questionId: string, givenAnswer: string) {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
  if (!studentId) {
    return { error: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại." };
  }

  const supabase = createServerClient();

  // Kiểm tra lượt làm bài này đúng là của học sinh đang đăng nhập và chưa nộp
  // — tránh HS sửa attemptId trong request để ghi đè bài của người khác, hoặc
  // sửa đáp án sau khi đã nộp.
  const { data: attempt } = await supabase
    .from("attempts")
    .select("student_id, submitted_at")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || attempt.student_id !== studentId || attempt.submitted_at) {
    return { error: "Không lưu được câu trả lời." };
  }

  const { error } = await supabase
    .from("answers")
    .upsert(
      { attempt_id: attemptId, question_id: questionId, given_answer: givenAnswer },
      { onConflict: "attempt_id,question_id" },
    );

  if (error) {
    return { error: `Không lưu được câu trả lời: ${error.message}` };
  }

  return { error: null };
}

// Bỏ những khác biệt không liên quan tới kiến thức khi chấm câu điền chữ:
// chữ hoa/thường (em gõ hoa đầu câu theo thói quen), khoảng trắng thừa hoặc
// gõ đúp, và dấu chấm/chấm than/chấm hỏi ở cuối. Mục tiêu là kiểm tra tiếng
// Anh, không phải kiểm tra gõ phím.
function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .trim();
}

// So câu trả lời của học sinh với đáp án đúng đọc từ database.
//
// Câu trắc nghiệm: so nguyên văn như từ trước — học sinh bấm chọn nên chuỗi
// phải khớp đúng phương án, không có chuyện gõ sai chính tả.
//
// Câu điền chữ: đáp án lưu dạng "doesn't|does not" (thầy nhập, phân cách bằng
// dấu |). Thử lần lượt từng cách, cách nào khớp sau khi bỏ hoa/thường và dấu
// câu thì tính đúng.
function isAnswerCorrect(
  question: { kind: string; correct_answer: string } | null,
  givenAnswer: string,
): boolean {
  if (!question) {
    return false;
  }

  if (question.kind !== "DIEN") {
    return givenAnswer.trim() === question.correct_answer.trim();
  }

  const given = normalizeText(givenAnswer);
  if (!given) {
    return false;
  }

  return question.correct_answer
    .split("|")
    .map(normalizeText)
    .filter(Boolean)
    .some((accepted) => accepted === given);
}

// Server action HS bấm "Nộp bài" (T4.6). Chấm điểm hoàn toàn ở server: đọc
// đáp án đúng từ bảng questions (chưa từng gửi xuống trình duyệt), so với
// given_answer đã lưu, ghi is_correct cho từng câu rồi tính điểm trên tổng số câu.
export async function submitAttempt(assignmentId: string, attemptId: string) {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
  if (!studentId) {
    redirect("/student-login");
  }

  const supabase = createServerClient();

  const { data: attempt } = await supabase
    .from("attempts")
    .select("student_id, submitted_at")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || attempt.student_id !== studentId) {
    redirect("/student/home");
  }

  if (attempt.submitted_at) {
    redirect(`/student/assignments/${assignmentId}/result`);
  }

  const { data: assignmentQuestions, error: aqError } = await supabase
    .from("assignment_questions")
    .select("question_id, questions(kind, correct_answer)")
    .eq("assignment_id", assignmentId);

  if (aqError) {
    throw new Error(`Không đọc được câu hỏi của bài giao: ${aqError.message}`);
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, given_answer")
    .eq("attempt_id", attemptId);

  if (answersError) {
    throw new Error(`Không đọc được câu trả lời: ${answersError.message}`);
  }

  const answerByQuestionId = new Map(answers.map((a) => [a.question_id, a]));

  let correctCount = 0;
  for (const row of assignmentQuestions) {
    const question = row.questions as unknown as { kind: string; correct_answer: string } | null;
    const answer = answerByQuestionId.get(row.question_id);
    const isCorrect = answer ? isAnswerCorrect(question, answer.given_answer) : false;

    if (isCorrect) correctCount++;

    if (answer) {
      await supabase.from("answers").update({ is_correct: isCorrect }).eq("id", answer.id);
    }
  }

  const total = assignmentQuestions.length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100 * 100) / 100;

  const { error: submitError } = await supabase
    .from("attempts")
    .update({ submitted_at: new Date().toISOString(), score })
    .eq("id", attemptId);

  if (submitError) {
    throw new Error(`Không nộp được bài: ${submitError.message}`);
  }

  redirect(`/student/assignments/${assignmentId}/result`);
}

// Server action GV lưu (hoặc sửa) lời phê cho 1 bài học sinh đã nộp (B4).
// Lời phê là tuỳ chọn: để trống nghĩa là xoá lời phê, ghi NULL chứ không ghi
// chuỗi rỗng — để chỗ khác chỉ cần hỏi "comment có null không" là biết.
//
// Kiểm quyền hai lớp trước khi ghi: (1) có GV nào đang đăng nhập không,
// (2) lượt làm bài này có thuộc đúng lớp của GV đó không — tránh GV sửa
// attemptId trên URL để phê vào bài của lớp người khác.
export async function saveAttemptComment(attemptId: string, classId: string, comment: string) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const trimmed = comment.trim();
  if (trimmed.length > 2000) {
    return { error: "Lời phê quá dài (tối đa 2000 ký tự)." };
  }

  const supabase = createServerClient();

  const { data: attempt } = await supabase
    .from("attempts")
    .select("submitted_at, assignment_id")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || !attempt.submitted_at) {
    return { error: "Không tìm thấy bài đã nộp này." };
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("class_id, classes(teacher_id)")
    .eq("id", attempt.assignment_id)
    .eq("class_id", classId)
    .maybeSingle();

  const owner = assignment?.classes as unknown as { teacher_id: string } | null;
  if (!assignment || owner?.teacher_id !== teacherId) {
    return { error: "Bài này không thuộc lớp của bạn." };
  }

  const { error } = await supabase
    .from("attempts")
    .update({ comment: trimmed === "" ? null : trimmed })
    .eq("id", attemptId);

  if (error) {
    return { error: `Không lưu được lời phê: ${error.message}` };
  }

  // Bảng điểm của bài giao có nhãn "Đã có lời phê" — bảo Next.js vẽ lại trang
  // đó, nếu không GV quay lại vẫn thấy dữ liệu cũ đã lưu sẵn trong cache.
  revalidatePath(`/classes/${classId}/assignments/${attempt.assignment_id}`);

  return { error: null };
}
