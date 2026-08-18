import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import { getAssignmentForStudent, getAssignmentQuestions } from "@/lib/queries/assignments";
import { getOrCreateAttempt, getAttemptAnswers } from "@/lib/queries/attempts";
import AssignmentRunner from "@/components/AssignmentRunner";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo học sinh đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
  if (!studentId) {
    redirect("/student-login");
  }

  const { id } = await params;

  const assignment = await getAssignmentForStudent(id, studentId);
  if (!assignment) {
    redirect("/student/home");
  }

  const attempt = await getOrCreateAttempt(id, studentId);
  if (attempt.submitted_at) {
    redirect(`/student/assignments/${id}/result`);
  }

  const questions = await getAssignmentQuestions(id);
  const initialAnswers = await getAttemptAnswers(attempt.id);

  return (
    <AssignmentRunner
      assignmentId={id}
      attemptId={attempt.id}
      assignmentTitle={assignment.title}
      questions={questions}
      initialAnswers={initialAnswers}
    />
  );
}
