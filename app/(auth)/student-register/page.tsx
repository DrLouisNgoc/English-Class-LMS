import Link from "next/link";
import { registerStudent } from "@/lib/actions/studentAuth";
import SubmitButton from "@/components/SubmitButton";

export default async function StudentRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Đăng ký học sinh</h1>

      <form action={registerStudent} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="join_code" className="text-sm font-medium">
            Mã lớp
          </label>
          <input
            id="join_code"
            name="join_code"
            type="text"
            required
            autoCapitalize="characters"
            placeholder="GV cho mã này"
            className="rounded border border-gray-300 px-3 py-2 uppercase"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-medium">
            Họ tên
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

        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium">
            Tên đăng nhập
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            placeholder="Tự chọn, dễ nhớ"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <SubmitButton
          pendingText="Đang đăng ký…"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-40"
        >
          Đăng ký
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Đã có tài khoản?{" "}
        <Link href="/student-login" className="underline">
          Đăng nhập
        </Link>
      </p>
    </main>
  );
}
