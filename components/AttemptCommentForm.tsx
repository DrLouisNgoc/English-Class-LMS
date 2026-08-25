"use client";

// "use client": cần useState để giữ chữ thầy đang gõ và useTransition để hiện
// "Đang lưu…" — cả hai chỉ chạy được trong trình duyệt. Gọi thẳng server
// action thay vì dùng <form action={...}> vì cần hiện lại thông báo "Đã lưu"
// ngay tại chỗ, không tải lại trang. Cách viết giống RemoveStudentButton.tsx.

import { useState, useTransition } from "react";
import { saveAttemptComment } from "@/lib/actions/attempts";

type Props = {
  attemptId: string;
  classId: string;
  initialComment: string | null;
};

export default function AttemptCommentForm({ attemptId, classId, initialComment }: Props) {
  const [comment, setComment] = useState(initialComment ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await saveAttemptComment(attemptId, classId, comment);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage(comment.trim() === "" ? "Đã xoá lời phê." : "Đã lưu lời phê.");
      }
    });
  }

  return (
    <div className="mt-8 rounded-xl border border-surface-border bg-surface p-4 md:p-6">
      <label htmlFor="comment" className="text-sm font-medium text-text">
        Lời phê của thầy
      </label>
      <p className="mt-1 mb-2 text-sm text-text/60">
        Không bắt buộc. Học sinh sẽ thấy lời phê này ở trang kết quả của em.
      </p>

      <textarea
        id="comment"
        rows={4}
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Em làm tốt phần thì quá khứ. Chú ý thêm phần giới từ nhé."
        className="w-full rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="rounded-full bg-ink px-4 py-2 text-sm text-white hover:bg-ink-dark disabled:opacity-40"
        >
          {isPending ? "Đang lưu…" : "Lưu lời phê"}
        </button>

        {message && <span className="text-sm text-correct">{message}</span>}
        {error && <span className="text-sm text-red-pen">{error}</span>}
      </div>
    </div>
  );
}
