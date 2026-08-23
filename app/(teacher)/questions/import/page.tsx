import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getSkillTags } from "@/lib/queries/questions";
import ImportQuestionsForm from "@/components/ImportQuestionsForm";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function ImportQuestionsPage() {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const skillTags = await getSkillTags();

  return (
    <NotebookPage>
      <Link href="/questions" className="text-sm text-text/60 underline hover:text-ink">
        ← Ngân hàng câu hỏi
      </Link>

      <h1 className="font-display mt-2 mb-1 text-xl font-semibold text-ink md:text-2xl">
        Dán nhiều câu một lần
      </h1>
      <p className="mb-4 text-sm text-text/60">
        Chép đề từ file Word hoặc từ web rồi dán vào đây. Xem trước, tích đáp án đúng, bấm lưu là
        xong cả lô.
      </p>

      <ImportQuestionsForm skillTags={skillTags} />
    </NotebookPage>
  );
}
