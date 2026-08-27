import NotebookPage from "@/components/NotebookPage";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { getStudentsInClass } from "@/lib/queries/students";
import { addStudent, resetStudentPin } from "@/lib/actions/students";
import { getAssignmentsForClass } from "@/lib/queries/assignments";
import {
  getClassDashboardStats,
  getClassSkillMissStats,
  getStudentsNeedingAttention,
} from "@/lib/queries/dashboard";
import SubmitButton from "@/components/SubmitButton";
import RemoveStudentButton from "@/components/RemoveStudentButton";
import DeleteAssignmentButton from "@/components/DeleteAssignmentButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; newUsername?: string; newPin?: string; added?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id } = await params;
  const { error, newUsername, newPin, added } = await searchParams;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const students = await getStudentsInClass(id);
  const assignments = await getAssignmentsForClass(id);
  const stats = await getClassDashboardStats(id);
  const skillMisses = await getClassSkillMissStats(id);
  const studentsNeedingAttention = await getStudentsNeedingAttention(id);
  const addStudentWithClassId = addStudent.bind(null, id);

  return (
    <NotebookPage>
      <Link href="/classes" className="text-sm text-text/60 underline hover:text-ink">
        ← Danh sách lớp
      </Link>

      <div className="mt-2 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display mb-1 text-xl font-semibold text-ink md:text-2xl">
            {klass.name}
          </h1>
          <p className="text-sm text-text/60">
            Khối {klass.grade} · Mã lớp:{" "}
            <span className="font-mono font-semibold text-ink">{klass.join_code}</span>
          </p>
        </div>
        <Link
          href={`/classes/${id}/assign`}
          className="rounded-full bg-ink px-4 py-2 text-sm text-white hover:bg-ink-dark"
        >
          Giao bài
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.studentCount}
          </p>
          <p className="text-sm text-text/60 md:text-base">Học sinh</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.assignmentCount}
          </p>
          <p className="text-sm text-text/60 md:text-base">Bài đã giao</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}
          </p>
          <p className="text-sm text-text/60 md:text-base">Nộp đúng hạn</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink md:text-4xl">
            {stats.averageScore === null ? "—" : stats.averageScore}
          </p>
          <p className="text-sm text-text/60 md:text-base">Điểm trung bình</p>
        </div>
      </div>

      {(skillMisses.length > 0 || studentsNeedingAttention.length > 0) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {skillMisses.length > 0 && (
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              <h2 className="mb-2 text-sm font-medium text-text/60">Kỹ năng cả lớp hay sai</h2>
              <ul className="flex flex-col gap-1">
                {skillMisses.map((skill) => (
                  <li key={skill.skill_tag_id} className="flex justify-between text-sm">
                    <span className="text-text">{skill.name_vi}</span>
                    <span className="text-text/60">
                      Sai {skill.wrong_count}/{skill.answered_count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {studentsNeedingAttention.length > 0 && (
            <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
              <h2 className="mb-2 text-sm font-medium text-gold-dark">Học sinh cần chú ý</h2>
              <ul className="flex flex-col gap-1">
                {studentsNeedingAttention.map((student) => (
                  <li key={student.student_id} className="text-sm">
                    <span className="font-medium text-text">{student.full_name}</span>
                    <span className="text-text/60"> — {student.reasons.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {added && (
        <div className="mb-4 rounded-xl border border-correct/30 bg-correct/10 p-4">
          <p className="text-correct">
            Đã thêm học sinh <span className="font-semibold">{added}</span>.
          </p>
        </div>
      )}

      {newUsername && newPin && (
        <div className="mb-4 rounded-xl border border-correct/30 bg-correct/10 p-4">
          <p className="font-medium text-correct">
            Mật khẩu mới, phát phiếu này cho em (chỉ hiện được 1 lần):
          </p>
          <p className="mt-2 text-lg text-text">
            Username: <span className="font-mono font-semibold">{newUsername}</span> · Mật khẩu:{" "}
            <span className="font-mono font-semibold">{newPin}</span>
          </p>
        </div>
      )}

      <form
        action={addStudentWithClassId}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-surface-border bg-surface p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-medium text-text">
            Tên học sinh
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="Nguyễn Văn An"
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium text-text">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            placeholder="an"
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-text">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="text"
            required
            placeholder="Tự đặt cho em"
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          />
        </div>

        <SubmitButton
          pendingText="Đang thêm…"
          className="rounded-full bg-ink px-4 py-2 text-white hover:bg-ink-dark disabled:opacity-40"
        >
          Thêm học sinh
        </SubmitButton>
      </form>

      {error && <p className="mt-3 text-sm text-red-pen">{error}</p>}

      <h2 className="mt-8 mb-2 text-sm font-medium text-text/60">Bài đã giao</h2>
      {assignments.length === 0 ? (
        <p className="text-text/60">Chưa giao bài nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {/* Nút xoá nằm CẠNH link chứ không lồng trong link: nút bên trong
              thẻ <a> là HTML sai, và bấm nút sẽ mở luôn trang bảng điểm. Nên
              <li> làm khung, link và nút là hai phần riêng bên trong. */}
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            >
              <Link
                href={`/classes/${id}/assignments/${assignment.id}`}
                className="flex flex-1 flex-col gap-2 rounded-lg hover:text-ink sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div>
                  <p className="text-text">{assignment.title}</p>
                  <p className="mt-1 text-sm text-text/60">
                    Hạn nộp:{" "}
                    {new Date(assignment.due_at).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {/* Cả ô vốn đã bấm được, nhưng không có dấu hiệu gì nên nhìn
                    như ô thông tin tĩnh — thêm dòng này để thấy ngay là bấm được. */}
                <span className="shrink-0 text-sm font-medium text-ink">Xem bảng điểm →</span>
              </Link>
              <DeleteAssignmentButton
                classId={id}
                assignmentId={assignment.id}
                title={assignment.title}
                attemptCount={assignment.attempt_count}
              />
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 mb-2 text-sm font-medium text-text/60">Học sinh</h2>
      {students.length === 0 ? (
        <p className="mt-6 text-text/60">Lớp chưa có học sinh nào.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {students.map((student) => {
            const resetPinForStudent = resetStudentPin.bind(null, id, student.id);
            return (
              <li
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface p-4"
              >
                <Link href={`/classes/${id}/students/${student.id}`}>
                  <p className="text-ink underline">{student.full_name}</p>
                  <p className="mt-1 text-sm text-text/60">
                    Username: <span className="font-mono">{student.username}</span>
                  </p>
                </Link>
                <div className="flex items-center gap-3">
                  <form action={resetPinForStudent}>
                    <SubmitButton
                      pendingText="Đang reset…"
                      className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40 disabled:opacity-40"
                    >
                      Reset PIN
                    </SubmitButton>
                  </form>
                  <RemoveStudentButton
                    classId={id}
                    studentId={student.id}
                    studentName={student.full_name}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </NotebookPage>
  );
}
