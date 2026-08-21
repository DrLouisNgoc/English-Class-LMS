"use client";

// "use client": cần window.confirm() và useTransition — chỉ chạy được trong
// trình duyệt. Gọi thẳng server action (không qua <form>) vì cần hỏi xác
// nhận trước, giống cách nút "Nộp bài" trong AssignmentRunner.tsx đang làm.

import { useTransition } from "react";
import { removeStudentFromClass } from "@/lib/actions/students";

type Props = {
  classId: string;
  studentId: string;
  studentName: string;
};

export default function RemoveStudentButton({ classId, studentId, studentName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Xoá ${studentName} khỏi lớp? Học sinh sẽ không đăng nhập được nữa, nhưng điểm các bài đã làm vẫn được giữ lại.`,
    );
    if (!confirmed) return;

    startTransition(() => {
      removeStudentFromClass(classId, studentId);
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="text-sm text-red-600 underline disabled:opacity-40"
    >
      {isPending ? "Đang xoá…" : "Xoá khỏi lớp"}
    </button>
  );
}
