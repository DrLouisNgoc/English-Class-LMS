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
