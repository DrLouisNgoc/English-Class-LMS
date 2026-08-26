"use client";

// "use client": trang này cần giữ trạng thái 2 bước (dán → xem trước) và chạy
// bộ tách đề ngay trong trình duyệt, nên phải là component chạy phía trình duyệt.

import { useState, useTransition } from "react";
import { parseQuestions, detectPassage, type ParsedQuestion } from "@/lib/parseQuestions";
import { createQuestionsBulk } from "@/lib/actions/questions";
import type { SkillTag } from "@/lib/queries/questions";
import { kindLabel } from "@/lib/questionLabels";

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

// Mỗi câu sau khi tách còn kèm thêm: có chọn lưu câu này không, và có thuộc
// bài đọc hiểu vừa nhận ra không (C2).
type Row = ParsedQuestion & { include: boolean; inPassage: boolean };

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
  // Bài đọc hiểu máy nhận ra được từ phần đầu đề (C2). usePassage = false
  // nghĩa là thầy bỏ qua, lưu các câu như câu độc lập bình thường.
  const [usePassage, setUsePassage] = useState(false);
  const [passageTitle, setPassageTitle] = useState("");
  const [passageContent, setPassageContent] = useState("");
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

    // Nhận ra đoạn văn thì bật sẵn và tích sẵn tất cả các câu — đề thi thật
    // thì các câu sau đoạn văn đều thuộc bài đọc đó. Thầy bỏ tích câu nào
    // không thuộc, hoặc bỏ tích cả ô "Dùng đoạn văn này" nếu máy đoán sai.
    const passage = detectPassage(text);
    setUsePassage(passage !== null);
    setPassageContent(passage ?? "");
    setPassageTitle("");

    setRows(
      parsed.map((question) => ({ ...question, include: true, inPassage: passage !== null })),
    );
  }

  function toggleInPassage(rowIndex: number) {
    setRows((current) =>
      current!.map((row, i) => (i === rowIndex ? { ...row, inPassage: !row.inPassage } : row)),
    );
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

  function setCorrectAnswer(rowIndex: number, correctAnswer: string) {
    setRows((current) =>
      current!.map((row, i) => (i === rowIndex ? { ...row, correctAnswer } : row)),
    );
  }

  // Điều kiện lưu khác nhau theo dạng câu.
  function rowProblem(row: Row): string | null {
    if (row.kind === "DIEN") {
      return row.correctAnswer?.trim()
        ? null
        : "Chưa có đáp án đúng — gõ vào ô bên dưới, hoặc bỏ tích để không lưu câu này.";
    }

    if (row.options.length < 2) {
      return `Câu này chỉ tách ra ${row.options.length} phương án, cần ít nhất 2. Bỏ tích để không lưu, hoặc quay lại sửa đoạn đã dán.`;
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

    if (usePassage && !passageTitle.trim()) {
      setError("Đặt tên cho bài đọc để sau này tìm lại (chỉ thầy nhìn thấy tên này).");
      return;
    }

    if (usePassage && !selected.some((row) => row.inPassage)) {
      setError(
        "Chưa tích câu nào thuộc bài đọc. Bỏ tích 'Dùng đoạn văn này' nếu đề không có bài đọc.",
      );
      return;
    }

    setError(null);
    startSaving(async () => {
      const result = await createQuestionsBulk(
        selected.map((row) => ({
          kind: row.kind,
          content: row.content,
          options: row.options,
          // Câu điền chữ không có phương án nào để chọn — server bỏ qua số này.
          correctIndex: row.correctIndex ?? -1,
          correctAnswer: row.correctAnswer,
          explanation: row.explanation,
          inPassage: row.inPassage,
        })),
        Number(grade),
        difficulty,
        skillTagId || null,
        usePassage ? { title: passageTitle.trim(), content: passageContent } : null,
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
            Mỗi câu cần có số thứ tự (1. hoặc Câu 1:). Câu nào có A. B. C. D. thì thành câu trắc
            nghiệm; câu nào không có phương án thì thành câu điền chữ, thầy gõ đáp án ở bước sau.
            Dòng &quot;Đáp án: B&quot; hay &quot;Đáp án: goes&quot; có sẵn trong đề sẽ được điền tự
            động.
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

          {/* Bài đọc hiểu (C2): máy chỉ đoán phần TRƯỚC câu số 1 và chỉ khi
              phần đó đủ dài. Đoán xong vẫn để thầy sửa, đổi tên, hoặc bỏ hẳn —
              máy đoán sai mà cứ lưu thì rối hơn là không đoán. */}
          {passageContent && (
            <div className="rounded-2xl border border-ink/25 bg-ink/5 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-text">
                <input
                  type="checkbox"
                  checked={usePassage}
                  onChange={() => setUsePassage(!usePassage)}
                  className="size-4 accent-ink"
                />
                Dùng đoạn văn này làm bài đọc hiểu
              </label>
              <p className="mt-1 text-xs text-text/60">
                Máy thấy một đoạn văn dài ở đầu đề. Bỏ tích nếu đó chỉ là phần hướng dẫn, không phải
                bài đọc.
              </p>

              {usePassage && (
                <div className="mt-3 flex flex-col gap-3">
                  <div>
                    <label
                      htmlFor="passage_title"
                      className="mb-1 block text-sm font-medium text-text"
                    >
                      Tên bài đọc
                    </label>
                    <input
                      id="passage_title"
                      type="text"
                      value={passageTitle}
                      onChange={(event) => setPassageTitle(event.target.value)}
                      placeholder="Đoạn văn về ô nhiễm không khí (đề vào 10 Hà Nội 2024)"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-text/50">
                      Chỉ thầy nhìn thấy tên này, để tìm lại bài đọc sau. Học sinh không thấy.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="passage_content"
                      className="mb-1 block text-sm font-medium text-text"
                    >
                      Nội dung đoạn văn
                    </label>
                    <textarea
                      id="passage_content"
                      rows={8}
                      value={passageContent}
                      onChange={(event) => setPassageContent(event.target.value)}
                      className={`${inputClass} leading-relaxed`}
                    />
                    <p className="mt-1 text-xs text-text/50">
                      Xoá bớt dòng hướng dẫn nếu máy lấy nhầm vào đây. Phần còn lại chính là thứ học
                      sinh sẽ đọc.
                    </p>
                  </div>

                  <p className="text-xs text-text/60">
                    Bên dưới, bỏ tích &quot;Thuộc bài đọc&quot; ở những câu không dùng đoạn văn này.
                  </p>
                </div>
              )}
            </div>
          )}

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
                  <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-text">
                      <input
                        type="checkbox"
                        checked={row.include}
                        onChange={() => toggleInclude(rowIndex)}
                        className="size-4 accent-ink"
                      />
                      Câu {rowIndex + 1}
                      <span className="font-normal text-text/50">({kindLabel(row.kind)})</span>
                    </label>

                    {/* Chỉ hiện khi thầy đã bật dùng đoạn văn — không thì ô này
                        chỉ làm màn xem trước rối thêm. */}
                    {usePassage && (
                      <label className="flex items-center gap-2 text-sm text-text/70">
                        <input
                          type="checkbox"
                          checked={row.inPassage}
                          onChange={() => toggleInPassage(rowIndex)}
                          className="size-4 accent-ink"
                        />
                        Thuộc bài đọc
                      </label>
                    )}
                  </div>

                  <p className="mb-3 whitespace-pre-line text-text">{row.content}</p>

                  {/* Câu điền chữ: không có phương án nào để tích, thay bằng ô
                      gõ đáp án. Đề có sẵn dòng "Đáp án: …" thì đã điền trước. */}
                  {row.kind === "DIEN" ? (
                    <div>
                      <label
                        htmlFor={`answer-${rowIndex}`}
                        className="mb-1 block text-sm font-medium text-text"
                      >
                        Đáp án đúng <span className="font-normal text-text/50">(câu điền chữ)</span>
                      </label>
                      <input
                        id={`answer-${rowIndex}`}
                        type="text"
                        value={row.correctAnswer ?? ""}
                        onChange={(event) => setCorrectAnswer(rowIndex, event.target.value)}
                        disabled={!row.include}
                        placeholder="goes"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-text/50">
                        Nhiều cách trả lời đúng thì phân cách bằng dấu gạch đứng:{" "}
                        <span className="font-mono text-ink">doesn&apos;t|does not</span>
                      </p>
                    </div>
                  ) : (
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
                  )}

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
