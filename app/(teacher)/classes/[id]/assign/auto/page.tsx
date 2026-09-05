import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";
import { pickMixedQuestions } from "@/lib/queries/questionMix";
import { createAssignment } from "@/lib/actions/assignments";
import { kindLabel, difficultyLabel } from "@/lib/questionLabels";
import AssignmentFields from "@/components/AssignmentFields";
import SubmitButton from "@/components/SubmitButton";
import type { MixTemplateKey } from "@/lib/mixTemplates";

// Không prerender tĩnh — mỗi lần tải lại phải random lại câu, không được
// cache. Đây cũng chính là cơ chế nút "Trộn lại": link về đúng URL hiện tại,
// tải lại trang là tự random lần nữa, không cần tham số "seed" riêng.
export const dynamic = "force-dynamic";

const GRADES = [6, 7, 8, 9];
const TEMPLATE_LABELS: Record<MixTemplateKey, string> = {
  btvn: "BTVN (~25 câu)",
  kiemtra: "Kiểm tra (~40 câu)",
};

function toTemplateKey(value: string | undefined): MixTemplateKey {
  return value === "kiemtra" ? "kiemtra" : "btvn";
}

export default async function AutoMixPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ grade?: string; template?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id } = await params;
  const { grade: gradeRaw, template: templateRaw } = await searchParams;

  const klass = await getClassById(id, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  // Khối chưa chọn hoặc sai giá trị → mặc định về khối của lớp, không văng lỗi.
  const parsedGrade = Number(gradeRaw);
  const grade = GRADES.includes(parsedGrade) ? parsedGrade : klass.grade;
  const template = toTemplateKey(templateRaw);

  const rows = await pickMixedQuestions(grade, template, id);
  const createAssignmentForClass = createAssignment.bind(null, id);
  const currentMixUrl = `/classes/${id}/assign/auto?grade=${grade}&template=${template}`;

  return (
    <NotebookPage>
      <Link
        href={`/classes/${id}/assign`}
        className="text-sm text-text/60 underline hover:text-ink"
      >
        ← Giao bài mới
      </Link>

      <h1 className="font-display mt-2 mb-4 text-xl font-semibold text-ink">Trộn đề tự động</h1>

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
            defaultValue={grade}
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="template" className="text-sm font-medium text-text">
            Mẫu đề
          </label>
          <select
            id="template"
            name="template"
            defaultValue={template}
            className="rounded-lg border border-ink/30 bg-white px-3 py-2 text-text outline-none focus:border-ink"
          >
            <option value="btvn">{TEMPLATE_LABELS.btvn}</option>
            <option value="kiemtra">{TEMPLATE_LABELS.kiemtra}</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full border border-ink/30 bg-white px-4 py-2 text-ink hover:border-ink/40"
        >
          Đổi
        </button>

        <Link
          href={currentMixUrl}
          className="rounded-full border border-ink/30 bg-white px-4 py-2 text-ink hover:border-ink/40"
        >
          🎲 Trộn lại
        </Link>
      </form>

      <form action={createAssignmentForClass}>
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-surface-border bg-surface p-4">
          <AssignmentFields classId={id} freshVisit={false} />
        </div>

        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div key={row.code} className="rounded-2xl border border-surface-border bg-surface p-4">
              <h2 className="font-display text-lg font-semibold text-ink">
                {row.label} ({row.picked.length}/{row.requested})
              </h2>

              {row.reusedCount > 0 && (
                <p className="mt-1 text-sm text-amber-700">
                  ⚠ {row.reusedCount} câu phải dùng lại vì lớp đã làm hết câu mới ở dạng này trong
                  30 ngày qua.
                </p>
              )}

              {row.picked.length < row.requested && (
                <p className="mt-1 text-sm text-red-pen">
                  ⚠ Chỉ tìm được {row.picked.length}/{row.requested} câu — ngân hàng đang thiếu ở
                  tổ hợp khối/độ khó này.
                </p>
              )}

              <ul className="mt-3 flex flex-col gap-2">
                {row.picked.map((question) => (
                  <li
                    key={question.id}
                    className="rounded-xl border border-surface-border bg-white p-3"
                  >
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="question_id"
                        value={question.id}
                        defaultChecked
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
            </div>
          ))}
        </div>

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
