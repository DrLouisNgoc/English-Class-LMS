import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClasses } from "@/lib/queries/classes";
import { getTeacherDashboardStats } from "@/lib/queries/dashboard";
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
  const stats = await getTeacherDashboardStats(teacherId);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h1 className="font-display text-xl font-semibold text-ink">Lớp của tôi</h1>
          <Link href="/questions" className="text-sm text-text/60 underline hover:text-ink">
            Ngân hàng câu hỏi
          </Link>
        </nav>
        <form action={signOutTeacher}>
          <button type="submit" className="text-sm text-text/60 underline hover:text-ink">
            Đăng xuất
          </button>
        </form>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">{stats.classCount}</p>
          <p className="text-sm text-text/60">Lớp</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">{stats.studentCount}</p>
          <p className="text-sm text-text/60">Học sinh</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">{stats.assignmentCount}</p>
          <p className="text-sm text-text/60">Bài đã giao</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}
          </p>
          <p className="text-sm text-text/60">Nộp đúng hạn</p>
        </div>
      </div>

      <form
        action={createClass}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-surface-border bg-surface p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-text">
            Tên lớp
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="8A - Tối T3,T6"
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="grade" className="text-sm font-medium text-text">
            Khối
          </label>
          <select
            id="grade"
            name="grade"
            required
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          >
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="join_code" className="text-sm font-medium text-text">
            Mã lớp (để trống thì tự sinh)
          </label>
          <input
            id="join_code"
            name="join_code"
            type="text"
            placeholder="VD: LOP8A"
            maxLength={10}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 uppercase text-text outline-none focus:border-ink"
          />
        </div>

        <SubmitButton
          pendingText="Đang tạo…"
          className="rounded-full bg-ink px-4 py-2 text-white hover:bg-ink-dark disabled:opacity-40"
        >
          Tạo lớp
        </SubmitButton>
      </form>

      {error && <p className="mt-3 text-sm text-red-pen">{error}</p>}

      {classes.length === 0 ? (
        <p className="mt-6 text-text/60">Chưa có lớp nào.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {classes.map((klass) => (
            <li key={klass.id} className="rounded-xl border border-surface-border bg-surface p-4">
              <Link href={`/classes/${klass.id}`} className="text-ink underline">
                {klass.name} · Khối {klass.grade}
              </Link>
              <p className="mt-1 text-sm text-text/60">
                Mã lớp: <span className="font-mono font-semibold text-ink">{klass.join_code}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
