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

## Tài liệu tra cứu đang có trong `document_books/`

Thư mục này **không đẩy lên GitHub** (360 MB, sách có bản quyền) — đã ghi vào
`.gitignore`. Chỉ nằm trên máy để tra cứu khi soạn câu hỏi.

| Nhóm                 | File                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| SGK                  | Tiếng Anh 6 (tập 1, 2), 7, 8, 9 — Global Success                                       |
| Sơ đồ tư duy từ vựng | `Mindmap-Global-Success-Lop-6/7/8/9.pdf`                                               |
| Ngữ pháp             | English Grammar in Use (Intermediate), Essential Grammar in Use, Mai Lan Hương         |
| Từ vựng              | English Vocabulary in Use (Elementary / Pre-Int & Int / Upper-Int), Destination B1, B2 |
| Kiểm soát độ khó     | Oxford 3000, Oxford 5000                                                               |
| Đề thật              | Đề thi tiếng Anh vào 10 Hà Nội 2026                                                    |

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
