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

Máy này **không có** `pdftoppm` nên công cụ đọc PDF dựng ảnh không chạy. Nhưng có
`pdftotext`, đủ dùng:

```
pdftotext -l 8 "ten-file.pdf" -        # lấy chữ 8 trang đầu, in ra màn hình
pdftotext "ten-file.pdf" - | grep -i "^Unit"
```

Dấu tiếng Việt trong mấy file Mindmap bị vỡ font khi rút ra, nhưng **từ vựng
tiếng Anh thì nguyên vẹn** — phần cần dùng để soạn câu hỏi không bị ảnh hưởng.
