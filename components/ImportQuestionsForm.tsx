"use client";

// "use client": trang này cần giữ trạng thái 2 bước (dán → xem trước) và chạy
// bộ tách đề ngay trong trình duyệt, nên phải là component chạy phía trình duyệt.

import { useState, useTransition } from "react";
import { parseQuestions, type ParsedQuestion } from "@/lib/parseQuestions";
import { createQuestionsBulk } from "@/lib/actions/questions";
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

const PLACEHOLDER = [
  "Câu 1: She ______ to school every day.",
  "A. go",
  "B. goes",
  "C. going",
  "D. gone",
  "Đáp án: B",
  "",
  "Câu 2: ...",
].join("\n");

// Mỗi câu sau khi tách còn kèm thêm: có chọn lưu câu này không.
type Row = ParsedQuestion & { include: boolean };

type Props = {
  skillTags: SkillTag[];
};

export default function ImportQuestionsForm({ skillTags }: Props) {
  const [text, setText] = useState("");
  // null = đang ở bước 1 (chưa bấm xem trước).
  const [rows, setRows] = useState<Row[] | null>(null);
  const [grade, setGrade] = useState("9");
  const [difficulty, setDifficulty] = useState("TB");
  const [skillTagId, setSkillTagId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function handlePreview() {
    const parsed = parseQuestions(text);

    if (parsed.length === 0) {
      setError(
        "Không tách được câu hỏi nào. Kiểm tra xem mỗi câu có đánh số (1. hoặc Câu 1:) và các phương án có ghi A. B. C. D. không.",
      );
      return;
    }

    setError(null);
    setRows(parsed.map((question) => ({ ...question, include: true })));
  }

  function setCorrectIndex(rowIndex: number, correctIndex: number) {
    setRows((current) =>
      current!.map((row, i) => (i === rowIndex ? { ...row, correctIndex } : row)),
    );
  }

  function toggleInclude(rowIndex: number) {
    setRows((current) =>
      current!.map((row, i) => (i === rowIndex ? { ...row, include: !row.include } : row)),
    );
  }

  // Một câu chỉ lưu được khi có đúng 4 phương án khác nhau và đã chọn đáp án đúng.
  function rowProblem(row: Row): string | null {
    if (row.options.length !== 4) {
      return `Câu này tách ra ${row.options.length} phương án, cần đúng 4. Bỏ tích để không lưu, hoặc quay lại sửa đoạn đã dán.`;
    }
    if (new Set(row.options).size !== row.options.length) {
      return "Có hai phương án trùng nội dung — học sinh chọn đúng vẫn sẽ bị chấm sai.";
    }
    if (row.correctIndex === null) {
      return "Chưa chọn đáp án đúng.";
    }
    return null;
  }

  function handleSave() {
    const selected = rows!.filter((row) => row.include);

    if (selected.length === 0) {
      setError("Chưa chọn câu nào để lưu.");
      return;
    }

    const firstBad = selected.findIndex((row) => rowProblem(row) !== null);
    if (firstBad !== -1) {
      setError(`Còn câu chưa hợp lệ (câu được tô đỏ bên dưới). Sửa xong mới lưu được.`);
      return;
    }

    setError(null);
    startSaving(async () => {
      const result = await createQuestionsBulk(
        selected.map((row) => ({
          content: row.content,
          options: row.options,
          correctIndex: row.correctIndex!,
          explanation: row.explanation,
        })),
        Number(grade),
        difficulty,
        skillTagId || null,
      );

      // Lưu được thì server tự chuyển sang trang danh sách; chỉ khi lỗi mới trả về gì đó.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const selectedCount = rows?.filter((row) => row.include).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      {rows === null ? (
        /* BƯỚC 1 — dán đề vào */
        <div className="rounded-2xl border border-surface-border bg-surface p-4">
          <label htmlFor="paste" className="mb-1 block text-sm font-medium text-text">
            Dán cả đoạn đề vào đây
          </label>
          <textarea
            id="paste"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            placeholder={PLACEHOLDER}
            className={`${inputClass} font-mono text-sm`}
          />
          <p className="mt-2 text-xs text-text/50">
            Mỗi câu cần có số thứ tự (1. hoặc Câu 1:) và các phương án ghi A. B. C. D. Nếu trong đề
            có sẵn dòng &quot;Đáp án: B&quot; thì sẽ được điền tự động; không có thì cô tự tích ở
            bước sau.
          </p>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!text.trim()}
            className="mt-3 rounded-full bg-ink px-5 py-2.5 text-white hover:bg-ink-dark disabled:opacity-40"
          >
            Xem trước
          </button>
        </div>
      ) : (
        /* BƯỚC 2 — xem trước và chốt đáp án */
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface p-4">
            <p className="text-sm text-text">
              Tách được <strong className="text-ink">{rows.length}</strong> câu, đang chọn lưu{" "}
              <strong className="text-ink">{selectedCount}</strong> câu.
            </p>
            <button
              type="button"
              onClick={() => {
                setRows(null);
                setError(null);
              }}
              className="rounded-full border border-ink/30 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink/40"
            >
              ← Quay lại sửa đoạn đã dán
            </button>
          </div>

          {/* Cài đặt áp dụng cho cả lô, đỡ phải chọn lại từng câu */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:grid-cols-3">
            <div>
              <label htmlFor="grade" className="mb-1 block text-sm font-medium text-text">
                Khối <span className="font-normal text-text/50">(cả lô)</span>
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
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
                Độ khó <span className="font-normal text-text/50">(cả lô)</span>
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
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
              <label htmlFor="skill" className="mb-1 block text-sm font-medium text-text">
                Kỹ năng <span className="font-normal text-text/50">(cả lô)</span>
              </label>
              <select
                id="skill"
                value={skillTagId}
                onChange={(event) => setSkillTagId(event.target.value)}
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

          <ul className="flex flex-col gap-3">
            {rows.map((row, rowIndex) => {
              const problem = rowProblem(row);
              const showProblem = row.include && problem !== null;

              return (
                <li
                  key={rowIndex}
                  className={`rounded-2xl border p-4 ${
                    showProblem
                      ? "border-red-pen/50 bg-red-pen/5"
                      : "border-surface-border bg-surface"
                  } ${row.include ? "" : "opacity-50"}`}
                >
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={() => toggleInclude(rowIndex)}
                      className="size-4 accent-ink"
                    />
                    Câu {rowIndex + 1}
                  </label>

                  <p className="mb-3 whitespace-pre-line text-text">{row.content}</p>

                  <div className="flex flex-col gap-1.5">
                    {row.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name={`correct-${rowIndex}`}
                          checked={row.correctIndex === optionIndex}
                          onChange={() => setCorrectIndex(rowIndex, optionIndex)}
                          disabled={!row.include}
                          className="size-4 shrink-0 accent-correct"
                        />
                        <span className="w-4 shrink-0 font-display font-semibold text-ink">
                          {OPTION_LABELS[optionIndex] ?? optionIndex + 1}
                        </span>
                        <span className="text-text">{option}</span>
                      </label>
                    ))}
                  </div>

                  {row.explanation && (
                    <p className="mt-2 text-sm text-text/60">Giải thích: {row.explanation}</p>
                  )}

                  {showProblem && <p className="mt-2 text-sm text-red-pen">{problem}</p>}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || selectedCount === 0}
            className="self-start rounded-full bg-ink px-5 py-2.5 text-white hover:bg-ink-dark disabled:opacity-40"
          >
            {isSaving ? "Đang lưu…" : `Lưu ${selectedCount} câu vào ngân hàng`}
          </button>
        </>
      )}
    </div>
  );
}
