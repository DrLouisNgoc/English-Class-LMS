"use client";

// "use client": component này chạy trong trình duyệt (cần state, sự kiện
// click) — khác với các trang khác trong app chỉ chạy trên server.

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AssignmentQuestion } from "@/lib/queries/assignments";
import { saveAnswer, submitAttempt } from "@/lib/actions/attempts";
import { renderUnderline } from "@/lib/renderUnderline";

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
      <main className="flex min-h-screen items-center justify-center bg-ink-dark px-4 py-10">
        <p className="rounded-2xl bg-paper px-6 py-5 text-text/60">Bài này chưa có câu hỏi nào.</p>
      </main>
    );
  }

  return (
    // Tờ giấy làm bài đặt trên mặt bàn tối màu, giống các trang khác
    <main className="flex min-h-screen items-start justify-center bg-ink-dark px-2 py-4 md:px-8 md:py-10">
      <div className="ruled-paper flex w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl md:rounded-3xl">
        {/* Lề đỏ dọc: mực tím tô dần xuống theo tiến độ làm bài, thay cho
            thanh progress ngang — giống lề vở học sinh thật */}
        <div className="relative w-6 shrink-0 bg-paper md:w-10">
          <div className="absolute inset-y-0 left-4 w-px bg-red-pen/40 md:left-7" />
          <div
            className="absolute left-4 top-0 w-px bg-ink transition-all md:left-7"
            style={{ height: `${progressPercent}%` }}
          />
          <div className="absolute left-1.5 top-4 flex flex-col gap-3 md:left-3 md:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-rule-line md:h-2 md:w-2" />
            ))}
          </div>
        </div>

        <div className="flex-1 px-5 py-6 md:px-10 md:py-9">
          {/* Lối thoát khỏi màn làm bài. Trước đây màn này không có link nào —
              em mở nhầm bài là kẹt, chỉ ra được bằng nút Back của trình duyệt.
              Đáp án đã tự lưu ngay khi chọn nên thoát ra giữa chừng là an
              toàn; nói rõ điều đó để em không sợ mất bài. */}
          <Link
            href="/student/home"
            className="text-sm text-ink/70 underline hover:text-ink md:text-base"
          >
            ← Để làm sau
          </Link>

          <h1 className="font-display mt-2 text-xl font-semibold text-ink md:text-2xl">
            {assignmentTitle}
          </h1>

          <div className="mt-3 mb-4 flex items-center justify-between text-sm text-text/60 md:mb-6 md:text-base">
            <span>
              Câu {currentIndex + 1}/{total}
            </span>
            {isSaving && <span>Đang lưu…</span>}
          </div>

          {/* Bài đọc hiểu: đoạn văn nằm ngay trên câu hỏi, lặp lại ở mọi câu
              cùng bài đọc. Cố ý lặp thay vì cho đọc một lần rồi cất đi — em
              không phải nhớ, không phải bấm ngược lại để xem. Đoạn dài thì
              cuộn trong ô, không đẩy phần chọn đáp án xuống quá xa. */}
          {question.passage_content && (
            <div className="mb-5 max-h-72 overflow-y-auto rounded-xl border border-ink/20 bg-ink/5 p-4 md:mb-8 md:max-h-96 md:p-6">
              <p className="mb-2 text-xs font-medium tracking-wide text-ink/60 uppercase">
                Đọc đoạn văn sau
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-text md:text-lg md:leading-relaxed">
                {question.passage_content}
              </p>
            </div>
          )}

          <p className="mb-5 text-base leading-relaxed text-text md:mb-8 md:text-xl md:leading-relaxed">
            {renderUnderline(question.content)}
          </p>

          {question.kind === "MCQ" && question.options ? (
            <div className="flex flex-col gap-2 md:gap-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-full border-2 px-4 py-2.5 transition-colors md:px-6 md:py-4 md:text-lg ${
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
                      className="accent-red-pen md:h-5 md:w-5"
                    />
                    {/* Chỉ đổi phần HIỂN THỊ. `key`, `checked` và `handleAnswer`
                        ở trên vẫn dùng chuỗi gốc còn nguyên dấu ngoặc — đó là
                        thứ được lưu xuống database và đem đi chấm điểm. */}
                    {renderUnderline(option)}
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
              className="w-full border-b-2 border-ink/30 bg-transparent px-1 py-2 text-text outline-none focus:border-ink md:py-3 md:text-lg"
              placeholder="Điền vào chỗ trống…"
            />
          )}

          <div className="mt-8 flex justify-between md:mt-12">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="rounded-full border-2 border-rule-line px-4 py-2 text-text hover:border-ink/40 disabled:opacity-40 md:px-7 md:py-3 md:text-lg"
            >
              Trước
            </button>
            {currentIndex === total - 1 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="rounded-full bg-gold px-5 py-2 font-semibold text-ink-dark hover:bg-gold-dark disabled:opacity-40 md:px-8 md:py-3 md:text-lg"
              >
                {isSubmitting ? "Đang nộp…" : "Nộp bài"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="rounded-full bg-ink px-5 py-2 text-white hover:bg-ink-dark md:px-8 md:py-3 md:text-lg"
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
