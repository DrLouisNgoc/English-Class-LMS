"use client";

// Form nhập câu hỏi, dùng chung cho cả trang thêm mới và trang sửa.
//
// Phải là "use client" từ khi có 2 dạng câu hỏi: chọn dạng thì các ô nhập
// phải ẩn/hiện ngay lập tức, mà việc đó chỉ làm được trong trình duyệt.
// Dữ liệu vẫn gửi thẳng lên server action như cũ, không đổi.

import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import DeleteQuestionButton from "@/components/DeleteQuestionButton";
import type { SkillTag } from "@/lib/queries/questions";

// Hai dạng câu hỏi app hiện chấm tự động được. Dạng thầy chấm tay (viết lại
// câu) là việc riêng, chưa làm.
const KINDS = [
  {
    value: "MCQ",
    label: "Trắc nghiệm",
    hint: "Học sinh chọn 1 trong các phương án. Để trống 2 ô cuối là thành câu Đúng/Sai.",
  },
  {
    value: "DIEN",
    label: "Điền chữ",
    hint: "Học sinh tự gõ câu trả lời. Dùng cho điền từ vào chỗ trống và sắp xếp từ thành câu.",
  },
];

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
  // "MCQ" = trắc nghiệm, "DIEN" = điền chữ.
  kind: string;
  content: string;
  options: string[];
  correctIndex: number | null;
  // Đáp án đúng dạng chữ, chỉ dùng cho câu điền chữ. Nhiều đáp án chấp nhận
  // được thì phân cách bằng dấu | (ví dụ: doesn't|does not).
  correctAnswer: string;
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
  // Id câu hỏi đang sửa. Có id thì hiện nút "Xoá câu hỏi" cạnh nút lưu; trang
  // thêm mới không truyền vào nên không có nút xoá.
  //
  // CỐ Ý nhận id (một chuỗi) chứ không nhận sẵn cái nút dựng từ trang cha:
  // trang sửa chạy trên server còn form này chạy trong trình duyệt, nên truyền
  // JSX qua ranh giới đó buộc React phải đóng gói phần tử để gửi qua mạng — và
  // lúc đóng gói nó xếp vào một mảng nội bộ rồi cảnh báo thiếu "key", dù ở đây
  // chẳng có danh sách nào. Truyền chuỗi thì không có gì phải gửi qua mạng.
  deleteQuestionId?: string;
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
  deleteQuestionId,
  passages = [],
}: Props) {
  const [kind, setKind] = useState(values?.kind ?? "MCQ");
  const isMcq = kind === "MCQ";

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-surface-border bg-surface p-4">
        <label htmlFor="kind" className="mb-1 block text-sm font-medium text-text">
          Dạng câu hỏi
        </label>
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className={inputClass}
        >
          {KINDS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-text/50">
          {KINDS.find((item) => item.value === kind)?.hint}
        </p>
      </div>

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

      {/* Trắc nghiệm: mỗi phương án một dòng, ô tròn để chọn đáp án đúng.
          Chỉ bắt buộc 2 phương án đầu — để trống 2 ô cuối là câu Đúng/Sai. */}
      {isMcq ? (
        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-text">
            Các phương án — tích vào ô tròn của phương án đúng
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
                <span className="font-display w-5 shrink-0 font-semibold text-ink">{label}</span>
                <input
                  type="text"
                  name={`option_${index}`}
                  required={index < 2}
                  defaultValue={values?.options[index] ?? ""}
                  placeholder={
                    index < 2
                      ? `Nội dung phương án ${label}`
                      : `Phương án ${label} (để trống cũng được)`
                  }
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <label htmlFor="correct_answer" className="mb-1 block text-sm font-medium text-text">
            Đáp án đúng
          </label>
          <input
            id="correct_answer"
            name="correct_answer"
            type="text"
            required
            defaultValue={values?.correctAnswer ?? ""}
            placeholder="goes"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-text/50">
            Máy chấm bỏ qua chữ hoa/thường, khoảng trắng thừa và dấu chấm cuối câu. Có nhiều cách
            trả lời đúng thì gõ hết, phân cách bằng dấu gạch đứng:{" "}
            <span className="font-mono text-ink">doesn&apos;t|does not</span>
          </p>
        </div>
      )}

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
        {deleteQuestionId && <DeleteQuestionButton questionId={deleteQuestionId} />}
      </div>
    </form>
  );
}
