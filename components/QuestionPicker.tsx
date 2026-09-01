"use client";

// Danh sách checkbox chọn câu hỏi để giao bài.
//
// TẠI SAO CẦN COMPONENT RIÊNG: nút "Lọc" ở trang cha tải lại cả trang (form
// method="get"), nên nếu chỉ vẽ checkbox thường thì mọi câu đã tick bị xoá
// sạch mỗi lần đổi bộ lọc — thầy chọn câu ở khối 6, đổi sang khối 7 để chọn
// thêm thì câu khối 6 đã chọn biến mất không dấu vết.
//
// Cách sửa: lưu danh sách question_id đã chọn vào localStorage của trình
// duyệt, khoá riêng theo từng lớp. Mỗi lần trang tải lại (kể cả sau khi đổi
// bộ lọc), component tự đọc lại danh sách đó để tick lại đúng những câu đang
// hiện, và chèn thêm ô ẩn cho những câu đã chọn nhưng bộ lọc hiện tại không
// hiện ra — nhờ vậy bấm "Tạo bài giao" vẫn gửi đủ toàn bộ câu đã chọn.

import { useEffect, useState } from "react";
import { kindLabel, difficultyLabel } from "@/lib/questionLabels";

type PickableQuestion = {
  id: string;
  kind: string;
  grade: number;
  difficulty: string;
  content: string;
};

function storageKey(classId: string): string {
  return `assign-selected-questions-${classId}`;
}

export default function QuestionPicker({
  classId,
  questions,
}: {
  classId: string;
  questions: PickableQuestion[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Chỉ đọc localStorage sau khi component đã lên trình duyệt (useEffect),
  // không đọc lúc render lần đầu — server không có localStorage. ESLint muốn
  // tránh gọi setState trong effect vì sợ render thừa, nhưng đây là trường
  // hợp bắt buộc: localStorage chỉ tồn tại ở trình duyệt, không có cách nào
  // đọc được lúc component vừa dựng lần đầu (kể cả trên server).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(classId));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds(raw ? JSON.parse(raw) : []);
    } catch {
      // localStorage có thể bị chặn (chế độ ẩn danh, cài đặt trình duyệt...).
      // Coi như chưa chọn gì (state đã mặc định là mảng rỗng), không báo lỗi
      // vì đây không phải lỗi nghiêm trọng.
    }
  }, [classId]);

  function saveSelection(next: string[]) {
    setSelectedIds(next);
    try {
      localStorage.setItem(storageKey(classId), JSON.stringify(next));
    } catch {
      // Bỏ qua nếu không lưu được — câu vẫn được tick trong phiên này.
    }
  }

  function toggle(id: string, checked: boolean) {
    saveSelection(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));
  }

  function clearAll() {
    saveSelection([]);
  }

  const visibleIds = new Set(questions.map((q) => q.id));
  // Câu đã chọn ở một bộ lọc trước đó nhưng bộ lọc hiện tại không hiện ra —
  // vẫn phải gửi lên server bằng ô ẩn, không thì mất khỏi bài giao.
  const hiddenSelectedIds = selectedIds.filter((id) => !visibleIds.has(id));

  return (
    <div>
      <div className="mb-2 flex items-center gap-3 text-sm text-text/60">
        <span>Đã chọn {selectedIds.length} câu</span>
        {selectedIds.length > 0 && (
          <button type="button" onClick={clearAll} className="underline hover:text-ink">
            Bỏ chọn tất cả
          </button>
        )}
      </div>

      {hiddenSelectedIds.map((id) => (
        <input key={id} type="hidden" name="question_id" value={id} />
      ))}

      {questions.length === 0 ? (
        <p className="text-text/60">Không có câu hỏi nào khớp bộ lọc.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-surface-border bg-surface p-4"
            >
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="question_id"
                  value={question.id}
                  checked={selectedIds.includes(question.id)}
                  onChange={(e) => toggle(question.id, e.target.checked)}
                  className="mt-1 accent-ink"
                />
                <span>
                  <span className="block text-sm text-text/60">
                    Khối {question.grade} · {difficultyLabel(question.difficulty)} ·{" "}
                    {kindLabel(question.kind)}
                  </span>
                  <span className="block text-text">{question.content}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
