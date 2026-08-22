"use client";

// "use client": component này chạy trong trình duyệt (cần state, sự kiện
// click) — khác với các trang khác trong app chỉ chạy trên server.

import { useState, useTransition } from "react";
import type { AssignmentQuestion } from "@/lib/queries/assignments";
import { saveAnswer, submitAttempt } from "@/lib/actions/attempts";

type Props = {
  assignmentId: string;
  attemptId: string;
  assignmentTitle: string;
  questions: AssignmentQuestion[];
  initialAnswers: Record<string, string>;
};

export default function AssignmentRunner({
  assignmentId,
  attemptId,
  assignmentTitle,
  questions,
  initialAnswers,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [isSaving, startTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();

  const question = questions[currentIndex];
  const total = questions.length;
  const progressPercent = total === 0 ? 0 : Math.round(((currentIndex + 1) / total) * 100);

  function handleAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    startTransition(() => {
      saveAnswer(attemptId, question.id, value);
    });
  }

  function handleSubmit() {
    if (!window.confirm("Nộp bài? Sau khi nộp sẽ không sửa được câu trả lời nữa.")) {
      return;
    }
    startSubmitTransition(() => {
      submitAttempt(assignmentId, attemptId);
    });
  }

  if (!question) {
    return (
      <main className="ruled-paper mx-auto max-w-sm px-4 py-10">
        <p className="text-text/60">Bài này chưa có câu hỏi nào.</p>
      </main>
    );
  }

  return (
    <main className="ruled-paper mx-auto max-w-sm px-4 py-10">
      <div className="flex overflow-hidden rounded-2xl border border-rule-line bg-white shadow-sm">
        {/* Lề đỏ dọc: mực tím tô dần xuống theo tiến độ làm bài, thay cho
            thanh progress ngang — giống lề vở học sinh thật */}
        <div className="relative w-6 shrink-0 bg-paper">
          <div className="absolute inset-y-0 left-4 w-px bg-red-pen/40" />
          <div
            className="absolute left-4 top-0 w-px bg-ink transition-all"
            style={{ height: `${progressPercent}%` }}
          />
          <div className="absolute left-1.5 top-4 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-rule-line" />
            ))}
          </div>
        </div>

        <div className="flex-1 px-5 py-6">
          <h1 className="font-display text-xl font-semibold text-ink">{assignmentTitle}</h1>

          <div className="mt-3 mb-4 flex items-center justify-between text-sm text-text/60">
            <span>
              Câu {currentIndex + 1}/{total}
            </span>
            {isSaving && <span>Đang lưu…</span>}
          </div>

          <p className="mb-5 text-base leading-relaxed text-text">{question.content}</p>

          {question.kind === "MCQ" && question.options ? (
            <div className="flex flex-col gap-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-full border-2 px-4 py-2.5 transition-colors ${
                      selected
                        ? "border-red-pen bg-red-pen/5 text-ink"
                        : "border-rule-line text-text hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={selected}
                      onChange={() => handleAnswer(option)}
                      className="accent-red-pen"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={answers[question.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              onBlur={(e) => handleAnswer(e.target.value)}
              className="w-full border-b-2 border-ink/30 bg-transparent px-1 py-2 text-text outline-none focus:border-ink"
              placeholder="Điền vào chỗ trống…"
            />
          )}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="rounded-full border-2 border-rule-line px-4 py-2 text-text hover:border-ink/40 disabled:opacity-40"
            >
              Trước
            </button>
            {currentIndex === total - 1 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="rounded-full bg-gold px-5 py-2 font-semibold text-ink-dark hover:bg-gold-dark disabled:opacity-40"
              >
                {isSubmitting ? "Đang nộp…" : "Nộp bài"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="rounded-full bg-ink px-5 py-2 text-white hover:bg-ink-dark"
              >
                Sau
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
