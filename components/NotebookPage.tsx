// Khung "tờ giấy vở" dùng chung cho các trang bên trong app: tờ giấy đặt
// trên mặt bàn tối màu, có lỗ lò xo đục dọc mép trái và lề đỏ — giống hệt
// cách 4 trang đăng nhập đang trình bày, để cả app cùng một ngôn ngữ.

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  // "narrow" cho trang đọc (làm bài, kết quả), "wide" cho trang nhiều số liệu
  width?: "narrow" | "wide";
};

export default function NotebookPage({ children, width = "wide" }: Props) {
  return (
    <div className="min-h-screen bg-ink-dark px-2 py-4 md:px-8 md:py-10">
      <div className={`mx-auto ${width === "narrow" ? "max-w-3xl" : "max-w-5xl"}`}>
        {/* min-h: tờ giấy luôn cao ít nhất gần bằng màn hình, tránh hở mảng
            nền tối phía dưới khi nội dung còn ít */}
        <div className="ruled-paper relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl bg-paper shadow-2xl md:min-h-[calc(100vh-5rem)] md:rounded-3xl">
          {/* Lỗ lò xo đục dọc mép trái */}
          <div className="punch-holes absolute inset-y-0 left-0 w-9 md:w-14" />

          {/* Lề đỏ dọc, như vở kẻ ngang thật */}
          <div className="absolute inset-y-0 left-9 w-px bg-red-pen/35 md:left-14" />

          <div className="relative py-8 pr-4 pl-12 md:py-12 md:pr-12 md:pl-20">{children}</div>
        </div>
      </div>
    </div>
  );
}
