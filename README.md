# App Giao & Chấm BTVN Tiếng Anh THCS

Web app giao bài tập về nhà, chấm tự động, và theo dõi tiến độ cho lớp tiếng
Anh dạy thêm. Xem chi tiết mục tiêu và phạm vi ở [`docs/SPEC.md`](docs/SPEC.md).

## Chạy dự án ở máy

```bash
npm install
cp .env.example .env.local   # điền khoá Supabase thật vào đây
npm run dev                  # mở http://localhost:3000
```

## Tài liệu dự án

| File | Nội dung |
|---|---|
| [`docs/SPEC.md`](docs/SPEC.md) | Mục tiêu, phạm vi MVP, thứ KHÔNG làm |
| [`docs/SCHEMA.md`](docs/SCHEMA.md) | Cấu trúc database |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Cây thư mục, quy ước code |
| [`docs/TASKS.md`](docs/TASKS.md) | Tiến độ theo tuần |
| [`docs/decisions.md`](docs/decisions.md) | Nhật ký quyết định kiến trúc |
| `CLAUDE.md` | Quy tắc cho AI khi code cùng dự án này |

## Stack

Next.js (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind · deploy
Vercel (region Singapore)
