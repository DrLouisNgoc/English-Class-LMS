import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-ink-dark flex min-h-screen items-center justify-center px-4 py-10">
      <div className="ruled-paper w-full max-w-md rounded-3xl border border-surface-border bg-paper p-8 text-center shadow-xl">
        <p className="font-display text-sm font-semibold tracking-widest text-ink/50 uppercase">
          Vở Tiếng Anh
        </p>
        <h1 className="font-display mt-1 mb-1 text-2xl font-semibold text-ink">
          Lớp học tiếng Anh
        </h1>
        <p className="mb-8 text-sm text-text/60">Chọn vai trò để đăng nhập</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/teacher-login"
            className="rounded-full bg-ink px-4 py-3 font-medium text-white hover:bg-ink-dark"
          >
            Tôi là giáo viên
          </Link>
          <Link
            href="/student-login"
            className="rounded-full border border-ink/20 bg-white px-4 py-3 font-medium text-ink hover:border-ink/40"
          >
            Tôi là học sinh
          </Link>
        </div>
      </div>
    </main>
  );
}
