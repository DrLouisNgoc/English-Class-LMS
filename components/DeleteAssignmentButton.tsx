"use client";

// "use client": cần useState/useTransition và bắt sự kiện bấm — chỉ chạy được
// trong trình duyệt. Gọi thẳng server action (không qua <form>) vì phải hỏi
// xác nhận trước, giống cách RemoveStudentButton.tsx đang làm.

import { useState, useTransition } from "react";
import { deleteAssignment } from "@/lib/actions/assignments";

type Props = {
  classId: string;
  assignmentId: string;
  title: string;
  attemptCount: number;
};

// Bắt gõ đúng chữ này khi xoá bài đã có người làm. Cố ý không dấu để gõ
// nhanh trên điện thoại.
const CONFIRM_WORD = "XOA";

export default function DeleteAssignmentButton({
  classId,
  assignmentId,
  title,
  attemptCount,
}: Props) {
  const [isPending, startTransition] = useTransition();
  // Đang mở ô xác nhận hay chưa (chỉ dùng cho bài đã có người làm).
  const [isConfirming, setIsConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const hasAttempts = attemptCount > 0;

  function runDelete() {
    startTransition(() => {
      deleteAssignment(classId, assignmentId, hasAttempts);
    });
  }

  function handleFirstClick() {
    if (hasAttempts) {
      // KHÔNG dùng window.prompt: trình duyệt chặn hàm này ("prompt() is not
      // supported"), nên phải tự làm ô nhập ngay trong trang.
      setIsConfirming(true);
      return;
    }

    // Chưa ai làm thì không mất gì, hỏi một câu là đủ. window.confirm vẫn
    // chạy bình thường (nút "Xoá khỏi lớp" đang dùng).
    const confirmed = window.confirm(
      `Xoá bài "${title}"? Chưa em nào làm bài này nên không mất điểm của ai.`,
    );
    if (confirmed) {
      runDelete();
    }
  }

  // Ô xác nhận cho hành động DUY NHẤT trong app làm mất điểm của học sinh.
  // Bắt gõ đúng một từ chứ không chỉ bấm một cái: bấm nhầm thì dễ, gõ nhầm
  // trọn một từ thì gần như không xảy ra.
  if (isConfirming) {
    return (
      // w-full: ô này phải chiếm trọn chiều ngang và xuống hàng riêng, không
      // chen cùng hàng với tên bài (sẽ bóp tên bài thành cột hẹp và làm chữ
      // cảnh báo tràn ra ngoài mép). Thẻ <li> ở trang lớp có "flex-wrap" để
      // đẩy ô này xuống dòng dưới.
      <div className="w-full rounded-xl border border-red-pen/40 bg-red-pen/5 p-3">
        <p className="text-sm font-medium text-red-pen">
          Xoá hẳn sẽ mất luôn {attemptCount} bài làm của học sinh
        </p>
        <p className="mt-1 text-sm text-text/70">
          Điểm của các em biến mất khỏi lịch sử và không xem lại được nữa, không lấy lại được. Chỉ
          nên làm khi đề bị sai.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Gõ ${CONFIRM_WORD}`}
            autoFocus
            className="w-28 rounded-lg border border-ink/30 bg-white px-3 py-1.5 text-sm text-text outline-none focus:border-ink"
          />
          <button
            type="button"
            disabled={isPending || typed.trim().toUpperCase() !== CONFIRM_WORD}
            onClick={runDelete}
            className="rounded-full bg-red-pen px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Đang xoá…" : "Xoá hẳn"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setIsConfirming(false);
              setTyped("");
            }}
            className="rounded-full border border-ink/30 bg-white px-3 py-1.5 text-sm text-text hover:border-ink disabled:opacity-40"
          >
            Huỷ
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleFirstClick}
      className="shrink-0 rounded-full border border-red-pen/30 bg-white px-3 py-1.5 text-sm font-medium text-red-pen hover:border-red-pen/50 disabled:opacity-40"
    >
      {isPending ? "Đang xoá…" : hasAttempts ? `Xoá hẳn (${attemptCount} bài làm)` : "Xoá bài"}
    </button>
  );
}
