import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getPassageById } from "@/lib/queries/passages";
import { updatePassage, deletePassage } from "@/lib/actions/passages";
import PassageForm from "@/components/PassageForm";
import SubmitButton from "@/components/SubmitButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function EditPassagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id } = await params;
  const { error } = await searchParams;

  // Trả null nếu bài đọc không tồn tại hoặc của giáo viên khác — cả hai đều
  // đưa về danh sách thay vì hiện trang trống.
  const passage = await getPassageById(id, teacherId);
  if (!passage) {
    redirect("/passages");
  }

  // .bind gắn sẵn id vào server action, để form chỉ cần gửi các ô nhập.
  const updateWithId = updatePassage.bind(null, id);
  const deleteWithId = deletePassage.bind(null, id);

  return (
    <NotebookPage width="narrow">
      <Link href="/passages" className="text-sm text-text/60 underline hover:text-ink">
        ← Bài đọc hiểu
      </Link>

      <h1 className="font-display mt-2 mb-1 text-xl font-semibold text-ink md:text-2xl">
        Sửa bài đọc
      </h1>
      <p className="mb-4 text-sm text-text/60">
        {passage.question_count === 0
          ? "Chưa có câu hỏi nào dùng bài đọc này."
          : `Đang có ${passage.question_count} câu hỏi dùng bài đọc này — sửa xong thì cả ${passage.question_count} câu cùng đổi theo.`}
      </p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      <PassageForm
        action={updateWithId}
        submitLabel="Lưu thay đổi"
        pendingLabel="Đang lưu…"
        values={{ title: passage.title, content: passage.content }}
      />

      {/* Nút xoá tách hẳn khỏi nút Lưu, đặt cuối trang trong khối viền đỏ —
          chưa có hộp thoại hỏi lại nên phải khó bấm nhầm hết mức có thể. */}
      <div className="mt-10 rounded-xl border border-red-pen/30 bg-red-pen/5 p-4">
        <h2 className="text-sm font-medium text-red-pen">Xoá bài đọc</h2>
        <p className="mt-1 mb-3 text-sm text-text/70">
          {passage.question_count === 0
            ? "Xoá xong là mất luôn, không lấy lại được. Hãy chắc chắn trước khi bấm."
            : `Không xoá được: còn ${passage.question_count} câu hỏi đang dùng bài đọc này. Gỡ các câu đó ra khỏi bài đọc trước đã.`}
        </p>
        <form action={deleteWithId}>
          <SubmitButton
            pendingText="Đang xoá…"
            className="rounded-full border border-red-pen/40 bg-white px-4 py-2 text-sm font-medium text-red-pen hover:border-red-pen/60 disabled:opacity-40"
          >
            Xoá bài đọc này
          </SubmitButton>
        </form>
      </div>
    </NotebookPage>
  );
}
