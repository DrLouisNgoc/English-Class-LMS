import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getPassages } from "@/lib/queries/passages";
import { createPassage } from "@/lib/actions/passages";
import PassageForm from "@/components/PassageForm";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function PassagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { saved, deleted, error } = await searchParams;
  const passages = await getPassages(teacherId);

  const notice = saved ? "Đã lưu bài đọc." : deleted ? "Đã xoá bài đọc." : null;

  return (
    <NotebookPage>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">Bài đọc hiểu</h1>
        <Link
          href="/questions"
          className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40"
        >
          Ngân hàng câu hỏi
        </Link>
        <Link
          href="/classes"
          className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm font-medium text-ink hover:border-ink/40"
        >
          Lớp học
        </Link>
      </div>

      <p className="mb-6 text-sm text-text/60">
        Đoạn văn lưu ở đây để nhiều câu hỏi dùng chung — không phải chép lại đoạn văn vào từng câu
        nữa. Sửa đoạn văn một lần là mọi câu hỏi của nó cùng đổi theo.
      </p>

      {notice && (
        <p className="mb-4 rounded-lg border border-correct/40 bg-correct/10 px-3 py-2 text-sm text-correct">
          {notice}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-surface-border bg-surface p-4 md:p-6">
        <h2 className="mb-3 text-sm font-medium text-text/60">Thêm bài đọc mới</h2>
        <PassageForm action={createPassage} submitLabel="Lưu bài đọc" pendingLabel="Đang lưu…" />
      </div>

      <h2 className="mt-8 mb-2 text-sm font-medium text-text/60">
        Đã có {passages.length} bài đọc
      </h2>

      {passages.length === 0 ? (
        <p className="text-text/60">Chưa có bài đọc nào. Thêm bài đầu tiên ở ô phía trên.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {passages.map((passage) => (
            <li key={passage.id}>
              <Link
                href={`/passages/${passage.id}`}
                className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface p-4 hover:border-ink/30 hover:bg-ink/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-text">{passage.title}</p>
                  {/* Vài chữ đầu của đoạn văn để nhận ra ngay, không phải mở ra xem */}
                  <p className="mt-1 truncate text-sm text-text/60">{passage.content}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm text-text/60">
                    {passage.question_count === 0
                      ? "Chưa có câu hỏi"
                      : `${passage.question_count} câu hỏi`}
                  </span>
                  <span className="text-sm font-medium text-ink">Sửa →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </NotebookPage>
  );
}
