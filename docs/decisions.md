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

## 2026-08-24 — Thiết kế B4: lời phê của cô trên bài nộp

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
  + `lib/actions/attempts.ts` (thêm `saveAttemptComment`) +
  `lib/queries/assignments.ts` (sửa `getAssignmentReport` trả thêm `attempt_id`
  và `has_comment`).
- **Đợt 2 — giao diện GV:** trang báo cáo (thêm nút "Xem bài →" + nhãn "Đã có
  lời phê") + trang mới `.../attempts/[attemptId]/page.tsx`.
- **Đợt 3 — giao diện HS:** trang kết quả hiện khối "Lời phê của cô" nếu có.

