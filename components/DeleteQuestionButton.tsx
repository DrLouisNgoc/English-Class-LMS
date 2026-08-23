"use client";

// "use client": cần window.confirm() và useTransition — chỉ chạy được trong
// trình duyệt. Gọi thẳng server action (không qua <form>) vì cần hỏi xác nhận
// trước, giống cách RemoveStudentButton.tsx đang làm.

import { useTransition } from "react";
import { deleteQuestion } from "@/lib/actions/questions";

type Props = {
  questionId: string;
};

export default function DeleteQuestionButton({ questionId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      "Xoá câu hỏi này? Nếu câu đã được giao trong bài tập nào đó thì sẽ chuyển sang ẩn thay vì xoá, để không hỏng bài cũ của học sinh.",
    );
    if (!confirmed) return;

    startTransition(() => {
      deleteQuestion(questionId);
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="rounded-full border border-red-pen/30 bg-white px-4 py-2.5 text-sm font-medium text-red-pen hover:border-red-pen/50 disabled:opacity-40"
    >
      {isPending ? "Đang xoá…" : "Xoá câu hỏi"}
    </button>
  );
}
