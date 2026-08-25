"use client";

// "use client": cần giữ trạng thái tích chọn nhiều câu hỏi và gọi server
// action ngay khi bấm nút, không phải submit form thường.

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { assignSkillToQuestions } from "@/lib/actions/questions";
import type { QuestionWithSkillTag, SkillTag } from "@/lib/queries/questions";

const inputClass =
  "w-full rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink sm:w-64";

type Props = {
  questions: QuestionWithSkillTag[];
  skillTags: SkillTag[];
};

export default function QuestionsBulkTagList({ questions, skillTags }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [skillTagId, setSkillTagId] = useState("");
  const [onlyUntagged, setOnlyUntagged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const visibleQuestions = useMemo(
    () => (onlyUntagged ? questions.filter((question) => !question.skill_tag_id) : questions),
    [questions, onlyUntagged],
  );

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAssign() {
    if (selectedIds.size === 0) {
      setError("Chưa tích câu hỏi nào.");
      return;
    }
    if (!skillTagId) {
      setError("Chưa chọn kỹ năng để gán.");
      return;
    }

    setError(null);
    startSaving(async () => {
      const result = await assignSkillToQuestions(Array.from(selectedIds), skillTagId);
      if (result?.error) {
        setError(result.error);
      } else {
        setSelectedIds(new Set());
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-surface-border bg-surface p-4">
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={onlyUntagged}
            onChange={(event) => setOnlyUntagged(event.target.checked)}
            className="size-4 accent-ink"
          />
          Chỉ hiện câu chưa gắn kỹ năng
        </label>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={skillTagId}
            onChange={(event) => setSkillTagId(event.target.value)}
            className={inputClass}
          >
            <option value="">— Chọn kỹ năng —</option>
            {skillTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name_vi}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isSaving || selectedIds.size === 0 || !skillTagId}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-dark disabled:opacity-40"
          >
            {isSaving ? "Đang gán…" : `Gán kỹ năng cho ${selectedIds.size} câu đã chọn`}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      {visibleQuestions.length === 0 ? (
        <p className="text-text/60">Không có câu hỏi nào khớp bộ lọc.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleQuestions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-surface-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <label className="flex items-start gap-2 text-sm text-text/60">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(question.id)}
                    onChange={() => toggleSelected(question.id)}
                    className="mt-0.5 size-4 shrink-0 accent-ink"
                  />
                  <span>
                    Khối {question.grade} · {question.difficulty} · {question.kind}
                    {question.status === "an" && (
                      <span className="ml-2 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold-dark">
                        Đã ẩn
                      </span>
                    )}
                    <span
                      className={`ml-2 rounded-full border px-2 py-0.5 text-xs ${
                        question.skill_tag_name
                          ? "border-correct/40 bg-correct/5 text-correct"
                          : "border-red-pen/40 bg-red-pen/5 text-red-pen"
                      }`}
                    >
                      {question.skill_tag_name ?? "Chưa gắn"}
                    </span>
                  </span>
                </label>
                <Link
                  href={`/questions/${question.id}`}
                  className="rounded-full border border-ink/30 bg-white px-3 py-1 text-sm font-medium text-ink hover:border-ink/40"
                >
                  Sửa
                </Link>
              </div>
              <p className="mt-1 pl-6 text-text">{question.content}</p>
              <p className="mt-1 pl-6 text-sm text-correct">Đáp án: {question.correct_answer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
