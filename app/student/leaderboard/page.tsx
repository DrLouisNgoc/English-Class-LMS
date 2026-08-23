import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";
import { getClassLeaderboard } from "@/lib/queries/gamification";
import NotebookPage from "@/components/NotebookPage";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo học sinh đang đăng nhập.
export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const studentId = verifyStudentSessionValue(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);

  if (!studentId) {
    redirect("/student-login");
  }

  const leaderboard = await getClassLeaderboard(studentId);

  return (
    <NotebookPage width="narrow">
      <Link href="/student/home" className="text-sm text-text/60 underline hover:text-ink">
        ← Trang chủ
      </Link>

      <h1 className="font-display mt-2 mb-1 text-2xl font-semibold text-ink md:text-3xl">
        Bảng xếp hạng
      </h1>

      {!leaderboard ? (
        <p className="mt-4 text-text/60">Em chưa vào lớp nào nên chưa có bảng xếp hạng.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-text/60 md:text-base">
            {leaderboard.className} · {leaderboard.totalStudents} bạn
          </p>

          {/* Hạng của chính em — để ở trên cùng vì đây là thứ em quan tâm nhất */}
          <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/10 p-5 md:p-6">
            <p className="text-sm text-text/60 md:text-base">Hạng của em</p>
            <p className="font-display mt-1 text-3xl font-semibold text-gold-dark md:text-4xl">
              {leaderboard.myRank}
              <span className="text-xl text-text/50 md:text-2xl">/{leaderboard.totalStudents}</span>
            </p>
            <p className="mt-1 text-sm text-text/60 md:text-base">
              {leaderboard.myPoints} điểm tích luỹ
            </p>
          </div>

          <h2 className="mb-3 text-sm font-medium text-text/60 md:text-base">5 bạn dẫn đầu</h2>

          <ul className="flex flex-col gap-2">
            {leaderboard.top.map((row, index) => {
              const isMe = row.studentId === studentId;
              return (
                <li
                  key={row.studentId}
                  className={`flex items-center gap-3 rounded-xl border p-4 ${
                    isMe ? "border-ink/40 bg-ink/5" : "border-surface-border bg-surface"
                  }`}
                >
                  <span className="w-8 shrink-0 text-center text-xl">
                    {MEDALS[index] ?? (
                      <span className="font-display text-base text-text/50">{index + 1}</span>
                    )}
                  </span>
                  <span className="flex-1 text-text md:text-lg">
                    {row.fullName}
                    {isMe && <span className="ml-2 text-sm text-ink">(em)</span>}
                  </span>
                  <span className="font-display font-semibold text-ink md:text-lg">
                    {row.points}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 rounded-xl border border-surface-border bg-surface p-4 text-sm text-text/60">
            Điểm tích luỹ = tổng điểm các bài đã nộp, cộng thêm 10 điểm cho mỗi bài nộp trước hạn.
            Bảng này chỉ hiện tên và điểm tích luỹ, không ai xem được bài làm của em.
          </p>
        </>
      )}
    </NotebookPage>
  );
}
