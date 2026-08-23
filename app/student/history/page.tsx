import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotebookPage from "@/components/NotebookPage";
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
    <NotebookPage>
      <Link
        href="/student/home"
        className="text-sm text-ink/70 underline hover:text-ink md:text-base"
      >
        ← Trang chủ
      </Link>

      <h1 className="font-display mt-2 mb-6 text-2xl font-semibold text-ink md:mb-8 md:text-3xl">
        Lịch sử làm bài
      </h1>

      {history.length === 0 ? (
        <p className="text-text/60 md:text-lg">Chưa nộp bài nào.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {history.map((attempt) => (
            <li
              key={attempt.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-white p-4 md:p-6"
            >
              <div>
                <p className="text-text md:text-lg md:font-medium">{attempt.assignment_title}</p>
                <p className="mt-1 text-sm text-text/60 md:text-base">
                  Nộp lúc{" "}
                  {new Date(attempt.submitted_at).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <p className="font-medium text-correct md:text-lg">{attempt.score} điểm</p>
            </li>
          ))}
        </ul>
      )}
    </NotebookPage>
  );
}
