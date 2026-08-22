import type { Metadata } from "next";
import { Baloo_2, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

// Baloo 2: font tiêu đề tròn, hơi giống nét chữ viết tay nắn nót của học sinh
const balooTwo = Baloo_2({
  variable: "--font-display",
  subsets: ["vietnamese"],
  weight: ["600", "700"],
});

// Be Vietnam Pro: font nội dung, hỗ trợ tốt dấu tiếng Việt
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Lớp học Tiếng Anh",
  description: "Hệ thống quản lý bài tập và lớp học tiếng Anh",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${balooTwo.variable} ${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
