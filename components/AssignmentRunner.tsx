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
      <main className="mx-auto max-w-sm px-4 py-10">
        <p className="text-zinc-500">Bài này chưa có câu hỏi nào.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-lg font-semibold text-zinc-900">{assignmentTitle}</h1>

      <div className="mt-4 mb-1 flex justify-between text-sm text-zinc-500">
        <span>
          Câu {currentIndex + 1}/{total}
        </span>
        {isSaving && <span>Đang lưu…</span>}
      </div>
      <div className="mb-6 h-2 w-full rounded bg-zinc-200">
        <div
          className="h-2 rounded bg-black transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="mb-4 text-zinc-900">{question.content}</p>

      {question.kind === "MCQ" && question.options ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 rounded border border-zinc-200 p-3"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={answers[question.id] === option}
                onChange={() => handleAnswer(option)}
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={answers[question.id] ?? ""}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
          onBlur={(e) => handleAnswer(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="Nhập câu trả lời"
        />
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="rounded bg-zinc-200 px-4 py-2 text-zinc-900 hover:bg-zinc-300 disabled:opacity-40"
        >
          Trước
        </button>
        {currentIndex === total - 1 ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {isSubmitting ? "Đang nộp…" : "Nộp bài"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Sau
          </button>
        )}
      </div>
    </main>
  );
}
