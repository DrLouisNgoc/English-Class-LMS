import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import { getStudentSkillStats } from "@/lib/queries/students";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo học sinh đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function StudentSkillsPage() {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);

  if (!studentId) {
    redirect("/student-login");
  }

  const skills = await getStudentSkillStats(studentId);

  // Sắp theo tỉ lệ đúng giảm dần: kỹ năng làm tốt lên trên, cần luyện xuống dưới.
  const ranked = skills
    .map((skill) => ({ ...skill, percent: Math.round((skill.correct / skill.total) * 100) }))
    .sort((a, b) => b.percent - a.percent);

  const needPractice = ranked.filter((s) => s.percent < 70);

  return (
    <main className="ruled-paper mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Link
        href="/student/home"
        className="text-sm text-ink/70 underline hover:text-ink md:text-base"
      >
        ← Trang chủ
      </Link>

      <h1 className="font-display mt-2 mb-2 text-2xl font-semibold text-ink md:text-3xl">
        Kỹ năng của em
      </h1>
      <p className="mb-6 text-sm text-text/60 md:mb-10 md:text-base">
        Tính trên tất cả các bài em đã nộp.
      </p>

      {ranked.length === 0 ? (
        <p className="text-text/60 md:text-lg">
          Chưa có dữ liệu. Em làm xong một bài là bảng này hiện lên.
        </p>
      ) : (
        <>
          {needPractice.length > 0 && (
            <div className="mb-8 rounded-xl border border-gold/30 bg-gold/10 p-4 md:mb-10 md:p-6">
              <h2 className="font-display mb-1 font-semibold text-gold-dark md:text-lg">
                Nên luyện thêm
              </h2>
              <p className="text-sm text-text/70 md:text-base">
                {needPractice.map((s) => s.name_vi).join(", ")}
              </p>
            </div>
          )}

          <ul className="flex flex-col gap-4 md:gap-5">
            {ranked.map((skill) => (
              <li
                key={skill.skill_tag_id}
                className="rounded-xl border border-surface-border bg-white p-4 md:p-6"
              >
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="text-text md:text-lg md:font-medium">{skill.name_vi}</span>
                  <span className="shrink-0 text-sm text-text/60 md:text-base">
                    {skill.correct}/{skill.total} câu · {skill.percent}%
                  </span>
                </div>
                {/* Thanh biểu thị tỉ lệ đúng — xanh khi làm tốt, đỏ khi cần luyện thêm */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-rule-line md:h-2.5">
                  <div
                    className={`h-full rounded-full ${
                      skill.percent >= 70 ? "bg-correct" : "bg-red-pen"
                    }`}
                    style={{ width: `${skill.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
