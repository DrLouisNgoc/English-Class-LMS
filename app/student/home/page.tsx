import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import { getAssignmentsForStudent } from "@/lib/queries/assignments";

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

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-center text-xl font-semibold text-zinc-900">
        Xin chào, {student.full_name}!
      </h1>

      <h2 className="mt-6 mb-2 text-sm font-medium text-zinc-500">Bài được giao</h2>

      {assignments.length === 0 ? (
        <p className="text-zinc-500">Chưa có bài nào được giao.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="rounded border border-zinc-200 p-4">
              <p className="text-zinc-900">{assignment.title}</p>
              <p className="mt-1 text-sm text-zinc-500">
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
