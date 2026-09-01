"use client";

// Ô "Tiêu đề bài" và "Hạn nộp" ở màn giao bài mới.
//
// Cùng lý do với QuestionPicker.tsx: nút "Lọc" tải lại cả trang, nên chữ
// thầy vừa gõ vào hai ô này cũng bị xoá sạch mỗi lần đổi bộ lọc giữa chừng.
// Lưu vào localStorage theo từng lớp để gõ dở vẫn còn khi trang tải lại.

import { useEffect, useState } from "react";

function storageKey(classId: string): string {
  return `assign-form-fields-${classId}`;
}

type FieldValues = { title: string; due_at: string };

const EMPTY: FieldValues = { title: "", due_at: "" };

export default function AssignmentFields({
  classId,
  freshVisit,
}: {
  classId: string;
  // true khi thầy vừa bấm "Giao bài mới" từ đầu (URL không có bộ lọc lẫn
  // lỗi) — lúc đó nên xoá tiêu đề/hạn nộp cũ, không phải lúc đổi bộ lọc hay
  // sửa lỗi giữa chừng (hai trường hợp đó vẫn cần giữ chữ thầy đã gõ).
  freshVisit: boolean;
}) {
  const [values, setValues] = useState<FieldValues>(EMPTY);

  // Chỉ đọc localStorage sau khi lên trình duyệt — lý do giống hệt
  // QuestionPicker.tsx, xem ghi chú ở đó.
  useEffect(() => {
    if (freshVisit) {
      try {
        localStorage.removeItem(storageKey(classId));
      } catch {
        // Bỏ qua nếu không xoá được.
      }
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(classId));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues(raw ? JSON.parse(raw) : EMPTY);
    } catch {
      // localStorage có thể bị chặn — coi như chưa gõ gì, không báo lỗi.
    }
  }, [classId, freshVisit]);

  function update(field: keyof FieldValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    try {
      localStorage.setItem(storageKey(classId), JSON.stringify(next));
    } catch {
      // Bỏ qua nếu không lưu được — vẫn gõ được trong phiên này.
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-text">
          Tiêu đề bài
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="BTVN tuần 4 - Bị động"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="due_at" className="text-sm font-medium text-text">
          Hạn nộp
        </label>
        <input
          id="due_at"
          name="due_at"
          type="datetime-local"
          required
          value={values.due_at}
          onChange={(e) => update("due_at", e.target.value)}
          className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
        />
      </div>
    </>
  );
}
