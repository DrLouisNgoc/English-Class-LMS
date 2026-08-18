import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { getStudentsInClass } from "@/lib/queries/students";
import { addStudent } from "@/lib/actions/students";

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
  const addStudentWithClassId = addStudent.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/classes" className="text-sm text-zinc-500 underline">
        ← Danh sách lớp
      </Link>

      <h1 className="mt-2 mb-1 text-xl font-semibold text-zinc-900">{klass.name}</h1>
      <p className="mb-4 text-sm text-zinc-500">
        Khối {klass.grade} · Mã lớp:{" "}
        <span className="font-mono font-semibold text-zinc-900">{klass.join_code}</span>
      </p>

      {newUsername && newPin && (
        <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 p-4">
          <p className="font-medium text-emerald-800">
            Đã tạo học sinh — in phiếu này phát cho em, PIN chỉ hiện được 1 lần:
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

        <button type="submit" className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
          Thêm học sinh
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {students.length === 0 ? (
        <p className="mt-6 text-zinc-500">Lớp chưa có học sinh nào.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {students.map((student) => (
            <li key={student.id} className="rounded border border-zinc-200 p-4">
              <p className="text-zinc-900">{student.full_name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                Username: <span className="font-mono">{student.username}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
