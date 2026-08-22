import Link from "next/link";
import { getQuestions } from "@/lib/queries/questions";
import { signOutTeacher } from "@/lib/actions/auth";

// Không prerender tĩnh lúc build — trang này cần đọc Supabase lúc có người
// thật vào xem, không phải lúc build (biến môi trường "Sensitive" không đọc
// được ổn định ở bước build).
export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const questions = await getQuestions();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h1 className="font-display text-xl font-semibold text-ink">Ngân hàng câu hỏi</h1>
          <Link href="/classes" className="text-sm text-text/60 underline hover:text-ink">
            Lớp học
          </Link>
        </nav>
        <form action={signOutTeacher}>
          <button type="submit" className="text-sm text-text/60 underline hover:text-ink">
            Đăng xuất
          </button>
        </form>
      </div>

      {questions.length === 0 ? (
        <p className="text-text/60">Chưa có câu hỏi nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {questions.map((question) => (
            <li key={question.id} className="rounded-xl border border-surface-border bg-surface p-4">
              <p className="text-sm text-text/60">
                Khối {question.grade} · {question.difficulty} · {question.kind}
              </p>
              <p className="mt-1 text-text">{question.content}</p>
              <p className="mt-1 text-sm text-correct">Đáp án: {question.correct_answer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
