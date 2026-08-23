import NotebookPage from "@/components/NotebookPage";
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
    <NotebookPage>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">Ngân hàng câu hỏi</h1>
          <Link
            href="/classes"
            className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40"
          >
            Lớp học
          </Link>
        </nav>
        <form action={signOutTeacher}>
          <button
            type="submit"
            className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40"
          >
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
    </NotebookPage>
  );
}
