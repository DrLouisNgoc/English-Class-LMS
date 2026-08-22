import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
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
    <main className="ruled-paper mx-auto max-w-sm px-4 py-10">
      <Link href="/student/home" className="text-sm text-ink/70 underline hover:text-ink">
        ← Trang chủ
      </Link>

      <h1 className="font-display mt-2 mb-6 text-xl font-semibold text-ink">Kết quả</h1>

      {/* Điểm số đóng dấu như con dấu chấm bài của giáo viên */}
      <div className="mb-8 flex justify-center">
        <div className="flex -rotate-3 flex-col items-center justify-center rounded-full border-4 border-red-pen px-6 py-5 text-red-pen">
          <span className="font-display text-4xl font-bold">{result.score}</span>
          <span className="text-xs font-medium tracking-wide">ĐIỂM</span>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {result.questions.map((q, index) => (
          <li
            key={q.question_id}
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
              Bạn trả lời:{" "}
              <span className="font-medium text-ink">{q.given_answer ?? "(bỏ trống)"}</span>
            </p>
            {!q.is_correct && (
              <p className="mt-1 text-sm text-text/70">
                Đáp án đúng: <span className="font-medium text-correct">{q.correct_answer}</span>
              </p>
            )}
            {q.explanation && (
              <p className="mt-2 text-sm text-text/60 italic">{q.explanation}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
