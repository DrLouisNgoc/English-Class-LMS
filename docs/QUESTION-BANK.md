# QUESTION BANK — Mục tiêu 3.000 câu

## Mục tiêu

**3.000 câu hỏi**, phủ toàn bộ THCS (khối 6–9), trình độ **A1 → B1**, đủ mọi dạng
bài xuất hiện trong đề kiểm tra, và **đủ dày để trộn ra đề ngẫu nhiên** mà không
lặp câu.

Ba yêu cầu này ràng buộc lẫn nhau, không tách rời được:

- **Phủ kiến thức** — mỗi Unit trong 48 Unit của Global Success đều phải có câu
- **Phủ dạng bài** — đề kiểm tra có 12 dạng, thiếu dạng nào là không trộn nổi đề
  hoàn chỉnh dạng đó
- **Đủ dày để trộn** — một đề 40 câu; khối 9 có 900 câu thì trộn được **22 đề
  hoàn toàn không trùng câu nào**

## Vì sao là 3.000 chứ không phải 100.000

Miền kiến thức A1–B1 là hữu hạn: ~2.500 từ vựng lõi (cỡ Oxford 3000), ~80 điểm
ngữ pháp, 48 Unit, ~350 cặp âm và mẫu trọng âm đáng hỏi. Đếm ra khoảng
**2.600–4.000 câu thật sự khác nhau**. 3.000 nằm đúng giữa khoảng đó.

Vượt xa con số này thì mỗi câu phải nhân bản thành hàng chục biến thể đổi tên
riêng, đổi con số — và trộn đề ngẫu nhiên sẽ rút ra 5 câu na ná nhau trong cùng
một bài. Đó là hại chứ không phải lợi.

## Bản đồ phủ — theo dạng bài

| #   | Dạng bài                | Mục tiêu  | Skill tag                                               |
| --- | ----------------------- | --------- | ------------------------------------------------------- |
| 1   | Ngữ âm — phát âm        | 150       | `pho.pronunciation`                                     |
| 2   | Ngữ âm — trọng âm       | 150       | `pho.stress`                                            |
| 3   | Ngữ pháp (chọn đáp án)  | 750       | `gra.*`                                                 |
| 4   | Từ vựng (chọn đáp án)   | 550       | `voc.vocabulary`, `voc.collocation`, `voc.phrasal_verb` |
| 5   | Giao tiếp / tình huống  | 200       | `com.functional_language`                               |
| 6   | Tìm lỗi sai             | 150       | `gra.error_identification`                              |
| 7   | Đồng nghĩa / trái nghĩa | 150       | `voc.synonym_antonym`                                   |
| 8   | Điền từ vào đoạn văn    | 250       | `read.vocab_in_context` + `passage_id`                  |
| 9   | Đọc hiểu                | 350       | `read.*` + `passage_id`                                 |
| 10  | Sắp xếp câu thành đoạn  | 100       | `wri.sentence_ordering`                                 |
| 11  | Viết lại câu            | 100       | `wri.sentence_transformation`                           |
| 12  | Viết câu từ gợi ý       | 100       | `wri.sentence_building`                                 |
|     | **Tổng**                | **3.000** |                                                         |

## Bản đồ phủ — theo khối

| Khối | Mục tiêu | Ghi chú                      |
| ---- | -------- | ---------------------------- |
| 6    | 700      | 12 Unit                      |
| 7    | 700      | 12 Unit                      |
| 8    | 700      | 12 Unit                      |
| 9    | 900      | 12 Unit + phần ôn thi vào 10 |

## Tỉ lệ độ khó

| Mức        | Tỉ lệ | Số câu |
| ---------- | ----- | ------ |
| Dễ         | 30%   | 900    |
| Trung bình | 50%   | 1.500  |
| Khó        | 20%   | 600    |

Không có đủ câu Khó thì đề trộn ra bị phẳng, không phân loại được học sinh.

## Tiến độ (31/8/2026)

**271 / 3.000 câu — 9%**

| Khối | Có  | Mục tiêu | Còn thiếu |
| ---- | --- | -------- | --------- |
| 6    | 51  | 700      | 649       |
| 7    | 75  | 700      | 625       |
| 8    | 50  | 700      | 650       |
| 9    | 95  | 900      | 805       |

| Độ khó     | Có  | Mục tiêu |
| ---------- | --- | -------- |
| Dễ         | 104 | 900      |
| Trung bình | 137 | 1.500    |
| Khó        | 30  | 600      |

## Lỗ hổng lớn nhất, theo thứ tự nghiêm trọng

**1. Gần như chỉ có một dạng bài.** 270/271 câu là trắc nghiệm, đúng **1 câu điền
chữ**. App chấm được cả hai dạng từ 26/8 nhưng ngân hàng chưa dùng.

**2. Chưa có đoạn văn đọc hiểu nào.** Bảng `passages` **rỗng**, không câu nào có
`passage_id`. Tính năng bài đọc hiểu dùng chung đoạn văn làm xong từ 26/8 (C2)
nhưng **chưa từng được dùng**. Hai dạng số 8 và 9 — cộng lại 600 câu, tức 20% mục
tiêu — hiện là con số 0.

**3. Ba dạng bài trống hoàn toàn:** Giao tiếp (0), Tìm lỗi sai (0), Đồng nghĩa /
trái nghĩa (0). Cộng lại 500 câu chưa có gì.

**4. Ngữ âm chỉ có ở khối 9.** 21 câu, toàn bộ gắn khối 9. Khối 6, 7, 8 chưa có
câu ngữ âm nào.

**5. Câu Khó mới đạt 5% mục tiêu** (30/600).

## Quy trình soạn

1. **Tra Unit** trong `docs/UNITS.md` — 48 Unit lấy từ SGK thật, không đoán
2. **Lấy từ vựng** từ `Mindmap-Global-Success-Lop-*.pdf` (bản chữ, dùng
   `pdftotext`)
3. **Lấy điểm ngữ pháp** từ Book Map trong SGK (bản scan, dùng
   `./scripts/ocr-pdf.ps1`)
4. **Kiểm độ khó** bằng Oxford 3000 — từ ngoài danh sách là quá khó cho THCS
5. **Soạn**, đưa giáo viên xem, rồi ghi thẳng vào database
6. **Chạy bộ kiểm** ở dưới

Ghi thẳng vào database nhanh hơn dán tay nhiều lần, và đặt được khối / độ khó /
kỹ năng riêng cho **từng câu** — màn `/questions/import` chỉ đặt được cho cả lô.

## Bộ kiểm sau mỗi lần thêm câu

```sql
select
  (select count(*) from questions) as tong,
  (select count(*) from questions q where not (q.options ? q.correct_answer)) as loi_dap_an,
  (select count(*) from questions q left join question_tags t on t.question_id=q.id
     where t.question_id is null) as chua_gan_ky_nang,
  (select count(*) from questions where explanation is null or btrim(explanation)='') as thieu_giai_thich,
  (select count(*) from (select content from questions where content not like 'Chọn từ%'
     group by content having count(*)>1) d) as trung_de_bai;
```

Cả năm cột phải bằng 0 (trừ cột đầu). Lọc `not like 'Chọn từ%'` là vì các câu ngữ
âm dùng chung một dòng đề bài **một cách hợp lệ** — phần khác nhau nằm ở phương án.

Database còn có **8 ràng buộc CHECK** tự chặn lỗi cấu trúc (xem `SCHEMA.md`),
nhưng chúng **không bắt được câu sai kiến thức hay tối nghĩa** — việc đó chỉ giáo
viên làm được. Nên vẫn phải xem lại bằng mắt.

## Thứ tự thi công đã chốt (31/8)

Làm tuần tự, không nhảy cóc. Lý do xếp thứ tự này: việc trên vừa lấp lỗ hổng lớn
nhất vừa mở khoá nhiều câu nhất cho mỗi đơn vị công sức bỏ ra.

### 1. Đọc hiểu + điền từ vào đoạn văn — 600 câu

Mở khoá hai dạng đang bằng 0, chiếm 20% mục tiêu. Tính năng đoạn văn dùng chung
(C2) đã làm xong 26/8 nhưng chưa dùng lần nào, nên đây là công đã bỏ ra rồi mà
đang nằm không.

Cách làm: mỗi đoạn văn ~150-200 từ theo chủ đề một Unit, kèm 5 câu hỏi. Ghi vào
bảng `passages` trước để lấy `id`, rồi gắn `passage_id` cho từng câu. Cần khoảng
**120 đoạn văn** cho đủ 600 câu.

### 2. Giao tiếp + Tìm lỗi sai + Đồng nghĩa/trái nghĩa — 500 câu

Ba dạng trống hoàn toàn. Soạn nhanh vì không cần đoạn văn.

Riêng **Tìm lỗi sai** cần gạch chân bốn phần A/B/C/D trong câu — dùng quy ước
ngoặc vuông `He [have] been living here [since] 2010` (xem `SCHEMA.md`).

### 3. Ngữ âm cho khối 6, 7, 8 — ~230 câu

Hiện 21 câu ngữ âm đều gắn khối 9. Đề kiểm tra khối nào cũng mở đầu bằng phần này.

Bắt buộc tra trọng âm trong từ điển Cambridge trước khi ra câu — đề trọng âm trôi
nổi trên mạng sai rất nhiều.

### 4. Bù câu Khó — lên 600

Mới 30/600. Không đủ câu Khó thì đề trộn ra bị phẳng, không phân loại được học
sinh. Từ bước này trở đi mỗi lô soạn phải giữ tỉ lệ 30% Dễ / 50% TB / 20% Khó.

### 5. Soạn dày thêm theo Unit cho tới 3.000

Lúc đó mới thi công tính năng **trộn đề tự động**.

## Chặn kỹ thuật cần xử lý trước khi ngân hàng lớn

- ✅ **Phân trang** — đã làm 30/8. Supabase mặc định trả tối đa 1000 dòng; trước
  đó vượt mốc là trang lặng lẽ hiện thiếu câu mà không báo lỗi
- ⬜ **Trộn đề tự động** — mục "Trộn đề theo mẫu đề chuẩn" trong `TASKS.md`. Đây
  là đích cuối của cả 3.000 câu, chưa thi công
- ⬜ **Nhập đoạn văn đọc hiểu hàng loạt** — cần cho 600 câu của dạng 8 và 9
