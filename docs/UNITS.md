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

⚠️ **Bản quyền.** Sách quốc tế và SGK đều có bản quyền. Lấy **điểm ngữ pháp, chủ
đề, danh sách từ vựng** rồi **tự viết câu mới** — không chép nguyên câu, không
chép nguyên đoạn văn. Đề thi của Sở là văn bản công, dùng lại thoải mái.

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
