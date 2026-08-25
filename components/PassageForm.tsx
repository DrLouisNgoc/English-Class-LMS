// Form nhập bài đọc hiểu, dùng chung cho cả trang thêm mới và trang sửa.
// Không cần "use client": form gửi thẳng tới server action, mọi ô đều là thẻ
// HTML thường nên React không cần chạy gì trong trình duyệt. Giống QuestionForm.

import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  // Bỏ trống khi thêm bài đọc mới; truyền vào khi sửa bài đã có.
  values?: { title: string; content: string };
};

export default function PassageForm({ action, submitLabel, pendingLabel, values }: Props) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-text">
          Tên bài đọc
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={values?.title}
          placeholder="Đoạn văn về ô nhiễm không khí (đề thi vào 10 Hà Nội 2024)"
          className={inputClass}
        />
        <p className="text-xs text-text/50">
          Chỉ thầy nhìn thấy tên này, để tìm lại bài đọc khi soạn câu hỏi. Học sinh không thấy.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-sm font-medium text-text">
          Nội dung đoạn văn
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={14}
          maxLength={10000}
          defaultValue={values?.content}
          placeholder="Dán nguyên đoạn văn tiếng Anh vào đây. Xuống dòng thế nào thì học sinh thấy y như vậy."
          className={`${inputClass} leading-relaxed`}
        />
        <p className="text-xs text-text/50">
          Đây là phần học sinh sẽ đọc. Chỗ xuống dòng được giữ nguyên.
        </p>
      </div>

      <SubmitButton
        pendingText={pendingLabel}
        className="self-start rounded-full bg-ink px-4 py-2 text-white hover:bg-ink-dark disabled:opacity-40"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
