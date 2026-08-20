import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { getStudentsInClass } from "@/lib/queries/students";
import { addStudent, resetStudentPin } from "@/lib/actions/students";
import { getAssignmentsForClass } from "@/lib/queries/assignments";
import SubmitButton from "@/components/SubmitButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; newUsername?: string; newPin?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id } = await params;
  const { error, newUsername, newPin } = await searchParams;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const students = await getStudentsInClass(id);
  const assignments = await getAssignmentsForClass(id);
  const addStudentWithClassId = addStudent.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/classes" className="text-sm text-zinc-500 underline">
        ← Danh sách lớp
      </Link>

      <div className="mt-2 mb-4 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-zinc-900">{klass.name}</h1>
          <p className="text-sm text-zinc-500">
            Khối {klass.grade} · Mã lớp:{" "}
            <span className="font-mono font-semibold text-zinc-900">{klass.join_code}</span>
          </p>
        </div>
        <Link
          href={`/classes/${id}/assign`}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Giao bài
        </Link>
      </div>

      {newUsername && newPin && (
        <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 p-4">
          <p className="font-medium text-emerald-800">
            In phiếu này phát cho em, PIN chỉ hiện được 1 lần:
          </p>
          <p className="mt-2 text-lg">
            Username: <span className="font-mono font-semibold">{newUsername}</span> · PIN:{" "}
            <span className="font-mono font-semibold">{newPin}</span>
          </p>
        </div>
      )}

      <form
        action={addStudentWithClassId}
        className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-medium">
            Tên học sinh
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="Nguyễn Văn An"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <SubmitButton
          pendingText="Đang thêm…"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-40"
        >
          Thêm học sinh
        </SubmitButton>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <h2 className="mt-8 mb-2 text-sm font-medium text-zinc-500">Bài đã giao</h2>
      {assignments.length === 0 ? (
        <p className="text-zinc-500">Chưa giao bài nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {assignments.map((assignment) => (
            <li key={assignment.id}>
              <Link
                href={`/classes/${id}/assignments/${assignment.id}`}
                className="block rounded border border-zinc-200 p-4 hover:bg-zinc-50"
              >
                <p className="text-zinc-900">{assignment.title}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Hạn nộp:{" "}
                  {new Date(assignment.due_at).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 mb-2 text-sm font-medium text-zinc-500">Học sinh</h2>
      {students.length === 0 ? (
        <p className="mt-6 text-zinc-500">Lớp chưa có học sinh nào.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {students.map((student) => {
            const resetPinForStudent = resetStudentPin.bind(null, id, student.id);
            return (
              <li
                key={student.id}
                className="flex items-center justify-between rounded border border-zinc-200 p-4"
              >
                <Link href={`/classes/${id}/students/${student.id}`}>
                  <p className="text-zinc-900 underline">{student.full_name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Username: <span className="font-mono">{student.username}</span>
                  </p>
                </Link>
                <form action={resetPinForStudent}>
                  <SubmitButton pendingText="Đang reset…" className="text-sm text-zinc-500 underline disabled:opacity-40">
                    Reset PIN
                  </SubmitButton>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
