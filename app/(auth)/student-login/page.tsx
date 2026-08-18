import { signInStudent } from "@/lib/actions/studentAuth";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Đăng nhập học sinh</h1>

      <form action={signInStudent} className="flex flex-col gap-4">
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
            className="rounded border border-gray-300 px-3 py-2 uppercase"
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
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="pin" className="text-sm font-medium">
            PIN (6 số)
          </label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
          Đăng nhập
        </button>
      </form>
    </main>
  );
}
