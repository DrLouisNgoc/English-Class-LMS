import NotebookPage from "@/components/NotebookPage";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { getFilteredQuestions, getSkillTags } from "@/lib/queries/questions";
import { createAssignment } from "@/lib/actions/assignments";
import { kindLabel, difficultyLabel } from "@/lib/questionLabels";
import SubmitButton from "@/components/SubmitButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

const DIFFICULTIES = ["DE", "TB", "KHO"];
const GRADES = [6, 7, 8, 9];

export default async function AssignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; grade?: string; difficulty?: string; skill?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id } = await params;
  const { error, grade, difficulty, skill } = await searchParams;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const skillTags = await getSkillTags();
  const questions = await getFilteredQuestions({
    grade: grade ? Number(grade) : undefined,
    difficulty: difficulty || undefined,
    skillTagId: skill || undefined,
  });

  const createAssignmentForClass = createAssignment.bind(null, id);

  return (
    <NotebookPage>
      <Link href={`/classes/${id}`} className="text-sm text-text/60 underline hover:text-ink">
        ← {klass.name}
      </Link>

      <h1 className="font-display mt-2 mb-4 text-xl font-semibold text-ink">Giao bài mới</h1>

      {/* Bộ lọc: đổi lựa chọn rồi bấm "Lọc" để tải lại trang với query string mới. */}
      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-surface-border bg-surface p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="grade" className="text-sm font-medium text-text">
            Khối
          </label>
          <select
            id="grade"
            name="grade"
            defaultValue={grade ?? ""}
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          >
            <option value="">Tất cả</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="difficulty" className="text-sm font-medium text-text">
            Độ khó
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={difficulty ?? ""}
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          >
            <option value="">Tất cả</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="skill" className="text-sm font-medium text-text">
            Kỹ năng
          </label>
          <select
            id="skill"
            name="skill"
            defaultValue={skill ?? ""}
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          >
            <option value="">Tất cả</option>
            {skillTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name_vi}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full border border-ink/30 bg-white px-4 py-2 text-ink hover:border-ink/40"
        >
          Lọc
        </button>
      </form>

      <form action={createAssignmentForClass}>
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-surface-border bg-surface p-4">
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
              className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-pen">{error}</p>}

        {questions.length === 0 ? (
          <p className="mt-4 text-text/60">Không có câu hỏi nào khớp bộ lọc.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
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

        <SubmitButton
          pendingText="Đang tạo…"
          className="mt-4 rounded-full bg-ink px-4 py-2 text-white hover:bg-ink-dark disabled:opacity-40"
        >
          Tạo bài giao
        </SubmitButton>
      </form>
    </NotebookPage>
  );
}
