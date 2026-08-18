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
    <main className="mx-auto max-w-sm px-4 py-10">
      <Link href="/student/home" className="text-sm text-zinc-500 underline">
        ← Trang chủ
      </Link>

      <h1 className="mt-2 mb-1 text-xl font-semibold text-zinc-900">Kết quả</h1>
      <p className="mb-6 text-3xl font-bold text-emerald-700">{result.score} điểm</p>

      <ul className="flex flex-col gap-3">
        {result.questions.map((q, index) => (
          <li
            key={q.question_id}
            className={`rounded border p-4 ${
              q.is_correct ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
            }`}
          >
            <p className="text-sm text-zinc-500">
              Câu {index + 1} · {q.is_correct ? "Đúng" : "Sai"}
            </p>
            <p className="mt-1 text-zinc-900">{q.content}</p>
            <p className="mt-2 text-sm text-zinc-700">
              Bạn trả lời: <span className="font-medium">{q.given_answer ?? "(bỏ trống)"}</span>
            </p>
            {!q.is_correct && (
              <p className="mt-1 text-sm text-zinc-700">
                Đáp án đúng: <span className="font-medium">{q.correct_answer}</span>
              </p>
            )}
            {q.explanation && <p className="mt-2 text-sm text-zinc-600 italic">{q.explanation}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
