# UNITS — 48 Unit của bộ Global Success 6–9

Danh sách này rút từ chính SGK (file `Mindmap-Global-Success-Lop-*.pdf` trong
`document_books/`), không phải trí nhớ. Dùng nó để gắn câu hỏi vào đúng Unit.

> Trước ngày 31/8 việc soạn câu hỏi dựa trên danh sách Unit do AI nhớ áng chừng.
> Khối 6 và 7 tình cờ đúng, khối 8 và 9 thì chưa từng kiểm. Từ nay tra ở đây.

Vài tên bị cắt cụt khi rút chữ tự động (đánh dấu `…`) — mở SGK xem tên đầy đủ
nếu cần, phần đầu đã đủ để nhận ra Unit.

## Lớp 6

| Unit | Chủ đề                   |
| ---- | ------------------------ |
| 1    | My new school            |
| 2    | My house                 |
| 3    | My friends               |
| 4    | My neighbourhood         |
| 5    | Natural wonders          |
| 6    | Our Tet holiday          |
| 7    | Television               |
| 8    | Sports and Games         |
| 9    | Cities of the World      |
| 10   | Our Houses in the Future |
| 11   | Our Greener World        |
| 12   | Robots                   |

## Lớp 7

| Unit | Chủ đề                        |
| ---- | ----------------------------- |
| 1    | Hobbies                       |
| 2    | Healthy living                |
| 3    | Community service             |
| 4    | Music and arts                |
| 5    | Food and drink                |
| 6    | A visit to a school           |
| 7    | Traffic                       |
| 8    | Films                         |
| 9    | Festivals around the world    |
| 10   | Energy sources                |
| 11   | Travelling in the… (future)   |
| 12   | English-speaking… (countries) |

## Lớp 8

| Unit | Chủ đề                         |
| ---- | ------------------------------ |
| 1    | Leisure time                   |
| 2    | Life in the countryside        |
| 3    | Teenagers                      |
| 4    | Ethnic groups of Viet… (Nam)   |
| 5    | Our customs and… (traditions)  |
| 6    | Lifestyles                     |
| 7    | Environmental… (protection)    |
| 8    | Shopping                       |
| 9    | Natural disasters              |
| 10   | Communication in… (the future) |
| 11   | Science and technology         |
| 12   | Life on other planets          |

## Lớp 9

| Unit | Chủ đề                      |
| ---- | --------------------------- |
| 1    | Local community             |
| 2    | City life                   |
| 3    | Healthy living for… (teens) |
| 4    | Remembering the… (past)     |
| 5    | Our experiences             |
| 6    | Vietnamese lifestyle:…      |
| 7    | Natural wonders             |
| 8    | Tourism                     |
| 9    | World Englishes             |
| 10   | Planet Earth                |
| 11   | Electronics and…            |
| 12   | Career path                 |

## Tra tài liệu nào cho việc gì

Thư mục `document_books/` **không đẩy lên GitHub** (360 MB, sách có bản quyền) —
đã ghi vào `.gitignore`. Chỉ nằm trên máy để tra cứu khi soạn câu hỏi.

| Cần gì                                  | Mở file nào                                                                              | Cách lấy                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Từ vựng của một Unit**                | `Mindmap-Global-Success-Lop-{6,7,8,9}.pdf`                                               | `pdftotext` — bản chữ, nhanh                         |
| **Điểm ngữ pháp của một Unit**          | Book Map trong SGK, **trang 6–9**                                                        | OCR                                                  |
| **Tên và số trang các Unit**            | Mục lục SGK, **trang 4–5**                                                               | OCR                                                  |
| **Ngữ liệu gốc của Unit**               | SGK, tra số trang ở mục lục rồi OCR đúng khoảng đó                                       | OCR                                                  |
| **Kiểm soát độ khó từ vựng**            | `The_Oxford_3000.pdf`                                                                    | `pdftotext` — từ ngoài danh sách là quá khó cho THCS |
| **Bài tập ngữ pháp để lấy ý**           | `Essential Grammar in Use.pdf` (A1–A2), `English_Grammar_in_Use_Intermediate...pdf` (B1) | `pdftotext`                                          |
| **Giải thích ngữ pháp bằng tiếng Việt** | `GIẢI THÍCH NGỮ PHÁP TIẾNG ANH (MAI LAN HƯƠNG).pdf`                                      | `pdftotext`                                          |
| **Đoạn văn đọc hiểu đúng mức A2–B1**    | `English Vocabulary In Use - Elementary.pdf`, `Destination B1...pdf`                     | OCR                                                  |
| **Cấu trúc đề thi thật, dạng bài mới**  | `de-thi-tieng-anh-vao-10-ha-noi-2026.pdf`                                                | OCR                                                  |

**Bản quyền — xem `decisions.md` 2026-08-31.** Được chép bài tập và đoạn văn từ
sách vào ngân hàng, vì đây là lớp riêng 5 học sinh, không công khai, sách do giáo
viên mua. Quyết định này **gắn với quy mô đó** — lớp đông lên hoặc ngân hàng đưa
ra ngoài thì phải xét lại. Đề thi của Sở là văn bản công, dùng lại thoải mái
trong mọi trường hợp.

### Lệnh hay dùng

```bash
# từ vựng một khối, lọc bỏ watermark quảng cáo
pdftotext "document_books/Mindmap-Global-Success-Lop-7.pdf" - \
  | grep -vi "D.ng th MI N PH\|NH N V.O" \
  | grep -E "^[a-zA-Z][a-zA-Z ,'/()-]{2,45}$"

# danh sách Unit
pdftotext "document_books/Mindmap-Global-Success-Lop-8.pdf" - | grep -iE "^Unit"
```

```powershell
# điểm ngữ pháp từ Book Map (trang 6-9 của SGK)
./scripts/ocr-pdf.ps1 -Pdf "document_books/Tiếng Anh 9 Global Success.pdf" -First 6 -Last 9 -Lang eng |
  Select-String -Pattern "verb|tense|clause|sentence|passive|report|comparat|adverb|question|condition|modal|article|gerund|infinitiv|present|past|future|pronoun|phrasal|relative"
```

## Cách rút chữ ra khỏi PDF

**Một nửa số sách là bản SCAN.** Kiểm trước khi đọc:

```
pdftotext -l 5 "ten-file.pdf" - | wc -c
```

Ra vài nghìn ký tự = bản chữ, dùng `pdftotext` là xong. Ra gần 0 = bản scan
(trong file chỉ có ảnh, không có chữ), phải OCR.

| Bản chữ, dùng `pdftotext`             | Bản scan, phải OCR                     |
| ------------------------------------- | -------------------------------------- |
| Oxford 3000 / 5000                    | SGK Tiếng Anh **6, 7, 8, 9** (cả bốn)  |
| Essential Grammar in Use              | Đề thi vào 10 Hà Nội 2026              |
| English Grammar in Use (Intermediate) | English Vocabulary in Use (cả 3 quyển) |
| Mai Lan Hương                         | Destination B1, B2                     |
| Mindmap Global Success 6-9            |                                        |

⚠️ **Đếm ký tự thôi chưa đủ để kết luận.** SGK lớp 8 lúc đầu bị xếp nhầm vào cột
"bản chữ" vì `pdftotext` rút ra được ~2800 ký tự. Nhưng mở ra xem thì toàn bộ số
đó là **watermark quảng cáo** của trang chia sẻ file (`blogtailieu.com` lặp đi
lặp lại), không có một chữ nào của sách. Cả bốn quyển SGK đều là bản scan.

Nên sau khi đếm, phải **nhìn thử vài dòng** rút được:

```
pdftotext -l 5 "ten-file.pdf" - | head -20
```

### Công cụ đã cài (31/8)

| Công cụ                       | Vị trí                                | Việc                      |
| ----------------------------- | ------------------------------------- | ------------------------- |
| `pdftotext`, `pdftoppm`       | thư mục poppler trong WinGet\Packages | rút chữ / dựng ảnh từ PDF |
| `tesseract` 5.4               | `C:\Program Files\Tesseract-OCR\`     | nhận dạng chữ trên ảnh    |
| bộ ngôn ngữ `eng` `vie` `osd` | `C:\Users\louis\tessdata`             | —                         |

Cài bằng `winget install UB-Mannheim.TesseractOCR` và
`winget install oschwartz10612.Poppler`. Bộ tiếng Việt phải tải riêng vào thư mục
người dùng vì **không có quyền ghi vào `Program Files`** — nên script luôn đặt
`TESSDATA_PREFIX` trỏ về `C:\Users\louis\tessdata`.

### Dùng OCR

```
./scripts/ocr-pdf.ps1 -Pdf "document_books/Tiếng Anh 7 Global Success.pdf" -First 8 -Last 9
```

⚠️ **Khoảng 20 giây một trang.** Cả quyển sách 200 trang mất hơn một tiếng. Tra
mục lục lấy đúng khoảng trang của Unit cần rồi OCR bấy nhiêu thôi, đừng quét cả sách.

Dấu tiếng Việt trong file Mindmap bị vỡ font khi rút bằng `pdftotext`, nhưng **từ
vựng tiếng Anh thì nguyên vẹn** — phần cần dùng để soạn câu hỏi không bị ảnh hưởng.

### ⚠️ Mindmap và Book Map dạng bảng/sơ đồ hay bị OCR đọc LỆCH Unit

Phát hiện tối 1/9. `Mindmap-Global-Success-Lop-*.pdf` trình bày dạng sơ đồ tư
duy (từ vựng toả quanh tên Unit ở giữa), và Book Map (trang 6-9 SGK) trình bày
dạng bảng nhiều cột. `pdftotext`/OCR đọc theo thứ tự **vị trí trên trang**, không
theo Unit, nên một cụm từ nằm ngay trước nhãn "Unit N:" thường thật ra thuộc về
**Unit N** (Unit sắp tới), không phải Unit vừa xong — kiểm chứng bằng cách so
với trang thật của chính Unit đó (ví dụ khối 8: Book Map gán "Sounds: /k/ và
/g/" cho Unit 6, nhưng mở đúng trang Unit 4 thì trang đó tự ghi rõ đây là mục
Pronunciation của **Unit 4**).

**Quy tắc rút ra:** dùng Mindmap/Book Map để biết nhanh danh sách từ vựng/điểm
ngữ pháp/âm luyện của **cả Unit**, nhưng khi cần gán chính xác một mục cho
**đúng một Unit cụ thể** (đặc biệt là Pronunciation, vì chỉ 1-2 từ dễ đoán sai),
phải mở đúng trang mở đầu Unit đó ("THIS UNIT INCLUDES") hoặc trang luyện âm
("A Closer Look 1") để xác nhận, không suy từ vị trí trong bảng.

### Cách dò trang mở đầu từng Unit nhanh (không cần quét cả sách)

Mỗi Unit thường dài 8-10 trang PDF liền nhau (thêm 2 trang cho bài Review sau
mỗi 3 Unit). Từ trang mở đầu Unit đã biết, +10 trang thường trúng Unit tiếp
theo trong cùng cụm 3 Unit; qua khỏi một bài Review thì +12. Độ lệch **số trang
in so với số trang PDF** đã dò được (chỉ dùng để tham khảo, luôn kiểm lại bằng
mắt vì có thể lệch ở trang bìa/lời nói đầu):

| Sách                        | Unit 1 ở trang PDF | Lệch (in = PDF + x) |
| ---------------------------- | ------------------- | -------------------- |
| Tiếng Anh 6 tập 1             | 7                    | không đổi (in = PDF) |
| Tiếng Anh 6 tập 2 (Unit 7-12) | 7                    | không đổi             |
| Tiếng Anh 7                   | 10                   | in = PDF − 2          |
| Tiếng Anh 8                   | 14                   | chưa chốt              |
| Tiếng Anh 9                   | 7                    | in = PDF − 1          |

⚠️ **Riêng file Tiếng Anh 8 báo lỗi `No display font for 'Symbol'/'ArialUnicode'`
khi OCR** — ký hiệu IPA trong file này có nguy cơ bị mất/đọc sai cao hơn 3 quyển
còn lại. Với khối 8, đọc thêm từ ví dụ đi kèm để xác nhận, đừng chỉ tin ký hiệu
IPA ở đầu mục Pronunciation.

## Everyday English theo Unit (48/48 Unit — tra xong 1/9/2026)

Chủ đề giao tiếp thật của từng Unit, tra trực tiếp từ mục "THIS UNIT INCLUDES"
hoặc trang "COMMUNICATION" — không suy đoán. Dùng cho dạng bài "Giao tiếp/tình
huống" (`com.functional_language`). Đã soạn xong câu hỏi cho toàn bộ 48 Unit
này (xem `QUESTION-BANK.md`), bảng dưới đây giữ lại để dùng khi cần soạn thêm.

### Lớp 6

| Unit | Everyday English                                     |
| ---- | ------------------------------------------------------ |
| 1    | Introducing someone                                    |
| 2    | Giving suggestions                                      |
| 3    | Asking about appearance and personality                |
| 4    | Asking for and giving directions                       |
| 5    | Making and accepting appointments                      |
| 6    | Saying New Year's wishes                                |
| 7    | Asking for and giving information about TV programmes  |
| 8    | Expressing and responding to congratulations            |
| 9    | Expressing exclamations with What                      |
| 10   | Expressing surprise                                      |
| 11   | Giving warnings                                          |
| 12   | Expressing agreement and disagreement                   |

### Lớp 7

| Unit | Everyday English                                             |
| ---- | --------------------------------------------------------------- |
| 1    | Talking about likes and dislikes                                |
| 2    | Asking for and giving health tips                               |
| 3    | Giving compliments                                                |
| 4    | Expressing preferences                                            |
| 5    | Asking and answering about prices                                |
| 6    | Asking for details                                                |
| 7    | Asking and answering questions about means of transport          |
| 8    | Accepting and declining suggestions                              |
| 9    | Expressing disappointment                                         |
| 10   | Asking for explanations                                           |
| 11   | Making predictions                                                |
| 12   | Expressing amazement                                              |

### Lớp 8

| Unit | Everyday English                              |
| ---- | ------------------------------------------------ |
| 1    | Inviting and accepting invitations                |
| 2    | Giving and responding to compliments              |
| 3    | Making requests                                    |
| 4    | Giving opinions                                    |
| 5    | Giving advice                                      |
| 6    | Expressing certainty                               |
| 7    | Asking for clarification                           |
| 8    | Making complaints                                  |
| 9    | Giving and responding to bad news                  |
| 10   | Interrupting politely                              |
| 11   | Giving and responding to good news                 |
| 12   | Expressing uncertainty                             |

### Lớp 9

| Unit | Everyday English                                             |
| ---- | ---------------------------------------------------------------- |
| 1    | Seeking help and responding                                       |
| 2    | Offering help and responding                                      |
| 3    | Asking for repetition and responding                              |
| 4    | Thanking and responding                                           |
| 5    | Apologising and responding                                        |
| 6    | Making promises                                                    |
| 7    | Asking for permission and responding                              |
| 8    | Expressing obligation                                              |
| 9    | Saying good luck and responding                                   |
| 10   | Persuading someone to do something and responding                 |
| 11   | Checking understanding and responding                             |
| 12   | Expressing hope and responding                                    |

## Ngữ âm theo Unit — khối 6 (xác minh 1/9/2026, dùng lại được ngay)

Cặp âm/trọng âm chuẩn của từng Unit + từ ví dụ **lấy thật từ trang luyện âm**
("A Closer Look 1") của chính Unit đó, không phải suy từ Book Map. Từ trọng âm
đã tra chéo qua Wiktionary. Đã soạn câu hỏi cho toàn bộ danh sách này — xem
`QUESTION-BANK.md`. Khối 7, 8 chưa làm (Việc số 3 đang dở).

| Unit | Cặp âm / trọng âm | Từ ví dụ thật từ SGK                                              |
| ---- | ------------------- | -------------------------------------------------------------------- |
| 1    | /ɑː/ vs /ʌ/          | smart, art, class (/ɑː/) — subject, study, compass, Monday (/ʌ/)      |
| 2    | /s/ vs /z/ (đuôi -s) | lamps, sinks, flats, toilets (/s/) — cupboards, sofas, kitchens, rooms (/z/) |
| 3    | /b/ vs /p/           | big/pig, bear/pear, buy/pie, robe/rope (cặp tối thiểu SGK cho sẵn)   |
| 4    | /ɪ/ vs /iː/          | dùng từ phổ thông an toàn: sit, fish, big (/ɪ/) — sheep (/iː/)         |
| 5    | /t/ vs /d/           | mountain, desert, plaster (/t/) — wonder, island, guide, holiday (/d/) |
| 6    | /s/ vs /ʃ/           | spring, celebrate, rice (/s/) — shopping, special, wish (/ʃ/)         |
| 7    | /ð/ vs /θ/           | there, them, weather, than, neither (/ð/) — through, both, anything, earth (/θ/) |
| 8    | /e/ vs /æ/           | chess, tennis, exercise, contest (/e/) — racket, match, marathon, active (/æ/) |
| 9    | /aʊ/ vs /əʊ/         | crowded, house, town, tower (/aʊ/) — postcard, coast, boat, pagoda (/əʊ/) |
| 10   | Trọng âm từ 2 âm tiết | Ví dụ 1 âm tiết đầu (SGK cho sẵn): picture, robot, bedroom, kitchen, palace, village. Cần tự tìm thêm từ trọng âm âm tiết 2 để làm câu "khác vị trí" — đã tra: hotel, guitar (Wiktionary) |
| 11   | Rhythm in sentences  | Trọng âm **câu**, không phải trọng âm từ — không hợp với dạng `pho.stress` hiện có |
| 12   | Tones in statements  | Ngữ điệu câu — không hợp với dạng `pho.stress` hiện có, cần dạng bài riêng nếu muốn dùng |
