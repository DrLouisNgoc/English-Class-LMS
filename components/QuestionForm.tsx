// Form nhập câu hỏi trắc nghiệm, dùng chung cho cả trang thêm mới và trang sửa.
// Không cần "use client": form gửi thẳng tới server action, mọi ô đều là thẻ
// HTML thường nên React không cần chạy gì trong trình duyệt.

import SubmitButton from "@/components/SubmitButton";
import type { SkillTag } from "@/lib/queries/questions";

const GRADES = [6, 7, 8, 9];
const DIFFICULTIES = [
  { value: "DE", label: "Dễ" },
  { value: "TB", label: "Trung bình" },
  { value: "KHO", label: "Khó" },
];
const OPTION_LABELS = ["A", "B", "C", "D"];

const inputClass =
  "w-full rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink";

export type QuestionFormValues = {
  content: string;
  options: string[];
  correctIndex: number | null;
  explanation: string | null;
  source: string | null;
  grade: number;
  difficulty: string;
  skillTagId: string | null;
  // Bài đọc hiểu mà câu này dùng chung, null nếu là câu độc lập (C2).
  passageId: string | null;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  skillTags: SkillTag[];
  submitLabel: string;
  pendingLabel: string;
  // Bỏ trống khi thêm câu mới; truyền vào khi sửa câu đã có.
  values?: QuestionFormValues;
  // Nút phụ đặt cạnh nút lưu, ví dụ nút xoá ở trang sửa.
  extraAction?: React.ReactNode;
  // Danh sách bài đọc hiểu của giáo viên, để chọn câu này thuộc bài nào (C2).
  // Mặc định rỗng: trang nào chưa truyền vào thì ô chọn không hiện ra.
  passages?: { id: string; title: string }[];
};

export default function QuestionForm({
  action,
  skillTags,
  submitLabel,
  pendingLabel,
  values,
  extraAction,
  passages = [],
}: Props) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-surface-border bg-surface p-4">
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-text">
          Nội dung câu hỏi
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={4}
          defaultValue={values?.content}
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
                defaultChecked={values?.correctIndex === index}
                aria-label={`Phương án ${label} là đáp án đúng`}
                className="size-5 shrink-0 accent-correct"
              />
              <span className="w-5 shrink-0 font-display font-semibold text-ink">{label}</span>
              <input
                type="text"
                name={`option_${index}`}
                required
                defaultValue={values?.options[index] ?? ""}
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
          defaultValue={values?.explanation ?? ""}
          placeholder='Chủ ngữ số ít nên động từ chia "goes".'
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:grid-cols-3">
        <div>
          <label htmlFor="grade" className="mb-1 block text-sm font-medium text-text">
            Khối
          </label>
          <select
            id="grade"
            name="grade"
            defaultValue={String(values?.grade ?? 9)}
            className={inputClass}
          >
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
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={values?.difficulty ?? "TB"}
            className={inputClass}
          >
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
          <select
            id="skill_tag_id"
            name="skill_tag_id"
            defaultValue={values?.skillTagId ?? ""}
            className={inputClass}
          >
            <option value="">— Chưa gắn —</option>
            {skillTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name_vi}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ô chọn bài đọc chỉ hiện khi thầy đã soạn ít nhất 1 bài đọc — chưa có
          bài nào thì hiện ô rỗng cũng chỉ làm form dài thêm vô ích. */}
      {passages.length > 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <label htmlFor="passage_id" className="mb-1 block text-sm font-medium text-text">
            Câu này thuộc bài đọc nào?{" "}
            <span className="font-normal text-text/50">(không bắt buộc)</span>
          </label>
          <select
            id="passage_id"
            name="passage_id"
            defaultValue={values?.passageId ?? ""}
            className={inputClass}
          >
            <option value="">— Câu độc lập, không thuộc bài đọc nào —</option>
            {passages.map((passage) => (
              <option key={passage.id} value={passage.id}>
                {passage.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-text/50">
            Chọn bài đọc thì lúc làm bài, học sinh thấy đoạn văn ngay phía trên câu hỏi này.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-surface-border bg-surface p-4">
        <label htmlFor="source" className="mb-1 block text-sm font-medium text-text">
          Nguồn <span className="font-normal text-text/50">(không bắt buộc)</span>
        </label>
        <input
          id="source"
          name="source"
          type="text"
          defaultValue={values?.source ?? ""}
          placeholder="Đề vào 10 Hà Nội 2026-2027"
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          pendingText={pendingLabel}
          className="rounded-full bg-ink px-5 py-2.5 text-white hover:bg-ink-dark disabled:opacity-40"
        >
          {submitLabel}
        </SubmitButton>
        {extraAction}
      </div>
    </form>
  );
}
