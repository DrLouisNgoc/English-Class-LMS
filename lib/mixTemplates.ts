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
