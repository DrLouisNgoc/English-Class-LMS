# decisions.md — Nhật ký quyết định kiến trúc

> Mỗi lần đổi cách làm so với trước, ghi 3 dòng ở đây. Không cần dài — mục đích
> là 6 tháng sau bạn (hoặc AI) không hỏi lại "tại sao lúc trước làm thế này".

---

**2026-08-15 — Chọn Server Actions thay vì API routes cho mọi thao tác ghi dữ liệu**
Lý do: một cách làm duy nhất cho một loại việc, tránh AI trộn hai kiểu giữa các
phiên làm việc. Next.js App Router hỗ trợ tốt, không cần viết thêm route thủ công.

**2026-08-15 — Đăng nhập học sinh bằng mã lớp + username + PIN, không dùng email**
Lý do: học sinh cấp 2 không có email riêng, dễ quên mật khẩu. Giáo viên tạo tài
khoản sẵn và reset PIN được.

> ⚠️ Đổi lại một phần ngày 2026-08-21, xem quyết định bên dưới.

**2026-08-19 — Chuyển Vercel sang region Tokyo (hnd1)**
Lý do: mặc định Vercel chạy function ở Washington (Mỹ) trong khi Supabase đặt ở
Nhật và người dùng ở Việt Nam — độ trễ cao, giao diện load chậm mọi thao tác.
Thêm `vercel.json` với `"regions": ["hnd1"]`. Bài học kèm theo: biến môi trường
`NEXT_PUBLIC_*` không được tích "Sensitive" trên Vercel, vì loại biến này cần
đọc được LÚC BUILD, mà Sensitive giấu khỏi build — chỉ để Sensitive cho biến
đọc lúc runtime (`SUPABASE_SERVICE_ROLE_KEY`, `STUDENT_SESSION_SECRET`).

**2026-08-20 — Mọi form ghi dữ liệu phải tự khoá nút lúc đang gửi**
Lý do: lúc trang còn chậm (trước khi đổi region), GV bấm "Thêm học sinh" nhiều
lần liên tiếp vì tưởng không phản hồi → tạo hàng loạt học sinh trùng trong DB
(phải dọn tay). Từ nay mọi nút submit dùng chung component `SubmitButton`
(`useFormStatus` của `react-dom`) hoặc `useTransition` cho action gọi trực
tiếp — không viết `<button type="submit">` trần cho form ghi dữ liệu nữa.

**2026-08-21 — Bỏ sinh username/PIN ngẫu nhiên, chuyển sang username + mật khẩu
tự chọn (GV gõ tay hoặc HS tự đăng ký)**
Lý do: PIN 6 số ngẫu nhiên + việc phải in phiếu phát tay không hợp với cách GV
muốn vận hành lớp — muốn tự kiểm soát tài khoản hoặc để HS tự đăng ký như ứng
dụng thông thường. Đổi cụ thể:

- GV thêm học sinh: tự gõ username + mật khẩu (form `/classes/[id]`), không
  còn sinh ngẫu nhiên (bỏ `usernameBase`/`randomPin` khỏi luồng thêm mới —
  `resetStudentPin` vẫn còn sinh ngẫu nhiên cho tính năng reset).
- Thêm trang `/student-register`: học sinh tự đăng ký bằng mã lớp GV cấp + tự
  chọn username/mật khẩu.
- Cột `students.pin_hash` KHÔNG đổi tên/schema — vẫn băm bằng scrypt, chỉ đổi
  ý nghĩa dữ liệu bên trong (mật khẩu tự chọn thay vì PIN ngẫu nhiên).
- Trang đăng nhập HS đổi ô "PIN 6 số" thành "Mật khẩu" (bỏ giới hạn 6 ký tự số).
- Username luôn lưu chữ thường (cả 2 luồng) để tránh học sinh gõ nhầm hoa/thường.

**2026-08-21 — "Xoá học sinh" khỏi lớp là soft-delete, không xoá bảng**
Lý do: bảng `enrollments` đã có sẵn cột `left_at` đúng cho việc này. Nút "Xoá
khỏi lớp" chỉ set `left_at = now()`, không đụng tới `students`/`attempts` —
giữ nguyên lịch sử điểm cũ, học sinh chỉ không đăng nhập được nữa (điều kiện
đăng nhập/liệt kê học sinh lớp đều lọc `left_at is null`).

## 2026-08-22 — Không dùng plugin sinh design system tự động

**Bối cảnh:** thử cài `ui-ux-pro-max` (plugin GitHub) để hỗ trợ thiết kế.

**Kết quả:** plugin không nạp được — `marketplace.json` của nó dùng field `"id"`
không tương thích với Claude Code 2.1.126. Đã gỡ sạch.

**Quyết định:** không tìm plugin thay thế. Cách plugin đó hoạt động (chọn từ 79
style dựng sẵn + 192 palette theo ngành) đi ngược điều đang cần: thiết kế phải
bám chất liệu cụ thể của sản phẩm này (vở học sinh, bút đỏ chấm bài), không phải
ghép công thức có sẵn — đó chính là thứ tạo ra giao diện "AI slop".

**Cách làm thay thế:** thiết kế một trang thật trước (trang làm bài), rồi mới rút
token màu/font dùng chung ra từ đó. Không dựng design system trừu tượng trước khi
có trang thật.

## 2026-08-22 — Không dùng Figma cho dự án này

**Lý do:** vòng lặp "sửa code → chụp ảnh trình duyệt thật → xem lại" nhanh và
chính xác hơn dựng mockup rời trong Figma rồi code lại từ đầu. Ảnh chụp thật đã
giúp phát hiện 4 lỗi giao diện mà nhìn code không thấy được.

## 2026-08-22 — shadcn/ui: giữ token màu của dự án, không dùng màu mặc định

**Vấn đề:** `shadcn init` ghi đè `app/globals.css` (chèn bảng màu xám mặc định) và
`app/layout.tsx` (đổi font nội dung từ Be Vietnam Pro sang Geist).

**Xử lý:** hoàn nguyên font, và ánh xạ các biến ngữ nghĩa của shadcn vào bảng màu
"Vở tiếng Anh" (`--primary: var(--ink)`, `--destructive: var(--red-pen)`,
`--card: var(--surface)`…). Nhờ vậy mọi component shadcn thêm sau này tự động
đúng tông, không phải sửa từng cái. Đã bỏ khối `.dark` vì dự án không dùng
chế độ tối.

## 2026-08-23 — Trang trí phải là bố cục có nghĩa, không phải hoạ tiết lấp chỗ

**Yêu cầu ban đầu:** trang quá đơn giản, đơn điệu, nhiều khoảng trống hai bên
trên màn hình rộng — cần trang trí thêm cho đẹp và lấp đầy.

**Quyết định:** lấp khoảng trống bằng **bố cục có lý do** thay vì hoạ tiết suông.
Cụ thể: dựng khung `NotebookPage` — tờ giấy vở thật (lỗ lò xo, lề đỏ) đặt trên
mặt bàn tối màu. Khoảng hai bên giờ là "mặt bàn", có vai trò rõ ràng, đồng thời
khớp luôn với 4 trang đăng nhập vốn đã trình bày theo cách này từ trước.

**Cố ý không làm:** doodle, sticker, gradient nền, khối trang trí rỗng. Lý do:
đây là app học sinh dùng hằng ngày — hoạ tiết thừa gây mỏi mắt và làm loãng nội
dung. Chỗ đáng "vui mắt" nhất (màn hình kết quả) đã có con dấu điểm đỏ rồi.

**Thêm màu ở đâu:** các ô số liệu, mỗi ô một màu mực theo ý nghĩa — màu ở đây
mang thông tin (phân biệt loại số liệu), không phải để cho đẹp.

## 2026-08-23 — Giao diện trống vì thiếu dữ liệu, không phải thiếu hoạ tiết

**Yêu cầu ban đầu:** giao diện vẫn hơi trống, nghĩ rằng do chưa đủ tính năng.

**Chẩn đoán ngược lại:** hạ tầng đã đủ (12 trang, dashboard GV, thống kê kỹ
năng, lịch sử nộp bài) nhưng không có gì để hiển thị, vì ngân hàng chỉ có 20 câu
seed và `/questions` là trang **chỉ đọc** — muốn thêm câu phải viết SQL tay.
Nghĩa là GV chưa tự vận hành được app. Đây mới là nút thắt thật.

**Quyết định:** ưu tiên tuyệt đối cho công cụ soạn câu hỏi (thêm/sửa/xoá + dán
hàng loạt) trước mọi tính năng khác. Sau khi có nó, GV nhập đề của mình một buổi
tối là toàn bộ dashboard tự đầy lên, không cần viết thêm dòng code nào.

## 2026-08-23 — Câu hỏi mới lưu thẳng "da_duyet", không có bước duyệt

Chỉ có một GV dùng app, tự soạn tự duyệt là vô nghĩa. Câu hỏi tạo qua giao diện
lưu thẳng `status = "da_duyet"` để giao bài được ngay. Cột `status` vẫn giữ vì
`getFilteredQuestions` đang lọc theo nó, và giá trị `"an"` được tận dụng cho
việc ẩn câu hỏi (xem mục dưới).

## 2026-08-23 — Xoá câu hỏi đã giao thì ẩn, không xoá thật

`assignment_questions` và `answers` đều có khoá ngoại trỏ tới `questions`, không
có `on delete cascade`. Xoá thật một câu đã giao sẽ hỏng dữ liệu bài cũ của học
sinh. Nên: câu chưa dùng ở đâu thì xoá thật; câu đã nằm trong bài tập thì đổi
`status = "an"` — biến mất khỏi trang giao bài mới, bài cũ giữ nguyên.

## 2026-08-23 — App chỉ hỗ trợ trắc nghiệm đúng 4 phương án

Form soạn câu và trang dán hàng loạt đều bắt buộc đúng 4 phương án. Đề tiếng Anh
ở Việt Nam gần như luôn 4 phương án, và một luật duy nhất thì dễ nhớ hơn là mỗi
chỗ một kiểu. Câu tách ra không đủ 4 phương án bị tô đỏ và chặn lưu.

**Hệ quả cần biết:** nếu trong database có sẵn câu 3 phương án (từ seed hoặc
nhập tay qua SQL), khi bấm Sửa sẽ phải điền thêm ô thứ 4 mới lưu được.

> ⚠️ **Quyết định này đã bị thay ngày 2026-08-26** — xem mục "Ba dạng câu hỏi
> phủ hết đề thi" bên dưới. Giờ trắc nghiệm chỉ cần từ 2 phương án, và có thêm
> dạng điền chữ. Hệ quả nói trên không còn đúng nữa.

## 2026-08-23 — Bảng xếp hạng chỉ hiện Top 5 và thứ hạng của chính mình

SPEC ghi "học sinh không xem được bài của nhau". Bảng xếp hạng là vùng xám, nên
giới hạn lại: `getClassLeaderboard` chỉ trả **tên + điểm tích luỹ** của bạn cùng
lớp, và trang chỉ hiện 5 bạn đứng đầu cộng thứ hạng riêng của em. Bạn xếp cuối
không bị nêu tên. Không bao giờ trả điểm từng bài của bạn khác.

**Điểm tích luỹ, chuỗi ngày, huy hiệu đều tính ra từ `attempts`/`answers` sẵn
có** — không thêm bảng, không thêm cột, nên không bao giờ lệch với điểm thật.

## 2026-08-24 — Dùng Claude làm bước ĐỌC đề, app vẫn là chỗ kiểm tra và lưu

**Câu hỏi ban đầu:** có nên gắn OCR vào app để quét đề in trên giấy không?

**Đã cân nhắc 3 hướng và loại cả 3:**

- **Tesseract.js** (miễn phí, chạy trong trình duyệt): đọc sai dấu tiếng Việt,
  nuốt dấu `____`, và gần như chắc chắn hỏng với đề in 2 cột — rất phổ biến.
- **Google Vision / Azure** (~35đ/trang): đọc chữ tốt nhưng **chỉ ra chữ thô**,
  vẫn phải qua `parseQuestions`, mà vẫn cần thẻ visa + khoá API.
- **AI đọc ảnh qua API** (~150–500đ/trang): tốt nhất về chất lượng, nhưng cần
  tài khoản trả tiền, thẻ visa, thêm biến môi trường, thêm thứ phải bảo trì.

**Quyết định — hướng thứ tư, không tốn gì thêm:** GV dán text hoặc ảnh đề vào
chat Claude; Claude trả về khối chữ đúng định dạng `lib/parseQuestions.ts` hiểu
được, kèm sẵn `Đáp án:` và `Giải thích:` tiếng Việt; GV dán khối đó vào
`/questions/import`. Claude làm phần khó (đọc, chia câu, viết giải thích), app
vẫn chạy đủ mọi lớp kiểm tra trước khi lưu. Không thêm thư viện, không thêm khoá
API, không thêm chi phí.

**Cố ý KHÔNG cho Claude ghi thẳng SQL vào database.** Lý do:

1. Bỏ qua toàn bộ lớp kiểm tra trong `readQuestionForm` (đủ 4 phương án, không
   có phương án trùng nhau, `correct_answer` khớp từng ký tự với một trong 4
   phương án). Sai một ký tự là cả lớp chọn đúng vẫn bị chấm sai, và GV không
   phát hiện ra cho tới khi học sinh kêu.
2. Ghi tay vào database thật chính là kiểu thao tác đã tạo ra 15 học sinh trùng
   hồi 2026-08-19.
3. Biến việc hằng tuần thành việc phải mở Claude Code — app coi như chưa xong.

**Ranh giới:** nạp lần đầu số lượng lớn (vài trăm câu) thì đưa Claude xử lý một
lượt là hợp lý. Việc hằng tuần bắt buộc đi qua giao diện app.

## 2026-08-24 — Trộn đề hoãn lại vì ngân hàng chưa đủ nguyên liệu

GV yêu cầu tính năng trộn đề theo mẫu đề chuẩn. Trước khi viết code, đã đếm thử
ngân hàng thật và phát hiện chưa đủ điều kiện: 33/53 câu không có kỹ năng, 44/53
câu cùng mức Trung bình, và 53 câu là quá mỏng (trộn đề chỉ có ý nghĩa khi ngân
hàng gấp 3–4 lần số câu mỗi đề, tức khoảng 150–200 câu).

Đã brainstorm xong và chốt hướng thi công (xem `TASKS.md` mục Sau MVP), nhưng
hoãn lại. Làm ngay thì tính năng vẫn chạy nhưng ra đề xấu — không phải lỗi tính
năng, mà là thiếu nguyên liệu.

**Bài học: kiểm tra dữ liệu thật TRƯỚC khi làm tính năng phụ thuộc vào dữ liệu
đó.** Mất 2 phút đếm, tiết kiệm cả buổi viết một thứ chưa dùng được.

## 2026-08-24 — Trường dữ liệu mà tính năng sau phụ thuộc thì không nên để trống mặc định

33/53 câu trong ngân hàng không có kỹ năng, vì `/questions/import` để ô "Kỹ năng"
mặc định là "— Chưa gắn —" và GV bỏ qua khi nhập nhanh. Hậu quả: mọi tính năng
dựa trên kỹ năng đều hụt nguyên liệu — trộn đề theo phần, thống kê điểm yếu của
lớp, tự động giao bài theo lỗ hổng.

**Rút kinh nghiệm cho các form sau:** trường nào mà tính năng tương lai phụ thuộc
vào thì nên bắt buộc chọn, hoặc ít nhất cảnh báo rõ trước khi lưu — đừng để mặc
định trống rồi hy vọng người dùng tự điền.

## 2026-08-24 — RLS policy: viết được thật cho giáo viên, KHÔNG viết được thật cho học sinh

`0002_enable_rls.sql` mới bật RLS (khóa mặc định chặn hết) — chưa có policy
(luật ai mở được khóa nào). `0004_rls_policies.sql` viết luật thật cho các bảng
GV sở hữu (`teachers`, `classes`, `questions`, `question_tags`, `assignments`,
`assignment_questions`, và đọc chung `skill_tags`), dựa trên `auth.uid()` — vì
GV đăng nhập qua Supabase Auth nên Postgres nhận diện được.

**Không viết policy cho bảng liên quan học sinh** (`students`, `enrollments`,
`attempts`, `answers`). Lý do: học sinh đăng nhập bằng cookie tự ký riêng
(`lib/supabase/studentSession.ts`), không phải Supabase Auth — Postgres không
có `auth.uid()` nào cho học sinh cả. Viết policy kiểu "học sinh chỉ đọc dữ liệu
của mình" dựa trên `auth.uid()` cho các bảng này sẽ là policy giả — không chặn
được gì thật, chỉ tạo cảm giác an toàn sai. Các bảng này giữ nguyên "bật RLS,
không policy" = mặc định chặn hết với anon key (an toàn), việc lọc theo từng
học sinh tiếp tục do code server action đảm nhiệm.

**Vì sao vẫn an toàn dù chưa xong 100%:** mọi truy vấn server đều dùng
`SUPABASE_SERVICE_ROLE_KEY` (bỏ qua RLS hoàn toàn — xem `lib/supabase/server.ts`),
và không có Client Component nào gọi bảng bằng anon key. Nên các policy trong
`0004` hiện tại không đổi hành vi app, chỉ là lớp phòng thủ thêm cho tương lai.
Cái vẫn còn thiếu là: nếu code server action có bug (quên lọc theo học sinh),
không có gì ở tầng database chặn lại — rủi ro thật, nhưng phải sửa bằng đổi
kiến trúc đăng nhập học sinh (việc lớn, tách riêng), không sửa được bằng SQL.

## 2026-08-24 — Thiết kế B4: lời phê của thầy trên bài nộp

Brainstorm xong qua skill `superpowers:brainstorming` + Plan Mode, đã duyệt.
Ghi lại ở đây để phiên sau thi công không phải bàn lại.

**Phát hiện quan trọng lúc brainstorm:** giáo viên hiện KHÔNG xem được học sinh
trả lời gì cho từng câu — trang báo cáo `/classes/[id]/assignments/[assignmentId]`
chỉ có điểm số. Nên B4 không chỉ là "thêm một ô nhập lời phê", mà phải làm thêm
một trang xem chi tiết bài làm cho GV. Không có trang đó thì GV viết lời phê
trong lúc mù thông tin — vô nghĩa.

**Bốn quyết định đã chốt:**

1. **Lời phê là optional.** GV không viết thì thôi, không chặn, không nhắc. Bắt
   buộc viết lời phê cho từng em là việc không ai duy trì nổi với lớp 40 học sinh.
2. **GV phải xem được chi tiết từng câu** (nội dung câu, HS chọn gì, đáp án đúng,
   đúng/sai) ngay tại chỗ viết lời phê.
3. **Hiển thị bằng trang riêng**, bấm "Xem bài →" để sang — không dùng kiểu mở
   rộng tại chỗ (accordion). Lý do: nhất quán với cách toàn app đang làm
   (`/questions/[id]`, `/classes/[id]/students/[studentId]`), và một trang riêng
   thì có URL để lưu/gửi lại.
4. **Không đụng logic chấm điểm.** Lời phê là văn bản thêm sau khi đã có điểm,
   tách biệt hoàn toàn khỏi khâu chấm ở server.

**Kiểm quyền:** hàm đọc chi tiết bài làm cho GV kiểm theo chuỗi
`attempts.assignment_id → assignments.class_id → classes.teacher_id`, tức "GV có
sở hữu lớp này không" — khác với hàm của học sinh vốn kiểm "bài này có phải của
em không". Hai đường vào cùng một dữ liệu nên phải có hai luật quyền riêng, không
dùng chung hàm.

**Thi công 7 file, chia 3 đợt (theo giới hạn 4 file/nhiệm vụ của `CLAUDE.md`):**

- **Đợt 1 — dữ liệu & logic:** migration `0007_add_attempt_comment.sql` (thêm cột
  `comment text` cho phép NULL vào `attempts`) + `lib/queries/attempts.ts`
  (thêm `getAttemptDetailForTeacher`, sửa `getAttemptResult` trả thêm `comment`)
  - `lib/actions/attempts.ts` (thêm `saveAttemptComment`) +
    `lib/queries/assignments.ts` (sửa `getAssignmentReport` trả thêm `attempt_id`
    và `has_comment`).
- **Đợt 2 — giao diện GV:** trang báo cáo (thêm nút "Xem bài →" + nhãn "Đã có
  lời phê") + trang mới `.../attempts/[attemptId]/page.tsx`.
- **Đợt 3 — giao diện HS:** trang kết quả hiện khối "Lời phê của thầy" nếu có.

## 2026-08-26 — Đoạn văn đọc hiểu tách ra bảng riêng, xoá thì chặn chứ không xoá lan

Trước đây một bài đọc hiểu 5 câu phải **chép lại cả đoạn văn vào từng câu** —
thô, dễ lệch nội dung giữa các câu, và sửa đoạn văn phải sửa 5 chỗ. Hạn chế này
lộ ra khi nhập đề thi thật ngày 24/8.

Cách làm: bảng `passages` riêng, `questions.passage_id` trỏ vào (cho phép NULL
vì phần lớn câu vẫn độc lập).

**Cố ý KHÔNG dùng `on delete cascade`.** Xoá đoạn văn mà còn câu hỏi dùng nó thì
Postgres chặn lại, app báo "còn N câu hỏi đang dùng, gỡ ra trước đã". Lý do: mất
câu hỏi là mất dữ liệu thật (kèm theo cả bài làm của học sinh trỏ vào đó), còn
một đoạn văn thừa nằm lại thì chỉ chiếm chỗ. Khi phải chọn giữa hai cái sai,
chọn cái sửa được.

**Tên bài đọc chỉ thầy thấy, học sinh không.** `getAssignmentQuestions` cố ý chỉ
lấy `passages(content)`, không lấy `title` — tên kiểu "Đoạn văn về ô nhiễm (đề
vào 10 Hà Nội 2024)" là để thầy tìm lại bài, học sinh đọc chỉ tổ lộ nguồn đề.

## 2026-08-26 — Đoạn văn lặp lại lúc làm bài, chỉ hiện một lần lúc xem lại

Hai màn hình, hai cách hiển thị khác nhau cho cùng một dữ liệu — đây là cố ý,
không phải quên đồng bộ.

**Lúc làm bài:** đoạn văn hiện lại ở **mọi câu** thuộc bài đọc đó. Đã cân nhắc 2
phương án khác và loại: (a) cho đọc đoạn văn ở một màn riêng rồi bấm Tiếp — đang
trả lời mà muốn xem lại thì phải bấm ngược, trên điện thoại rất dễ mất kiên nhẫn;
(b) đoạn văn + tất cả câu trên cùng một màn — phá vỡ quy tắc "1 câu/màn hình"
đang dùng và phải viết lại khá nhiều trong `AssignmentRunner`. Lặp lại tốn dữ
liệu một chút nhưng em không phải nhớ, không phải bấm đi bấm lại.

**Lúc xem lại bài đã nộp:** chỉ hiện **một lần** ở câu đầu của nhóm. Xem lại là
cuộn một mạch từ trên xuống — lặp cùng một đoạn văn 5 lần sẽ đẩy phần đáp án và
giải thích đi mất.

## 2026-08-26 — Máy chỉ đoán đoạn văn ở phần trước câu số 1, đoán xong vẫn để thầy duyệt

`detectPassage()` chỉ xét phần văn bản **trước câu số 1** và chỉ nhận nếu dài từ
200 ký tự (một dòng hướng dẫn kiểu "Chọn đáp án đúng nhất" chỉ 30–80 ký tự).

**Cố ý không cố đoán giỏi hơn thế.** Máy đoán sai thì rối hơn là không đoán — đề
có 2 bài đọc trong một lần dán thì chỉ nhận ra bài đầu, bài sau thầy tự gắn tay.
Đoạn tìm được luôn hiện ra ở màn xem trước để sửa, đổi tên, hoặc bỏ hẳn.

Đây là cùng một triết lý với việc tích đáp án đúng ở trang dán đề: **máy đoán,
người duyệt.** App không bao giờ tự lưu thứ nó đoán ra.

## 2026-08-26 — Ba dạng câu hỏi phủ hết đề thi, thay vì làm 6–7 dạng rời rạc

Thay cho quyết định 23/8 ("chỉ hỗ trợ trắc nghiệm đúng 4 phương án").

Đề thi thật có 6 kiểu: điền vào thông báo, sắp xếp câu, điền vào đoạn văn, viết
lại câu, viết câu từ gợi ý, đọc hiểu. Dịch thẳng thành 6 dạng trong code là 6
màn hình, 6 bộ kiểm tra, 6 nhánh chấm điểm. Quy về **3 dạng**:

| Dạng                      | Phủ được                                                 | Máy chấm |
| ------------------------- | -------------------------------------------------------- | -------- |
| Trắc nghiệm 2–4 phương án | Trắc nghiệm thường, Đúng/Sai, đọc hiểu, chọn thứ tự đúng | Có       |
| Điền chữ                  | Điền từ, điền vào đoạn văn, **sắp xếp từ thành câu**     | Có       |
| Thầy chấm tay             | Viết lại câu, viết từ gợi ý                              | Không    |

**Gộp "sắp xếp từ thành câu" vào dạng điền chữ** là chỗ tiết kiệm lớn nhất: đáp
án vốn là một câu đúng, học sinh gõ lại câu đó là xong. Không cần kéo thả — mà
kéo thả trên điện thoại thì học sinh hụt tay liên tục.

**Dạng thầy chấm tay chưa làm**, và cố ý không giả vờ là máy chấm được. Một câu
viết lại có hàng chục cách đúng; để máy so chuỗi là chấm oan hàng loạt. Đây là
tính năng riêng ngang cỡ B4 (điểm phải tính được khi còn câu chưa chấm, thầy cần
màn chấm từng câu, học sinh phải thấy "đang chờ thầy chấm"). Tin tốt:
`answers.is_correct` vốn cho phép NULL nên "chưa chấm" đã có chỗ chứa sẵn.

## 2026-08-26 — Chấm câu điền chữ phải khoan dung, vì đang kiểm tra tiếng Anh chứ không phải gõ phím

Bộ chấm cũ so chuỗi khớp từng ký tự. Với trắc nghiệm thì đúng — học sinh bấm
chọn, không có chuyện gõ sai. Với câu điền chữ thì đó là cái bẫy: em gõ `Goes`
theo thói quen viết hoa đầu câu là mất điểm oan.

`normalizeText()` bỏ 3 thứ không liên quan tới kiến thức: chữ hoa/thường, khoảng
trắng thừa hoặc gõ đúp, và dấu chấm/chấm than/chấm hỏi ở cuối. Thêm nữa, thầy
nhập được nhiều đáp án chấp nhận, phân cách bằng dấu `|` — ví dụ
`doesn't|does not`.

**Trắc nghiệm vẫn so nguyên văn như cũ**, không nới lỏng. Hai dạng, hai luật.

## 2026-08-26 — Hằng số dùng ở component client phải để ngoài file có mã server

`lib/queries/questions.ts` gọi `createServerClient`. `QuestionsBulkTagList` là
component `"use client"`. Nó vốn đã import `type SkillTag` từ đó — nhưng import
**kiểu** thì an toàn, TypeScript xoá đi lúc build, không còn gì trong bundle.

Import một **hằng số hoặc hàm thật** từ file đó thì khác hẳn: cả module bị kéo
vào bundle trình duyệt, kèm theo mã server. Vì vậy bảng tra nhãn tiếng Việt
("MCQ" → "Trắc nghiệm") phải nằm ở file riêng `lib/questionLabels.ts` — file
thuần, không import gì từ Supabase.

**Quy tắc rút ra:** file nào có `"use client"` chỉ được import **kiểu** từ các
file trong `lib/queries/` và `lib/supabase/`. Cần dùng chung giá trị thật thì
tách ra file thuần riêng.

## 2026-08-26 — Không thêm GSAP, Three.js hay Framer Motion

Đã cân nhắc và loại cả ba.

- **Three.js** để dựng đồ hoạ 3D — app không có gì 3D. Nặng ~600KB, mà điểm đau
  lớn nhất đang là độ trễ mạng (học sinh dùng điện thoại Android rẻ, mạng nhà).
- **GSAP** mạnh ở dàn dựng chuỗi hoạt ảnh theo timeline — app không có cảnh nào
  như vậy. Hiệu ứng hiện có (nút đổi màu, lề đỏ tô dần) đều là CSS thuần.
- **Framer Motion** hợp lý nhất trong ba, nhưng chưa có nhu cầu thật.

Ba lý do, theo thứ tự quan trọng: (1) không thứ nào giải quyết vấn đề đang có —
app thiếu câu hỏi và thiếu một buổi chạy thật với học sinh, không thiếu hoạt
ảnh; (2) ngược với quyết định 23/8 về giao diện tĩnh sạch như trang giấy thật;
(3) mỗi thư viện là một thứ phải học và bảo trì, mà người viết đang học lập
trình.

**Muốn mượt hơn thì làm bằng CSS thuần** — con dấu điểm nhún nhẹ, chuyển câu
trượt ngang, huy hiệu mới có ánh sáng quét qua. Khoảng 20 dòng, không thêm gì.

## 2026-08-26 — Không chạy `npm run build` khi server dev đang bật

Chạy `npm run build` nhiều lần trong lúc `npm run dev` đang chạy làm thư mục
`.next` chứa lẫn cả output production lẫn dev → **app trả 404 cho mọi trang**,
kể cả trang chắc chắn vẫn tồn tại. Mất thời gian truy vì trông như lỗi code.

Sửa: dừng dev (Ctrl+C) → `Remove-Item -Recurse -Force .next` → `npm run dev`.

**Quy tắc từ nay:** kiểm tra code bằng `npx tsc --noEmit` — nó bắt hết lỗi kiểu
mà không đụng vào `.next`. Chỉ chạy `npm run build` khi đã tắt dev server.

## 2026-08-28 — Ngân hàng câu hỏi phải phủ cả 4 khối, không riêng khối 9

**Bối cảnh phát hiện.** Ngày 26–27/8 bàn chuyện xây ngân hàng câu hỏi, câu
chuyện xoay quanh đề thi vào 10 Hà Nội nên AI mặc định app chỉ phục vụ khối 9,
rồi dựng cả bản đồ "150 câu" theo đúng cấu trúc một đề vào 10. Sai. App phục vụ
**cả khối 6, 7, 8, 9**.

**Gốc của lỗi:** ô `khối [?]` trong `SPEC.md` chưa bao giờ được điền, dù chính
file đó đã cảnh báo "đừng để AI đoán hộ". Không có chỗ nào ghi phạm vi thì AI
suy từ ngữ cảnh đang bàn — và ngữ cảnh lúc đó chỉ toàn chuyện thi vào 10. Đã
điền ô này vào `SPEC.md`.

**Số liệu lộ ra khi kiểm lại (28/8, ngân hàng 75 câu):**

| Khối | Số câu |
| ---- | ------ |
| 6    | 1      |
| 7    | 0      |
| 8    | 0      |
| 9    | 74     |

Tức là app đang chỉ dùng được cho một khối. Lỗ hổng này **nghiêm trọng hơn**
chuyện thiếu nhóm kỹ năng mà trước đó vẫn coi là ưu tiên số một.

**Quyết định.** Bản đồ ngân hàng dựng lại theo trục **khối** trước, trục **kỹ
năng** sau. Cụ thể ra sao thì chưa chốt — cần thầy cho biết mỗi khối cần bao
nhiêu câu, ưu tiên khối nào trước, và có bám Unit của Global Success không.
Chưa trả lời được ba câu đó thì chưa soạn tiếp, vì soạn nhầm trục lần nữa là
phí công lần nữa.

**Ghi chú cho các phiên sau:** khi một tài liệu còn ô `[?]`, hỏi thẳng thay vì
suy từ ngữ cảnh. Ngữ cảnh của một buổi trò chuyện hẹp hơn phạm vi thật của dự
án rất nhiều.

## 2026-08-31 — Được chép bài tập và đoạn văn từ sách vào ngân hàng

**Bối cảnh.** Ngày 26/8 chốt hướng "lấy điểm ngữ pháp và cấu trúc, tự viết câu
mới, không chép nguyên". Ngày 31/8 giáo viên yêu cầu chép thẳng từ sách. Ban đầu
tôi từ chối, cho rằng sao chép có hệ thống 3.000 câu từ sách có bản quyền vượt
quá mức dùng trong lớp học.

**Điều làm đổi kết luận.** Giáo viên nêu bối cảnh cụ thể: **lớp riêng 5 học sinh,
không công khai, sách do chính giáo viên mua, dùng xong thì tắt**. Ở quy mô đó
việc này không khác gì photo vài trang sách bài tập phát cho lớp — chuyện giáo
viên nào cũng làm. Phân tích ban đầu của tôi dựa trên con số 3.000 mà bỏ qua quy
mô lớp, nên đã quá cứng.

**Quyết định.** Được chép bài tập và đoạn văn từ sách vào ngân hàng.

**Quyết định này GẮN VỚI BỐI CẢNH TRÊN.** Phải xét lại nếu:

- lớp đông lên đáng kể, hoặc mở cho học sinh ngoài
- ngân hàng được chia sẻ ra ngoài, đăng công khai, hay dùng để dạy thu phí diện rộng
- app đưa cho giáo viên khác dùng chung

Đề thi của Sở là văn bản công, dùng lại thoải mái trong mọi trường hợp.

**Vẫn giữ một ngoại lệ, vì lý do CHẤT LƯỢNG chứ không phải bản quyền:** với câu
ngữ pháp thì chép khung câu rồi đổi ngữ cảnh sang từ vựng của Unit, thay vì chép
nguyên. Hai lý do:

1. Đáp án Destination B1 và English Grammar in Use tra Google ra trong vài giây.
   Học sinh tra được một câu là tra được cả loạt vì chúng cùng một cuốn.
2. Bài tập trong sách quốc tế dùng ngữ cảnh không có trong Global Success, nên
   chép nguyên sẽ hỏng mục tiêu "đúng Unit".

Đổi ngữ cảnh gần như không tốn thêm công, nên đây là cái giá rẻ để tránh cả hai.

**Phần giải thích tiếng Việt luôn phải tự viết** — sách không có sẵn, và đó mới
là phần tốn công nhất. Chép câu chỉ tiết kiệm được phần dễ.

## 2026-09-01 — Ba lỗi giao diện cùng một gốc: form GET tải lại trang thì mất hết state chưa gửi

**Phát hiện:** trang `/classes/[id]/assign` (giao bài mới) có 3 lỗi tưởng như
khác nhau nhưng cùng một nguyên nhân — nút "Lọc" nằm trong `<form method="get">`
riêng, bấm là **tải lại cả trang** với query string mới:

1. Câu hỏi đã tick chọn bị mất trắng khi đổi bộ lọc.
2. Chữ đang gõ ở "Tiêu đề bài" và "Hạn nộp" cũng mất theo.
3. Ngân hàng câu hỏi giới hạn cứng 100 câu, không có nút xem tiếp — cố tình bỏ
   phân trang từ đầu (xem `lib/queries/questions.ts`) chính vì sợ chuyển trang
   cũng gây mất tick giống lỗi 1.

**Cách sửa, dùng chung một pattern cho cả ba:** lưu state vào `localStorage`
của trình duyệt, khoá theo `classId`, qua hai component client mới —
`components/QuestionPicker.tsx` (câu đã chọn) và `components/AssignmentFields.tsx`
(tiêu đề/hạn nộp). Component tự đọc lại `localStorage` mỗi lần trang tải lại,
kể cả sau khi đổi bộ lọc hoặc chuyển trang. Có `freshVisit` (tính từ URL không
kèm bộ lọc/lỗi = vừa bấm "Giao bài mới" từ đầu) để **chủ động xoá** dữ liệu cũ
lúc bắt đầu giao bài mới thật sự — tránh giao nhầm đề cũ mà không để ý. Sau khi
sửa, phân trang thật đã thêm lại được an toàn (giống hệt cách `/questions` đã
làm), vì tick không còn phụ thuộc vào việc ở nguyên một trang nữa.

**Pattern dùng chung cho form nào sau này gặp lỗi tương tự:** đọc `localStorage`
trong `useEffect` (không đọc lúc render đầu vì server không có `localStorage`) —
ESLint (`react-hooks/set-state-in-effect`) sẽ cảnh báo gọi `setState` trong
effect, nhưng đây là trường hợp hợp lệ cần tắt cảnh báo có chú thích rõ lý do,
không phải bug cần né bằng `useSyncExternalStore` (over-engineering cho form đơn
giản của một trình duyệt, không phải state dùng chung nhiều tab/nhiều người xem).

## 2026-09-01 — Cambridge Dictionary chặn WebFetch, dùng Wiktionary tra trọng âm thay thế

`dictionary.cambridge.org` trả **403 Forbidden** khi gọi bằng tool `WebFetch`
(chặn bot). `en.wiktionary.org/wiki/<từ>` đọc được bình thường, có ký hiệu IPA
đầy đủ và ghi rõ âm tiết trọng âm bằng dấu `ˈ`. Từ nay tra trọng âm dùng
Wiktionary, không mất công thử Cambridge trước nữa.

## 2026-09-01 — Book Map/Mindmap dạng bảng bị OCR đọc lệch Unit, không tin trực tiếp

Xem chi tiết đầy đủ + bảng dữ liệu đã xác minh ở `docs/UNITS.md` mục "⚠️ Mindmap
và Book Map dạng bảng/sơ đồ hay bị OCR đọc LỆCH Unit". Tóm tắt: bảng nhiều cột
bị đọc theo thứ tự vị trí trên trang chứ không theo đúng Unit, nên một mục
(đặc biệt là Pronunciation) rất dễ bị gán nhầm sang Unit liền kề. Phải xác nhận
lại bằng cách mở đúng trang của Unit đó trước khi tin.
