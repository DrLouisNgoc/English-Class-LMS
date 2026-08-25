import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getSkillTags } from "@/lib/queries/questions";
import { getPassages } from "@/lib/queries/passages";
import { createQuestion } from "@/lib/actions/questions";
import QuestionForm from "@/components/QuestionForm";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { error } = await searchParams;
  const [skillTags, passages] = await Promise.all([getSkillTags(), getPassages(teacherId)]);

  return (
    <NotebookPage width="narrow">
      <Link href="/questions" className="text-sm text-text/60 underline hover:text-ink">
        ← Ngân hàng câu hỏi
      </Link>

      <h1 className="font-display mt-2 mb-1 text-xl font-semibold text-ink md:text-2xl">
        Thêm câu hỏi trắc nghiệm
      </h1>
      <p className="mb-4 text-sm text-text/60">
        Nhập đủ 4 phương án rồi tích vào phương án đúng. Câu hỏi lưu xong dùng giao bài được ngay.
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      <QuestionForm
        action={createQuestion}
        skillTags={skillTags}
        passages={passages}
        submitLabel="Lưu câu hỏi"
        pendingLabel="Đang lưu…"
      />
    </NotebookPage>
  );
}
