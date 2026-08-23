import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { getQuestions } from "@/lib/queries/questions";
import { signOutTeacher } from "@/lib/actions/auth";

// Không prerender tĩnh lúc build — trang này cần đọc Supabase lúc có người
// thật vào xem, không phải lúc build (biến môi trường "Sensitive" không đọc
// được ổn định ở bước build).
export const dynamic = "force-dynamic";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    updated?: string;
    deleted?: string;
    hidden?: string;
    imported?: string;
    error?: string;
  }>;
}) {
  const { saved, updated, deleted, hidden, imported, error } = await searchParams;
  const questions = await getQuestions();

  // Gộp các thông báo thành công vào một chỗ cho gọn.
  const notice = saved
    ? "Đã lưu câu hỏi mới."
    : imported
      ? `Đã lưu ${imported} câu hỏi vào ngân hàng.`
      : updated
        ? "Đã lưu thay đổi."
        : deleted
          ? "Đã xoá câu hỏi."
          : hidden
            ? "Câu hỏi đã được giao trong bài tập nên được chuyển sang ẩn thay vì xoá. Bài cũ của học sinh vẫn giữ nguyên."
            : null;

  return (
    <NotebookPage>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">
            Ngân hàng câu hỏi
          </h1>
          <Link
            href="/classes"
            className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40"
          >
            Lớp học
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/questions/import"
            className="rounded-full bg-gold px-3 py-1.5 text-sm font-medium text-ink hover:bg-gold-dark hover:text-white"
          >
            Dán nhiều câu
          </Link>
          <Link
            href="/questions/new"
            className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-dark"
          >
            + Thêm câu hỏi
          </Link>
          <form action={signOutTeacher}>
            <button
              type="submit"
              className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>

      {notice && (
        <p className="mb-4 rounded-lg border border-correct/40 bg-correct/5 px-3 py-2 text-sm text-correct">
          {notice}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      {questions.length === 0 ? (
        <p className="text-text/60">Chưa có câu hỏi nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-surface-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm text-text/60">
                  Khối {question.grade} · {question.difficulty} · {question.kind}
                  {question.status === "an" && (
                    <span className="ml-2 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold-dark">
                      Đã ẩn
                    </span>
                  )}
                </p>
                <Link
                  href={`/questions/${question.id}`}
                  className="rounded-full border border-ink/30 bg-white px-3 py-1 text-sm font-medium text-ink hover:border-ink/40"
                >
                  Sửa
                </Link>
              </div>
              <p className="mt-1 text-text">{question.content}</p>
              <p className="mt-1 text-sm text-correct">Đáp án: {question.correct_answer}</p>
            </li>
          ))}
        </ul>
      )}
    </NotebookPage>
  );
}
