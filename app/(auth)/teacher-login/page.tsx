"use client";

import { useActionState } from "react";
import { signInTeacher } from "@/lib/actions/auth";

export default function TeacherLoginPage() {
  const [state, formAction, pending] = useActionState(signInTeacher, null);

  return (
    <main className="bg-ink-dark flex min-h-screen items-center justify-center px-4 py-10">
      <div className="ruled-paper w-full max-w-md rounded-3xl border border-surface-border bg-paper p-8 shadow-xl">
        <p className="font-display text-sm font-semibold tracking-widest text-ink/50 uppercase">
          Vở Tiếng Anh
        </p>
        <h1 className="font-display mt-1 mb-6 text-2xl font-semibold text-ink">
          Đăng nhập giáo viên
        </h1>

        <form
          action={formAction}
          className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
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

          {state?.error && <p className="text-sm text-red-pen">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-4 py-2 text-white hover:bg-ink-dark disabled:opacity-50"
          >
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </main>
  );
}
