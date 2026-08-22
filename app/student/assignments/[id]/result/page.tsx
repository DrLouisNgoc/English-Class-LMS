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
    <main className="ruled-paper mx-auto max-w-3xl px-4 py-10 md:py-16">
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

      <ul className="flex flex-col gap-3 md:gap-4">
        {result.questions.map((q, index) => (
          <li
            key={q.question_id}
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
                Đáp án đúng: <span className="font-medium text-correct">{q.correct_answer}</span>
              </p>
            )}
            {q.explanation && (
              <p className="mt-2 text-sm text-text/60 italic md:text-base">{q.explanation}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
