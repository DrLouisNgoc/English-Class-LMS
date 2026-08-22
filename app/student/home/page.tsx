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
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="font-display text-center text-xl font-semibold text-ink">
        Xin chào, {student.full_name}!
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {stats.submittedCount}/{stats.assignedCount}
          </p>
          <p className="text-sm text-text/60">Đã làm</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {stats.averageScore === null ? "—" : stats.averageScore}
          </p>
          <p className="text-sm text-text/60">Điểm trung bình</p>
        </div>
        <div className="col-span-2 rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}
          </p>
          <p className="text-sm text-text/60">Nộp đúng hạn</p>
        </div>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-medium text-text/60">Bài được giao</h2>

      {assignments.length === 0 ? (
        <p className="text-text/60">Chưa có bài nào được giao.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="rounded-xl border border-surface-border bg-surface p-4"
            >
              <Link href={`/student/assignments/${assignment.id}`} className="text-ink underline">
                {assignment.title}
              </Link>
              <p className="mt-1 text-sm text-text/60">
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
