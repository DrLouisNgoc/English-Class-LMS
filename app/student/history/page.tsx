import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import { getStudentAttemptHistory } from "@/lib/queries/students";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo học sinh đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function StudentHistoryPage() {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);

  if (!studentId) {
    redirect("/student-login");
  }

  const history = await getStudentAttemptHistory(studentId);

  return (
    <main className="ruled-paper mx-auto max-w-sm px-4 py-10">
      <Link href="/student/home" className="text-sm text-ink/70 underline hover:text-ink">
        ← Trang chủ
      </Link>

      <h1 className="font-display mt-2 mb-6 text-xl font-semibold text-ink">Lịch sử làm bài</h1>

      {history.length === 0 ? (
        <p className="text-text/60">Chưa nộp bài nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {history.map((attempt) => (
            <li
              key={attempt.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-white p-4"
            >
              <div>
                <p className="text-text">{attempt.assignment_title}</p>
                <p className="mt-1 text-sm text-text/60">
                  Nộp lúc{" "}
                  {new Date(attempt.submitted_at).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <p className="font-medium text-correct">{attempt.score} điểm</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
