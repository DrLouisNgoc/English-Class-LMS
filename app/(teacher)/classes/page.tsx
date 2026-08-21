import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClasses } from "@/lib/queries/classes";
import { createClass } from "@/lib/actions/classes";
import { signOutTeacher } from "@/lib/actions/auth";
import SubmitButton from "@/components/SubmitButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { error } = await searchParams;
  const classes = await getClasses(teacherId);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Lớp của tôi</h1>
        <form action={signOutTeacher}>
          <button type="submit" className="text-sm text-zinc-500 underline">
            Đăng xuất
          </button>
        </form>
      </div>

      <form
        action={createClass}
        className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Tên lớp
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="8A - Tối T3,T6"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="grade" className="text-sm font-medium">
            Khối
          </label>
          <select
            id="grade"
            name="grade"
            required
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="join_code" className="text-sm font-medium">
            Mã lớp (để trống thì tự sinh)
          </label>
          <input
            id="join_code"
            name="join_code"
            type="text"
            placeholder="VD: LOP8A"
            maxLength={10}
            className="rounded border border-gray-300 px-3 py-2 uppercase"
          />
        </div>

        <SubmitButton
          pendingText="Đang tạo…"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-40"
        >
          Tạo lớp
        </SubmitButton>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {classes.length === 0 ? (
        <p className="mt-6 text-zinc-500">Chưa có lớp nào.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {classes.map((klass) => (
            <li key={klass.id} className="rounded border border-zinc-200 p-4">
              <Link href={`/classes/${klass.id}`} className="text-zinc-900 underline">
                {klass.name} · Khối {klass.grade}
              </Link>
              <p className="mt-1 text-sm text-zinc-500">
                Mã lớp:{" "}
                <span className="font-mono font-semibold text-zinc-900">{klass.join_code}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
