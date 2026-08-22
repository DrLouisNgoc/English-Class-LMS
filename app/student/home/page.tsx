import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import { getAssignmentsForStudent } from "@/lib/queries/assignments";
import { getStudentDashboardStats } from "@/lib/queries/dashboard";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo học sinh đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function StudentHomePage() {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);

  if (!studentId) {
    redirect("/student-login");
  }

  const supabase = createServerClient();
  const { data: student } = await supabase
    .from("students")
    .select("full_name")
    .eq("id", studentId)
    .maybeSingle();

  if (!student) {
    redirect("/student-login");
  }

  const assignments = await getAssignmentsForStudent(studentId);
  const stats = await getStudentDashboardStats(studentId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          Xin chào, {student.full_name}!
        </h1>
        <Link
          href="/student/history"
          className="rounded-full border border-ink/30 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink/40 md:text-base"
        >
          Xem lịch sử làm bài
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 md:mt-8 md:gap-4">
        <div className="rounded-xl border border-surface-border bg-surface p-4 md:p-6">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.submittedCount}/{stats.assignedCount}
          </p>
          <p className="mt-1 text-sm text-text/60 md:text-base">Đã làm</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4 md:p-6">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.averageScore === null ? "—" : stats.averageScore}
          </p>
          <p className="mt-1 text-sm text-text/60 md:text-base">Điểm trung bình</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4 md:p-6">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}
          </p>
          <p className="mt-1 text-sm text-text/60 md:text-base">Nộp đúng hạn</p>
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-text/60 md:mt-12 md:text-base">
        Bài được giao
      </h2>

      {assignments.length === 0 ? (
        <p className="text-text/60 md:text-lg">Chưa có bài nào được giao.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="rounded-xl border border-surface-border bg-surface p-4 md:p-6"
            >
              <Link
                href={`/student/assignments/${assignment.id}`}
                className="text-ink underline md:text-lg md:font-medium"
              >
                {assignment.title}
              </Link>
              <p className="mt-1 text-sm text-text/60 md:text-base">
                {assignment.class_name} · Hạn nộp:{" "}
                {new Date(assignment.due_at).toLocaleString("vi-VN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
