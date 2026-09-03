# Trộn đề tự động — thiết kế

> Brainstorm 3/9/2026 qua skill `superpowers:brainstorming`. Bản thiết kế cũ
> (chốt hướng 24/8/2026) không tra lại được (chỉ nằm trong lịch sử chat, không
> ghi vào `decisions.md`, và server `claude-mem` mất kết nối lúc cần) — đây là
> thiết kế mới hoàn toàn, không dựa trên bản cũ.

## 1. Mục tiêu

Ngân hàng câu hỏi đã đạt 3.000/3.000 câu (3/9/2026, xem `QUESTION-BANK.md`).
Hiện tại giao bài (GV-1 trong `SPEC.md`) là chọn TAY từng câu ở trang
`/classes/[id]/assign`. Việc này chốt là **đích cuối cùng** của việc xây ngân
hàng: một nút để hệ thống **tự chọn ngẫu nhiên** câu khớp một "mẫu đề" cố định,
thay vì thầy phải tự lọc và tick hàng chục câu mỗi lần giao bài.

## 2. Quyết định đã chốt qua brainstorm

| Câu hỏi | Quyết định |
| --- | --- |
| Mẫu đề là gì | 2 mẫu **cố định trong code** (không phải form tự nhập), theo đúng cấu trúc 12 dạng bài đã dùng để xây ngân hàng |
| Số mẫu | 2 mẫu: **BTVN** (~25 câu, dùng hàng tuần) và **Kiểm tra** (~40 câu, dùng cho bài kiểm tra 45-60 phút) |
| Tỉ lệ độ khó | Cố định 30/50/20 (Dễ/TB/Khó) cho mọi đề, mọi mẫu — khớp tỉ lệ mục tiêu đã đặt khi xây ngân hàng |
| Xem trước | **Có** — trộn xong hiện danh sách đã tích sẵn, thầy bỏ tích/không ưng câu nào thì bỏ, rồi mới bấm "Tạo bài giao" |
| Tránh lặp câu | **Có** — loại các câu đã xuất hiện trong bài giao cho **cùng lớp này** trong 30 ngày gần nhất; nếu không đủ câu mới thì dùng lại câu cũ, có cảnh báo rõ trên trang |

## 3. Mẫu đề — composition theo dạng bài

Tính theo đúng tỉ lệ mục tiêu 12 dạng bài trong `QUESTION-BANK.md` (mục tiêu
mỗi dạng / 3.000 × số câu mỗi mẫu, làm tròn rồi cân lại cho khớp tổng):

| # | Dạng bài | Skill tag khớp | BTVN (25) | Kiểm tra (40) |
| - | -------- | --------------- | --------- | -------------- |
| 1 | Ngữ âm — phát âm | `pho.pronunciation` | 1 | 2 |
| 2 | Ngữ âm — trọng âm | `pho.stress` | 1 | 2 |
| 3 | Ngữ pháp | `gra.*` trừ `gra.error_identification` | 6 | 10 |
| 4 | Từ vựng | `voc.vocabulary`, `voc.collocation`, `voc.phrasal_verb` | 5 | 8 |
| 5 | Giao tiếp | `com.functional_language` | 2 | 3 |
| 6 | Tìm lỗi sai | `gra.error_identification` | 1 | 2 |
| 7 | Đồng nghĩa/trái nghĩa | `voc.synonym_antonym` | 1 | 2 |
| 8 | Điền từ đoạn văn | `read.vocab_in_context` | 2 | 3 |
| 9 | Đọc hiểu | `read.*` trừ `read.vocab_in_context` | 3 | 5 |
| 10 | Sắp xếp câu | `wri.sentence_ordering` | 1 | 1 |
| 11 | Viết lại câu | `wri.sentence_transformation` | 1 | 1 |
| 12 | Viết câu từ gợi ý | `wri.sentence_building` | 1 | 1 |
| | **Tổng** | | **25** | **40** |

Trong mỗi dòng, số câu chia tiếp theo 30/50/20 Dễ/TB/Khó bằng công thức làm
tròn: `de = round(n×0.3)`, `kho = round(n×0.2)`, `tb = n − de − kho` (phần dư
dồn về TB, vì TB là mức chiếm tỉ lệ lớn nhất). Với `n` nhỏ (1-2 câu), một số ô
có thể ra 0 câu Khó — chấp nhận được vì không thể chia nhỏ hơn 1 câu.

## 4. Kiến trúc

Không thêm bảng database, không sửa `createAssignment` đã có. Ba file:

### `lib/mixTemplates.ts` (mới — hằng số thuần, không gọi Supabase)

```ts
export type MixTemplateKey = "btvn" | "kiemtra";

export type MixRow = {
  code: string; // "pho.pronunciation" | dùng để hiển thị nhãn dạng bài
  label: string; // "Ngữ âm — phát âm"
  match: { codes?: string[]; prefix?: string; exclude?: string[] };
  counts: Record<MixTemplateKey, number>;
};

export const MIX_TEMPLATE_ROWS: MixRow[] = [ /* đúng 12 dòng ở bảng mục 3 */ ];
```

`match` diễn tả cách khớp `skill_tags.code`: `codes` là danh sách khớp đúng
(dùng cho hầu hết dòng), `prefix` + `exclude` dùng riêng cho "Ngữ pháp"
(`gra.*` trừ 1 mã) và "Đọc hiểu" (`read.*` trừ 1 mã).

### `lib/queries/questionMix.ts` (mới — gọi Supabase, chỉ đọc)

```ts
export type MixedRow = {
  code: string;
  label: string;
  requested: number;
  picked: PickableQuestion[]; // { id, kind, grade, difficulty, content }
  reusedCount: number; // trong picked, bao nhiêu câu là "dùng lại" (đã giao gần đây)
};

export async function pickMixedQuestions(
  grade: number,
  template: MixTemplateKey,
  classId: string,
): Promise<MixedRow[]>;
```

Thuật toán cho từng dòng trong `MIX_TEMPLATE_ROWS`:

1. Query toàn bộ câu khớp `grade` + `match` + `status = 'da_duyet'` (dùng
   `.from("questions").select(...).eq("grade", grade).in/like` theo `match`,
   join qua `question_tags`/`skill_tags` giống các query khác trong
   `lib/queries/questions.ts`). Không dùng SQL thô — đúng quy ước codebase.
2. Chia đều theo Dễ/TB/Khó (mục 3). Với mỗi độ khó: lọc tiếp danh sách ở bước 1
   theo `difficulty`, loại các `id` đã có trong `alreadyPickedIds` (tích luỹ
   suốt hàm, tránh 1 câu bị chọn 2 lần) và trong `excludedRecentIds` (câu đã
   giao cho lớp này trong 30 ngày qua — query 1 lần ở đầu hàm, dùng chung cho
   mọi dòng). Trộn ngẫu nhiên (`Array.sort(() => Math.random() - 0.5)` — đủ
   dùng cho danh sách vài chục tới vài trăm câu, không cần thuật toán phức
   tạp), lấy đúng số cần.
3. **Không đủ câu mới:** bỏ điều kiện loại `excludedRecentIds` (vẫn giữ loại
   `alreadyPickedIds`), lấy nốt cho đủ số — những câu lấy thêm ở bước này được
   đếm vào `reusedCount`.
4. **Vẫn không đủ** (ngân hàng thật sự thiếu câu ở tổ hợp grade/dạng/độ khó
   đó — hiếm, nhưng phải xử lý được): lấy hết những gì có, `picked.length` sẽ
   nhỏ hơn `requested`. Trang hiển thị sẽ tự lộ ra qua so sánh hai số này,
   không cần cờ lỗi riêng.

### `app/(teacher)/classes/[id]/assign/auto/page.tsx` (mới)

- Query string: `?grade=9&template=btvn`. Không có `grade` thì mặc định lấy
  `klass.grade` (giống ý tưởng đã ghi trong `TASKS.md` — mặc định theo khối
  lớp, vẫn cho đổi).
- Form nhỏ (method `get`) đổi khối/mẫu đề, giống form "Lọc" ở trang `/assign`.
- Gọi `pickMixedQuestions()`, hiện từng dòng dạng bài: tên dạng, số câu
  yêu cầu, danh sách câu (mỗi câu 1 checkbox `name="question_id"`, đã
  `defaultChecked`). Dòng nào có `reusedCount > 0` thì thêm dòng cảnh báo nhỏ
  màu vàng: *"N câu phải dùng lại vì lớp đã làm hết câu mới ở dạng này trong
  30 ngày qua."* Dòng nào `picked.length < requested` thì thêm cảnh báo đỏ:
  *"Chỉ tìm được N/M câu — ngân hàng đang thiếu ở tổ hợp khối/độ khó này."*
- Link **"🎲 Trộn lại"** trỏ về đúng URL hiện tại (trang là
  `dynamic = "force-dynamic"`, mỗi lần tải lại tự random lại — không cần
  tham số `seed`).
- Bên dưới: `<AssignmentFields>` (tái dùng y hệt trang `/assign`, component
  đã có sẵn) rồi nút submit. Form `action` trỏ thẳng tới
  `createAssignment.bind(null, classId)` — **không viết action mới**, vì input
  `question_id` (nhiều giá trị) đã đúng định dạng `createAssignment` đang đọc.

### Sửa nhỏ: `app/(teacher)/classes/[id]/assign/page.tsx`

Thêm 1 dòng link `"🎲 Trộn đề tự động →"` trỏ tới
`/classes/${id}/assign/auto`, đặt ngay dưới tiêu đề "Giao bài mới" — không đổi
gì khác ở trang này, luồng chọn tay vẫn y nguyên.

## 5. Luồng dữ liệu

```
GV bấm "Trộn đề tự động" trên /assign
  → /assign/auto?grade=9&template=btvn (GET, server component)
    → pickMixedQuestions(9, "btvn", classId)
       → query excludedRecentIds (1 lần)
       → với mỗi dòng trong MIX_TEMPLATE_ROWS: query + lọc + random + cắt N
    → render danh sách, tích sẵn, cảnh báo nếu có
  → GV bỏ tích vài câu không ưng, điền tiêu đề + hạn nộp
  → bấm "Tạo bài giao" (form action = createAssignment, KHÔNG đổi action này)
    → tạo assignments + assignment_questions y hệt luồng chọn tay hiện tại
  → redirect /classes/[id]
```

## 6. Xử lý lỗi / trường hợp biên

- **Khối chưa chọn hoặc sai giá trị** → mặc định về `klass.grade`, không văng lỗi.
- **`template` không hợp lệ** (không phải `btvn`/`kiemtra`) → mặc định `btvn`.
- **0 câu tích khi submit** → `createAssignment` đã tự chặn ("Vui lòng chọn ít
  nhất 1 câu hỏi"), không cần thêm logic.
- **Một dòng dạng bài không có câu nào khớp** (ví dụ khối/dạng chưa từng có
  trong ngân hàng — không nên xảy ra sau khi ngân hàng đã ĐẠT 3.000, nhưng
  code vẫn phải sống sót) → `picked = []`, hiện dòng "0/N câu" kèm cảnh báo đỏ,
  KHÔNG throw lỗi làm sập cả trang.
- **RLS/quyền:** trang mới đọc `getClassById(id, teacherId)` y hệt trang
  `/assign` hiện tại — chặn GV xem lớp không phải của mình theo đúng pattern
  đang dùng khắp app.

## 7. Kiểm thử thủ công (không có test tự động trong repo)

1. Vào `/classes/[id]/assign/auto` với một lớp khối 9 — kiểm tra hiện đúng 25
   câu (mẫu BTVN mặc định), đúng khối 9, đủ 12 dòng dạng bài.
2. Đổi mẫu sang "Kiểm tra" — kiểm tra ra 40 câu.
3. Bấm "Trộn lại" vài lần — danh sách câu phải đổi (không phải lúc nào cũng
   giống hệt lần trước).
4. Bỏ tích vài câu, bấm "Tạo bài giao" — vào `/classes/[id]` kiểm tra bài mới
   xuất hiện, đúng số câu đã tích (không phải số câu ban đầu).
5. Giao 2 lần liên tiếp cho cùng 1 lớp cùng khối — lần 2 phải **không** trùng
   câu với lần 1 (trừ khi ngân hàng thật sự không đủ, lúc đó phải thấy cảnh
   báo vàng).
6. Thử một lớp thuộc khối mà một dạng bài nào đó mỏng (ví dụ vừa tạo lớp mới)
   để xem cảnh báo đỏ "thiếu câu" có hiện đúng không — nếu không tạo được tình
   huống thật, tạm thời sửa `counts` trong `mixTemplates.ts` lên số rất lớn để
   ép ra tình huống thiếu, xem xong thì đổi lại.

## 8. Phạm vi KHÔNG làm ở đây

- Không cho giáo viên tự sửa composition qua giao diện (chỉ sửa trong code
  `lib/mixTemplates.ts`) — YAGNI, thêm màn cấu hình khi thật sự cần.
- Không thêm mẫu đề thứ 3 trở lên trong lần này.
- Không đổi tỉ lệ độ khó theo yêu cầu (không có nút "đề Dễ/đề Khó") — đã chốt
  cố định 30/50/20.
