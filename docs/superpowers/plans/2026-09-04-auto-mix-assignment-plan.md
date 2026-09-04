# Trộn đề tự động — kế hoạch thi công

> **Cho agent thi công:** dùng skill `superpowers:subagent-driven-development`
> (khuyến nghị) hoặc `superpowers:executing-plans` để làm từng nhiệm vụ theo
> checkbox (`- [ ]`) trong file này.

**Mục tiêu:** Thêm nút "Trộn đề tự động" ở trang giao bài — GV chọn khối +
mẫu đề (BTVN 25 câu / Kiểm tra 40 câu), hệ thống tự random câu theo đúng
composition 12 dạng bài trong `docs/superpowers/specs/2026-09-03-auto-mix-assignment-design.md`,
tránh lặp câu đã giao cho lớp trong 30 ngày, GV bỏ tích câu không ưng rồi tạo
bài giao qua đúng `createAssignment` đã có.

**Kiến trúc:** 3 file mới thuần đọc (hằng số → query Supabase chỉ đọc → trang
Server Component) + 1 dòng sửa nhỏ ở trang `/assign` hiện có để thêm link.
Không thêm bảng, không thêm migration, không sửa `createAssignment`.

**Tech Stack:** Next.js Server Components, Supabase JS client
(`lib/supabase/server.ts`), TypeScript. Repo này **không có test tự động** —
quy ước đã chốt trong `docs/TASKS.md` (26/8) là kiểm tra bằng
`npx tsc --noEmit` (không chạy `npm run build` khi `npm run dev` đang bật) +
bấm thử tay trên trình duyệt. Mỗi bước "test" dưới đây dùng đúng quy ước này
thay vì framework test.

---

## File sẽ đụng tới

1. **Tạo** `lib/mixTemplates.ts` — 12 dòng composition, hằng số thuần, không
   gọi Supabase.
2. **Tạo** `lib/queries/questionMix.ts` — hàm `pickMixedQuestions()`, chỉ đọc.
3. **Tạo** `app/(teacher)/classes/[id]/assign/auto/page.tsx` — trang mới.
4. **Sửa** `app/(teacher)/classes/[id]/assign/page.tsx` — thêm 1 dòng link.

Đúng giới hạn 4 file/nhiệm vụ trong `CLAUDE.md`.

---

## Mã kỹ năng thật dùng trong composition

Đối chiếu `supabase/seed.sql` + `supabase/migrations/0005_more_skill_tags.sql`
+ `0006_add_sentence_building_skill_tag.sql` (đây là mã CODE thật đang có
trong database, không phải đoán):

| # | Dạng bài | `match` |
| - | -------- | ------- |
| 1 | Ngữ âm — phát âm | `codes: ["pho.pronunciation"]` |
| 2 | Ngữ âm — trọng âm | `codes: ["pho.stress"]` |
| 3 | Ngữ pháp | `prefix: "gra.", exclude: ["gra.error_identification"]` |
| 4 | Từ vựng | `codes: ["voc.vocabulary", "voc.collocation", "voc.phrasal_verb"]` |
| 5 | Giao tiếp | `codes: ["com.functional_language"]` |
| 6 | Tìm lỗi sai | `codes: ["gra.error_identification"]` |
| 7 | Đồng nghĩa/trái nghĩa | `codes: ["voc.synonym_antonym"]` |
| 8 | Điền từ đoạn văn | `codes: ["read.vocab_in_context"]` |
| 9 | Đọc hiểu | `prefix: "read.", exclude: ["read.vocab_in_context"]` |
| 10 | Sắp xếp câu | `codes: ["wri.sentence_ordering"]` |
| 11 | Viết lại câu | `codes: ["wri.sentence_transformation"]` |
| 12 | Viết câu từ gợi ý | `codes: ["wri.sentence_building"]` |

Số câu mỗi dòng (BTVN/Kiểm tra): 1/2, 1/2, 6/10, 5/8, 2/3, 1/2, 1/2, 2/3, 3/5,
1/1, 1/1, 1/1 — tổng 25/40, khớp đúng bảng mục 3 của spec.

---

### Task 1: `lib/mixTemplates.ts`

**Files:**
- Create: `lib/mixTemplates.ts`

- [ ] **Bước 1: Viết file hằng số**

```ts
// Hằng số mô tả 2 mẫu đề trộn tự động (BTVN, Kiểm tra) — cố định trong code,
// không phải form GV tự nhập. Xem lý do trong
// docs/superpowers/specs/2026-09-03-auto-mix-assignment-design.md mục 2.
//
// File này KHÔNG gọi Supabase — chỉ hằng số thuần, để dùng được cả ở server
// (lib/queries/questionMix.ts) lẫn sau này nếu cần hiện ở màn hình trình duyệt.

export type MixTemplateKey = "btvn" | "kiemtra";

export type MixRow = {
  // Dùng làm key React + nhãn hiển thị debug, KHÔNG phải mã skill_tags.code.
  code: string;
  label: string;
  // Cách khớp với skill_tags.code: "codes" là danh sách khớp đúng, hoặc
  // "prefix" + "exclude" (dùng riêng cho Ngữ pháp và Đọc hiểu — khớp cả
  // nhóm trừ 1 mã con).
  match: { codes?: string[]; prefix?: string; exclude?: string[] };
  counts: Record<MixTemplateKey, number>;
};

export const MIX_TEMPLATE_ROWS: MixRow[] = [
  {
    code: "pho.pronunciation",
    label: "Ngữ âm — phát âm",
    match: { codes: ["pho.pronunciation"] },
    counts: { btvn: 1, kiemtra: 2 },
  },
  {
    code: "pho.stress",
    label: "Ngữ âm — trọng âm",
    match: { codes: ["pho.stress"] },
    counts: { btvn: 1, kiemtra: 2 },
  },
  {
    code: "gra",
    label: "Ngữ pháp",
    match: { prefix: "gra.", exclude: ["gra.error_identification"] },
    counts: { btvn: 6, kiemtra: 10 },
  },
  {
    code: "voc.vocabulary",
    label: "Từ vựng",
    match: { codes: ["voc.vocabulary", "voc.collocation", "voc.phrasal_verb"] },
    counts: { btvn: 5, kiemtra: 8 },
  },
  {
    code: "com.functional_language",
    label: "Giao tiếp",
    match: { codes: ["com.functional_language"] },
    counts: { btvn: 2, kiemtra: 3 },
  },
  {
    code: "gra.error_identification",
    label: "Tìm lỗi sai",
    match: { codes: ["gra.error_identification"] },
    counts: { btvn: 1, kiemtra: 2 },
  },
  {
    code: "voc.synonym_antonym",
    label: "Đồng nghĩa / trái nghĩa",
    match: { codes: ["voc.synonym_antonym"] },
    counts: { btvn: 1, kiemtra: 2 },
  },
  {
    code: "read.vocab_in_context",
    label: "Điền từ đoạn văn",
    match: { codes: ["read.vocab_in_context"] },
    counts: { btvn: 2, kiemtra: 3 },
  },
  {
    code: "read",
    label: "Đọc hiểu",
    match: { prefix: "read.", exclude: ["read.vocab_in_context"] },
    counts: { btvn: 3, kiemtra: 5 },
  },
  {
    code: "wri.sentence_ordering",
    label: "Sắp xếp câu",
    match: { codes: ["wri.sentence_ordering"] },
    counts: { btvn: 1, kiemtra: 1 },
  },
  {
    code: "wri.sentence_transformation",
    label: "Viết lại câu",
    match: { codes: ["wri.sentence_transformation"] },
    counts: { btvn: 1, kiemtra: 1 },
  },
  {
    code: "wri.sentence_building",
    label: "Viết câu từ gợi ý",
    match: { codes: ["wri.sentence_building"] },
    counts: { btvn: 1, kiemtra: 1 },
  },
];
```

- [ ] **Bước 2: Kiểm tra kiểu**

Chạy: `npx tsc --noEmit`
Kỳ vọng: không có lỗi liên quan `lib/mixTemplates.ts`.

- [ ] **Bước 3: Commit**

```bash
git add lib/mixTemplates.ts
git commit -m "feat: them hang so mau de tron tu dong (BTVN/Kiem tra)"
```

---

### Task 2: `lib/queries/questionMix.ts`

**Files:**
- Create: `lib/queries/questionMix.ts`

- [ ] **Bước 1: Viết hàm `pickMixedQuestions`**

```ts
import { createServerClient } from "@/lib/supabase/server";
import { MIX_TEMPLATE_ROWS, type MixRow, type MixTemplateKey } from "@/lib/mixTemplates";

export type PickableQuestion = {
  id: string;
  kind: string;
  grade: number;
  difficulty: string;
  content: string;
};

export type MixedRow = {
  code: string;
  label: string;
  requested: number;
  picked: PickableQuestion[];
  // Trong "picked", bao nhiêu câu là "dùng lại" vì lớp đã làm hết câu mới ở
  // dạng này trong 30 ngày qua.
  reusedCount: number;
};

const RECENT_DAYS = 30;
const DIFFICULTIES = ["DE", "TB", "KHO"] as const;

// Chia n câu theo tỉ lệ cố định 30/50/20 Dễ/TB/Khó. Phần dư dồn về TB vì đó
// là mức chiếm tỉ lệ lớn nhất — xem mục 3 của spec thiết kế.
function splitByDifficulty(n: number): Record<(typeof DIFFICULTIES)[number], number> {
  const de = Math.round(n * 0.3);
  const kho = Math.round(n * 0.2);
  const tb = n - de - kho;
  return { DE: de, TB: tb, KHO: kho };
}

// Trộn ngẫu nhiên một mảng — đủ dùng cho danh sách vài chục tới vài trăm
// câu, không cần thuật toán phức tạp hơn.
function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

type SupabaseClient = ReturnType<typeof createServerClient>;

// Đọc id của các skill_tags khớp một dòng composition (theo "codes" hoặc
// "prefix" + "exclude").
async function getSkillTagIdsForRow(supabase: SupabaseClient, row: MixRow): Promise<string[]> {
  let query = supabase.from("skill_tags").select("id, code");

  if (row.match.codes) {
    query = query.in("code", row.match.codes);
  } else if (row.match.prefix) {
    query = query.like("code", `${row.match.prefix}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Không đọc được kỹ năng khớp "${row.label}": ${error.message}`);
  }

  const excluded = new Set(row.match.exclude ?? []);
  return data.filter((tag) => !excluded.has(tag.code)).map((tag) => tag.id);
}

// Đọc id các câu hỏi đã xuất hiện trong bài giao cho LỚP NÀY trong
// RECENT_DAYS ngày gần nhất — dùng để tránh lặp câu (mục 2 của spec).
async function getRecentlyAssignedQuestionIds(
  supabase: SupabaseClient,
  classId: string,
): Promise<Set<string>> {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_DAYS);

  const { data: recentAssignments, error: assignError } = await supabase
    .from("assignments")
    .select("id")
    .eq("class_id", classId)
    .gte("created_at", since.toISOString());

  if (assignError) {
    throw new Error(`Không đọc được bài đã giao gần đây: ${assignError.message}`);
  }

  const assignmentIds = recentAssignments.map((a) => a.id);
  if (assignmentIds.length === 0) {
    return new Set();
  }

  const { data: rows, error: linkError } = await supabase
    .from("assignment_questions")
    .select("question_id")
    .in("assignment_id", assignmentIds);

  if (linkError) {
    throw new Error(`Không đọc được câu đã giao gần đây: ${linkError.message}`);
  }

  return new Set(rows.map((r) => r.question_id));
}

// Đọc toàn bộ câu ĐÃ DUYỆT, đúng khối, mang một trong các skill_tag_ids này.
async function getCandidateQuestions(
  supabase: SupabaseClient,
  grade: number,
  skillTagIds: string[],
): Promise<PickableQuestion[]> {
  if (skillTagIds.length === 0) {
    return [];
  }

  const { data: tagRows, error: tagError } = await supabase
    .from("question_tags")
    .select("question_id")
    .in("skill_tag_id", skillTagIds);

  if (tagError) {
    throw new Error(`Không lọc được câu theo kỹ năng: ${tagError.message}`);
  }

  const questionIds = [...new Set(tagRows.map((t) => t.question_id))];
  if (questionIds.length === 0) {
    return [];
  }

  const { data: questions, error: questionError } = await supabase
    .from("questions")
    .select("id, kind, grade, difficulty, content")
    .eq("grade", grade)
    .eq("status", "da_duyet")
    .in("id", questionIds);

  if (questionError) {
    throw new Error(`Không đọc được câu hỏi: ${questionError.message}`);
  }

  return questions;
}

// Trộn đề tự động: với mỗi dòng composition trong MIX_TEMPLATE_ROWS, chọn
// ngẫu nhiên đúng số câu theo tỉ lệ độ khó 30/50/20, ưu tiên câu chưa giao
// cho lớp này trong 30 ngày qua. Xem thuật toán đầy đủ ở mục 4 của spec.
export async function pickMixedQuestions(
  grade: number,
  template: MixTemplateKey,
  classId: string,
): Promise<MixedRow[]> {
  const supabase = createServerClient();
  const excludedRecentIds = await getRecentlyAssignedQuestionIds(supabase, classId);
  // Câu đã được một dòng trước đó chọn rồi thì dòng sau không được chọn lại
  // — tích luỹ suốt hàm, không reset giữa các dòng.
  const alreadyPickedIds = new Set<string>();

  const result: MixedRow[] = [];

  for (const row of MIX_TEMPLATE_ROWS) {
    const skillTagIds = await getSkillTagIdsForRow(supabase, row);
    const candidates = await getCandidateQuestions(supabase, grade, skillTagIds);

    const requested = row.counts[template];
    const targetByDifficulty = splitByDifficulty(requested);

    const picked: PickableQuestion[] = [];
    let reusedCount = 0;

    for (const difficulty of DIFFICULTIES) {
      const need = targetByDifficulty[difficulty];
      if (need === 0) continue;

      const pool = candidates.filter(
        (q) => q.difficulty === difficulty && !alreadyPickedIds.has(q.id),
      );

      // Ưu tiên câu KHÔNG nằm trong danh sách đã giao gần đây.
      const freshChosen = shuffle(pool.filter((q) => !excludedRecentIds.has(q.id))).slice(
        0,
        need,
      );

      let chosen = freshChosen;

      // Không đủ câu mới → lấy nốt trong số câu đã giao gần đây (đếm vào
      // reusedCount) — vẫn loại alreadyPickedIds như bước trên.
      if (chosen.length < need) {
        const chosenIds = new Set(chosen.map((q) => q.id));
        const reusePool = shuffle(
          pool.filter((q) => excludedRecentIds.has(q.id) && !chosenIds.has(q.id)),
        );
        const extra = reusePool.slice(0, need - chosen.length);
        reusedCount += extra.length;
        chosen = [...chosen, ...extra];
      }

      for (const q of chosen) {
        alreadyPickedIds.add(q.id);
      }
      picked.push(...chosen);
    }

    result.push({ code: row.code, label: row.label, requested, picked, reusedCount });
  }

  return result;
}
```

- [ ] **Bước 2: Kiểm tra kiểu**

Chạy: `npx tsc --noEmit`
Kỳ vọng: không có lỗi liên quan `lib/queries/questionMix.ts`.

- [ ] **Bước 3: Commit**

```bash
git add lib/queries/questionMix.ts
git commit -m "feat: them pickMixedQuestions - chon cau random theo mau de"
```

---

### Task 3: `app/(teacher)/classes/[id]/assign/auto/page.tsx`

**Files:**
- Create: `app/(teacher)/classes/[id]/assign/auto/page.tsx`

- [ ] **Bước 1: Viết trang**

```tsx
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
```

- [ ] **Bước 2: Kiểm tra kiểu**

Chạy: `npx tsc --noEmit`
Kỳ vọng: không có lỗi liên quan file trên.

- [ ] **Bước 3: Chạy thử tay (`npm run dev`, mở trình duyệt)**

Theo đúng mục 7 của spec thiết kế:

1. Vào `/classes/[id]/assign/auto` với một lớp khối 9 — kiểm tra hiện đúng 25
   câu (mẫu BTVN mặc định), đúng khối 9, đủ 12 dòng dạng bài.
2. Đổi mẫu sang "Kiểm tra" (bấm "Đổi") — kiểm tra ra 40 câu.
3. Bấm "🎲 Trộn lại" vài lần — danh sách câu phải đổi (không phải lúc nào
   cũng giống hệt lần trước).
4. Bỏ tích vài câu, bấm "Tạo bài giao" — vào `/classes/[id]` kiểm tra bài mới
   xuất hiện, đúng số câu đã tích (không phải số câu ban đầu).
5. Giao 2 lần liên tiếp cho cùng 1 lớp cùng khối — lần 2 phải KHÔNG trùng câu
   với lần 1 (trừ khi ngân hàng thật sự không đủ, lúc đó phải thấy cảnh báo
   màu vàng "phải dùng lại").
6. Thử một khối/mẫu mà một dạng bài nào đó mỏng câu để xem cảnh báo đỏ
   "thiếu câu" hiện đúng không — nếu không tạo được tình huống thật, tạm thời
   sửa một `counts` trong `lib/mixTemplates.ts` lên số rất lớn để ép ra tình
   huống thiếu, xem xong đổi lại rồi bỏ thay đổi tạm đó (không commit).

- [ ] **Bước 4: Commit**

```bash
git add "app/(teacher)/classes/[id]/assign/auto/page.tsx"
git commit -m "feat: them trang /assign/auto - giao dien tron de tu dong"
```

---

### Task 4: Sửa `app/(teacher)/classes/[id]/assign/page.tsx`

**Files:**
- Modify: `app/(teacher)/classes/[id]/assign/page.tsx:86`

- [ ] **Bước 1: Thêm link "Trộn đề tự động" ngay dưới tiêu đề**

Tìm dòng:

```tsx
      <h1 className="font-display mt-2 mb-4 text-xl font-semibold text-ink">Giao bài mới</h1>
```

Đổi thành:

```tsx
      <h1 className="font-display mt-2 mb-4 text-xl font-semibold text-ink">Giao bài mới</h1>

      <Link
        href={`/classes/${id}/assign/auto`}
        className="mb-4 inline-block text-sm text-text/60 underline hover:text-ink"
      >
        🎲 Trộn đề tự động →
      </Link>
```

Không đổi gì khác ở trang này — luồng chọn tay vẫn y nguyên.

- [ ] **Bước 2: Kiểm tra kiểu**

Chạy: `npx tsc --noEmit`
Kỳ vọng: không có lỗi.

- [ ] **Bước 3: Chạy thử tay**

Vào `/classes/[id]/assign`, kiểm tra thấy link "🎲 Trộn đề tự động →" ngay
dưới tiêu đề, bấm vào phải tới đúng `/classes/[id]/assign/auto`.

- [ ] **Bước 4: Commit**

```bash
git add "app/(teacher)/classes/[id]/assign/page.tsx"
git commit -m "feat: them link Tron de tu dong o trang giao bai tay"
```

---

## Rà lại so với spec (self-review)

- **Mục 2 (quyết định brainstorm):** 2 mẫu cố định trong code ✓ (Task 1),
  30/50/20 ✓ (`splitByDifficulty`), có xem trước + tích sẵn ✓ (`defaultChecked`
  ở Task 3), tránh lặp câu 30 ngày + cảnh báo ✓ (`getRecentlyAssignedQuestionIds`
  + `reusedCount`).
- **Mục 3 (composition 12 dòng):** đối chiếu đúng mã `skill_tags.code` thật
  trong database (seed.sql + migrations 0005/0006), tổng đúng 25/40.
- **Mục 4 (kiến trúc 3 file):** đúng 3 file mới, không thêm bảng, không sửa
  `createAssignment`.
- **Mục 5 (luồng dữ liệu):** khớp — GET `/assign/auto` → `pickMixedQuestions`
  → render tích sẵn → submit thẳng vào `createAssignment` có sẵn.
- **Mục 6 (lỗi/biên):** khối sai → về `klass.grade` ✓; `template` sai → về
  `btvn` ✓; 0 câu tích → `createAssignment` tự chặn (không cần thêm) ✓; dòng
  không có câu nào khớp → `picked = []`, hiện "0/N" + cảnh báo đỏ, không throw
  ✓ (`getCandidateQuestions` trả `[]` khi `skillTagIds` rỗng thay vì lỗi).
- **Mục 7 (test tay):** đưa nguyên 6 kịch bản vào bước test của Task 3.
- **Mục 8 (không làm):** không có ô cấu hình composition qua UI, không thêm
  mẫu thứ 3, không có nút đổi tỉ lệ độ khó — đúng phạm vi.

Không phát hiện khoảng trống nào giữa spec và 4 task trên.
