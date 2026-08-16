# ARCHITECTURE.md — Cấu trúc thư mục chi tiết

> File này chỉ đọc khi cần biết chính xác một thứ nằm ở đâu. CLAUDE.md chỉ trỏ
> tới đây, không nhắc lại nội dung — tránh nạp thông tin thừa vào mỗi phiên.

```
english-lms/
├── .env.example
├── .env.local                    # (gitignore) khoá Supabase thật
├── middleware.ts                 # MỘT chỗ duy nhất kiểm tra quyền GV/HS
│
├── CLAUDE.md                     # Claude Code tự đọc ở gốc mỗi phiên
├── README.md                     # dành cho người, không phải AI
├── docs/
│   ├── SPEC.md
│   ├── SCHEMA.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md           # file này
│   └── decisions.md              # nhật ký đổi quyết định kiến trúc + lý do
│
├── supabase/
│   ├── migrations/                # mỗi file = một lần sửa schema, đánh số
│   └── seed.sql                   # dữ liệu mẫu để test, không phải dữ liệu thật
│
├── app/
│   ├── (auth)/teacher-login, student-login
│   ├── (teacher)/classes, questions, assignments
│   └── (student)/assignments
│
├── components/
│   ├── ui/                        # KHÔNG chứa logic nghiệp vụ
│   └── features/                  # CÓ logic nghiệp vụ, theo tên tính năng
│       ├── students/
│       ├── questions/
│       └── assignments/
│
├── lib/
│   ├── actions/                   # MỌI server action, đặt tên theo bảng
│   ├── queries/                   # MỌI hàm đọc dữ liệu
│   ├── validations/                # Zod schema, tách riêng để dùng lại ở client
│   ├── supabase/                  # client.ts (trình duyệt) + server.ts (server)
│   ├── types/                     # generate tự động, không sửa tay
│   └── utils/
│
└── tests/                         # để trống ở MVP
```

**Để trống ở MVP:** `tests/` (thêm sau khi tính năng chấm điểm chạy ổn),
`.github/workflows` (CI — chỉ thêm khi đã có test), `.claude/commands/` (custom
slash command — thêm khi thấy lặp lại thao tác thủ công nhiều lần).

**Không tạo `/services`, `/repositories` hay tầng trừu tượng nhiều lớp.** Đó là
kiến trúc cho đội nhiều kỹ sư, không phải cho một người code cùng AI.
