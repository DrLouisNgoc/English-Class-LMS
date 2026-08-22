import Link from "next/link";
import { signInStudent } from "@/lib/actions/studentAuth";
import SubmitButton from "@/components/SubmitButton";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="bg-ink-dark flex min-h-screen items-center justify-center px-4 py-10">
      <div className="ruled-paper w-full max-w-md rounded-3xl border border-surface-border bg-paper p-8 shadow-xl">
        <p className="font-display text-sm font-semibold tracking-widest text-ink/50 uppercase">
          Vở Tiếng Anh
        </p>
        <h1 className="font-display mt-1 mb-6 text-2xl font-semibold text-ink">
          Đăng nhập học sinh
        </h1>

        <form
          action={signInStudent}
          className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="join_code" className="text-sm font-medium text-text">
              Mã lớp
            </label>
            <input
              id="join_code"
              name="join_code"
              type="text"
              required
              autoCapitalize="characters"
              className="rounded-lg border border-ink/30 bg-white px-3 py-2 uppercase text-text outline-none focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-text">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
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
              type="password"
              required
              className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
            />
          </div>

          {error && <p className="text-sm text-red-pen">{error}</p>}

          <SubmitButton
            pendingText="Đang đăng nhập…"
            className="rounded-full bg-ink px-4 py-2 text-white hover:bg-ink-dark disabled:opacity-40"
          >
            Đăng nhập
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-text/60">
          Chưa có tài khoản?{" "}
          <Link href="/student-register" className="text-ink underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </main>
  );
}
