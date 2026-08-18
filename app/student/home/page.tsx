import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";

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

  return (
    <main className="mx-auto max-w-sm px-4 py-10 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">Xin chào, {student.full_name}!</h1>
      <p className="mt-2 text-zinc-500">Bài tập sẽ hiện ở đây (đang làm ở tuần sau).</p>
    </main>
  );
}
