import NotebookPage from "@/components/NotebookPage";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { getAttemptDetailForTeacher } from "@/lib/queries/attempts";
import AttemptCommentForm from "@/components/AttemptCommentForm";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function TeacherAttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string; attemptId: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id, assignmentId, attemptId } = await params;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  // Trả về null nếu bài này không thuộc lớp của thầy, hoặc học sinh chưa nộp —
  // cả hai trường hợp đều đưa về lại bảng điểm thay vì hiện trang trống.
  const detail = await getAttemptDetailForTeacher(attemptId, id, teacherId);
  if (!detail) {
    redirect(`/classes/${id}/assignments/${assignmentId}`);
  }

  const correctCount = detail.questions.filter((q) => q.is_correct).length;

  return (
    <NotebookPage>
      <Link
        href={`/classes/${id}/assignments/${assignmentId}`}
        className="text-sm text-text/60 underline hover:text-ink"
      >
        ← Bảng điểm
      </Link>

      <h1 className="font-display mt-2 mb-1 text-xl font-semibold text-ink md:text-2xl">
        Bài làm của {detail.student_name}
      </h1>
      <p className="mb-6 text-sm text-text/60">
        {detail.assignment_title} · Nộp lúc{" "}
        {new Date(detail.submitted_at).toLocaleString("vi-VN", {
          dateStyle: "short",
          timeStyle: "short",
        })}{" "}
        · Đúng {correctCount}/{detail.questions.length} câu ·{" "}
        <span className="font-medium text-ink">{detail.score} điểm</span>
      </p>

      <ul className="flex flex-col gap-3">
        {detail.questions.map((q, index) => {
          // Chỉ hiện đoạn văn một lần, tại câu đầu của nhóm dùng chung —
          // giống trang kết quả của học sinh.
          const showPassage =
            q.passage_content !== null &&
            q.passage_content !== detail.questions[index - 1]?.passage_content;

          return (
            <li key={q.question_id} className="flex flex-col gap-3">
              {showPassage && (
                <div className="rounded-xl border border-ink/20 bg-ink/5 p-4">
                  <p className="mb-2 text-xs font-medium tracking-wide text-ink/60 uppercase">
                    Đoạn văn của các câu dưới đây
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-text">
                    {q.passage_content}
                  </p>
                </div>
              )}

              <div
                className={`rounded-xl border bg-white p-4 ${
                  q.is_correct ? "border-correct/30" : "border-red-pen/30"
                }`}
              >
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className={q.is_correct ? "text-correct" : "text-red-pen"}>
                    {q.is_correct ? "✓" : "✗"}
                  </span>
                  <span className="text-text/60">Câu {index + 1}</span>
                </p>
                <p className="mt-1 text-text">{q.content}</p>
                <p className="mt-2 text-sm text-text/70">
                  Em trả lời:{" "}
                  <span className={`font-medium ${q.is_correct ? "text-correct" : "text-red-pen"}`}>
                    {q.given_answer ?? "(bỏ trống)"}
                  </span>
                </p>
                {!q.is_correct && (
                  <p className="mt-1 text-sm text-text/70">
                    Đáp án đúng:{" "}
                    <span className="font-medium text-correct">{q.correct_answer}</span>
                  </p>
                )}
                {q.explanation && (
                  <p className="mt-2 text-sm text-text/60 italic">{q.explanation}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <AttemptCommentForm attemptId={attemptId} classId={id} initialComment={detail.comment} />
    </NotebookPage>
  );
}
