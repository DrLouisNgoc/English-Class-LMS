import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import {
  isStudentInClass,
  getStudentAttemptHistory,
  getStudentSkillStats,
} from "@/lib/queries/students";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id, studentId } = await params;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const belongsToClass = await isStudentInClass(studentId, id);
  if (!belongsToClass) {
    redirect(`/classes/${id}`);
  }

  const history = await getStudentAttemptHistory(studentId);
  const skillStats = await getStudentSkillStats(studentId);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link href={`/classes/${id}`} className="text-sm text-text/60 underline hover:text-ink">
        ← {klass.name}
      </Link>

      <h1 className="font-display mt-2 mb-6 text-xl font-semibold text-ink">Chi tiết học sinh</h1>

      <h2 className="mb-2 text-sm font-medium text-text/60">Tỉ lệ đúng theo kỹ năng</h2>
      {skillStats.length === 0 ? (
        <p className="text-text/60">Chưa có dữ liệu.</p>
      ) : (
        <ul className="mb-8 flex flex-col gap-2">
          {skillStats.map((stat) => (
            <li
              key={stat.skill_tag_id}
              className="flex items-center justify-between rounded-xl border border-surface-border bg-surface p-4"
            >
              <p className="text-text">{stat.name_vi}</p>
              <p className="text-sm text-text/60">
                {stat.correct}/{stat.total} đúng ({Math.round((stat.correct / stat.total) * 100)}
                %)
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 text-sm font-medium text-text/60">Lịch sử làm bài</h2>
      {history.length === 0 ? (
        <p className="text-text/60">Chưa nộp bài nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.map((attempt) => (
            <li
              key={attempt.id}
              className="flex items-center justify-between rounded-xl border border-surface-border bg-surface p-4"
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
    </div>
  );
}
