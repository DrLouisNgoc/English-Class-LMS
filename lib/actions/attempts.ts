"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
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
    .select("question_id, questions(correct_answer)")
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
    const correctAnswer = (row.questions as unknown as { correct_answer: string } | null)
      ?.correct_answer;
    const answer = answerByQuestionId.get(row.question_id);
    const isCorrect = answer ? answer.given_answer.trim() === correctAnswer?.trim() : false;

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
