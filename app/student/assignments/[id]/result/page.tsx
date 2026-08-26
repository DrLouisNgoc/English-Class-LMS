import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import NotebookPage from "@/components/NotebookPage";
import { getOrCreateAttempt, getAttemptResult } from "@/lib/queries/attempts";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo học sinh đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function AssignmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
  if (!studentId) {
    redirect("/student-login");
  }

  const { id } = await params;

  // Lượt làm bài mới nhất của HS cho bài này — nếu chưa nộp thì đưa về lại
  // màn hình làm bài thay vì hiện trang trống.
  const attempt = await getOrCreateAttempt(id, studentId);
  if (!attempt.submitted_at) {
    redirect(`/student/assignments/${id}`);
  }

  const result = await getAttemptResult(attempt.id, studentId);
  if (!result) {
    redirect("/student/home");
  }

  return (
    <NotebookPage>
      <Link
        href="/student/home"
        className="text-sm text-ink/70 underline hover:text-ink md:text-base"
      >
        ← Trang chủ
      </Link>

      <h1 className="font-display mt-2 mb-6 text-2xl font-semibold text-ink md:text-3xl">
        Kết quả
      </h1>

      {/* Điểm số đóng dấu như con dấu chấm bài của giáo viên */}
      <div className="mb-8 flex justify-center md:mb-12">
        <div className="flex -rotate-3 flex-col items-center justify-center rounded-full border-4 border-red-pen px-6 py-5 text-red-pen md:px-9 md:py-7">
          <span className="font-display text-4xl font-bold md:text-6xl">{result.score}</span>
          <span className="text-xs font-medium tracking-wide md:text-sm">ĐIỂM</span>
        </div>
      </div>

      {/* Lời phê là tuỳ chọn — thầy không viết thì khối này không hiện.
          Đặt ngay dưới điểm, trước danh sách câu, theo đúng thứ tự em muốn
          đọc: điểm → nhận xét → sai ở đâu. */}
      {result.comment && (
        <div className="mb-8 rounded-xl border border-red-pen/30 bg-red-pen/5 p-4 md:mb-12 md:p-6">
          <p className="text-sm font-medium text-red-pen md:text-base">Lời phê của thầy</p>
          <p className="mt-2 whitespace-pre-wrap text-text md:text-lg md:leading-relaxed">
            {result.comment}
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-3 md:gap-4">
        {result.questions.map((q, index) => {
          // Khác lúc làm bài: ở đây chỉ hiện đoạn văn một lần, tại câu đầu
          // của nhóm dùng chung. Xem lại là cuộn một mạch, lặp cùng một đoạn
          // văn 5 lần sẽ đẩy phần đáp án đi mất.
          const showPassage =
            q.passage_content !== null &&
            q.passage_content !== result.questions[index - 1]?.passage_content;

          return (
            <li key={q.question_id} className="flex flex-col gap-3">
              {showPassage && (
                <div className="rounded-xl border border-ink/20 bg-ink/5 p-4 md:p-6">
                  <p className="mb-2 text-xs font-medium tracking-wide text-ink/60 uppercase">
                    Đoạn văn của các câu dưới đây
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-text md:text-base">
                    {q.passage_content}
                  </p>
                </div>
              )}

              <div
                className={`rounded-xl border bg-white p-4 md:p-6 ${
                  q.is_correct ? "border-correct/30" : "border-red-pen/30"
                }`}
              >
                <p className="flex items-center gap-2 text-sm font-medium md:text-base">
                  <span className={q.is_correct ? "text-correct" : "text-red-pen"}>
                    {q.is_correct ? "✓" : "✗"}
                  </span>
                  <span className="text-text/60">Câu {index + 1}</span>
                </p>
                <p className="mt-1 text-text md:text-lg md:leading-relaxed">{q.content}</p>
                <p className="mt-2 text-sm text-text/70 md:text-base">
                  Bạn trả lời:{" "}
                  <span className="font-medium text-ink">{q.given_answer ?? "(bỏ trống)"}</span>
                </p>
                {!q.is_correct && (
                  <p className="mt-1 text-sm text-text/70 md:text-base">
                    Đáp án đúng:{" "}
                    <span className="font-medium text-correct">{q.correct_answer}</span>
                  </p>
                )}
                {q.explanation && (
                  <p className="mt-2 text-sm text-text/60 italic md:text-base">{q.explanation}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </NotebookPage>
  );
}
