import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { getAssignmentReport, getQuestionMissStats } from "@/lib/queries/assignments";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function AssignmentReportPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id, assignmentId } = await params;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const report = await getAssignmentReport(assignmentId, id);
  const missStats = await getQuestionMissStats(assignmentId);
  const submittedCount = report.filter((row) => row.submitted).length;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href={`/classes/${id}`} className="text-sm text-zinc-500 underline">
        ← {klass.name}
      </Link>

      <h1 className="mt-2 mb-1 text-xl font-semibold text-zinc-900">Bảng điểm</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Đã nộp {submittedCount}/{report.length}
      </p>

      {report.length === 0 ? (
        <p className="text-zinc-500">Lớp chưa có học sinh nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {report.map((row) => (
            <li
              key={row.student_id}
              className="flex items-center justify-between rounded border border-zinc-200 p-4"
            >
              <p className="text-zinc-900">{row.full_name}</p>
              {row.submitted ? (
                <p className="font-medium text-emerald-700">{row.score} điểm</p>
              ) : (
                <p className="text-sm text-zinc-500">Chưa nộp</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 mb-2 text-sm font-medium text-zinc-500">Câu sai nhiều nhất</h2>
      {submittedCount === 0 ? (
        <p className="text-zinc-500">Chưa có ai nộp bài để thống kê.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {missStats.map((row) => (
            <li
              key={row.question_id}
              className="flex items-center justify-between rounded border border-zinc-200 p-4"
            >
              <p className="text-zinc-900">{row.content}</p>
              <p className="shrink-0 pl-4 text-sm text-zinc-500">
                Sai {row.wrong_count}/{row.answered_count}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
