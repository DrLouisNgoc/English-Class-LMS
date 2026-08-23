import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getSkillTags } from "@/lib/queries/questions";
import { createQuestion } from "@/lib/actions/questions";
import SubmitButton from "@/components/SubmitButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

const GRADES = [6, 7, 8, 9];
const DIFFICULTIES = [
  { value: "DE", label: "Dễ" },
  { value: "TB", label: "Trung bình" },
  { value: "KHO", label: "Khó" },
];
const OPTION_LABELS = ["A", "B", "C", "D"];

const inputClass =
  "w-full rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink";

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
  const skillTags = await getSkillTags();

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

      <form action={createQuestion} className="flex flex-col gap-4">
        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-text">
            Nội dung câu hỏi
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={4}
            placeholder="She ______ to school every day."
            className={inputClass}
          />
          <p className="mt-1 text-xs text-text/50">
            Chỗ trống nên gõ bằng dấu gạch dưới, ví dụ: ______
          </p>
        </div>

        {/* Mỗi phương án một dòng: ô tích tròn để chọn đáp án đúng, kèm ô nhập nội dung. */}
        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-text">
            Bốn phương án — tích vào ô tròn của phương án đúng
          </p>
          <div className="flex flex-col gap-2">
            {OPTION_LABELS.map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct_index"
                  value={index}
                  required
                  aria-label={`Phương án ${label} là đáp án đúng`}
                  className="size-5 shrink-0 accent-correct"
                />
                <span className="w-5 shrink-0 font-display font-semibold text-ink">{label}</span>
                <input
                  type="text"
                  name={`option_${index}`}
                  required
                  placeholder={`Nội dung phương án ${label}`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <label htmlFor="explanation" className="mb-1 block text-sm font-medium text-text">
            Giải thích <span className="font-normal text-text/50">(học sinh xem sau khi nộp)</span>
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows={3}
            placeholder='Chủ ngữ số ít nên động từ chia "goes".'
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:grid-cols-3">
          <div>
            <label htmlFor="grade" className="mb-1 block text-sm font-medium text-text">
              Khối
            </label>
            <select id="grade" name="grade" defaultValue="9" className={inputClass}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Khối {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="mb-1 block text-sm font-medium text-text">
              Độ khó
            </label>
            <select id="difficulty" name="difficulty" defaultValue="TB" className={inputClass}>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="skill_tag_id" className="mb-1 block text-sm font-medium text-text">
              Kỹ năng
            </label>
            <select id="skill_tag_id" name="skill_tag_id" defaultValue="" className={inputClass}>
              <option value="">— Chưa gắn —</option>
              {skillTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name_vi}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <label htmlFor="source" className="mb-1 block text-sm font-medium text-text">
            Nguồn <span className="font-normal text-text/50">(không bắt buộc)</span>
          </label>
          <input
            id="source"
            name="source"
            type="text"
            placeholder="Đề vào 10 Hà Nội 2026-2027"
            className={inputClass}
          />
        </div>

        <SubmitButton
          pendingText="Đang lưu…"
          className="self-start rounded-full bg-ink px-5 py-2.5 text-white hover:bg-ink-dark disabled:opacity-40"
        >
          Lưu câu hỏi
        </SubmitButton>
      </form>
    </NotebookPage>
  );
}
