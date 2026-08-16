-- seed.sql — dữ liệu mẫu để test, KHÔNG PHẢI dữ liệu thật.
-- Nguồn: đề thi tuyển sinh vào 10 THPT Hà Nội 2026-2027, môn Tiếng Anh,
-- câu 1-20 (đáp án đối chiếu với đáp án chính thức của đề, mã 001).

-- GV tạm dùng để seed (chưa có đăng nhập GV thật — T3 sẽ làm sau).
insert into teachers (id, email, full_name) values
  ('00000000-0000-0000-0000-000000000001', 'seed-teacher@local', 'GV (seed)')
on conflict (id) do nothing;

insert into skill_tags (id, code, name_vi, group_name) values
  ('10000000-0000-0000-0000-000000000001', 'read.comprehension', 'Đọc hiểu', 'ĐỌC HIỂU'),
  ('10000000-0000-0000-0000-000000000002', 'read.notice', 'Đọc hiểu biển báo/thông báo', 'ĐỌC HIỂU'),
  ('10000000-0000-0000-0000-000000000003', 'gra.grammar_general', 'Ngữ pháp tổng hợp', 'NGỮ PHÁP'),
  ('10000000-0000-0000-0000-000000000004', 'gra.conditional', 'Câu điều kiện', 'NGỮ PHÁP'),
  ('10000000-0000-0000-0000-000000000005', 'voc.vocabulary', 'Từ vựng', 'TỪ VỰNG'),
  ('10000000-0000-0000-0000-000000000006', 'voc.collocation', 'Collocation', 'TỪ VỰNG')
on conflict (code) do nothing;

-- Q1
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'KHO', $$Choose the correct sentence to complete the first half of the following text.

To save energy at school, students should practise a few simple habits. To begin with, try to avoid wasting energy during lessons and at break time. ______$$,
$$["Otherwise, the school can save a lot of money on monthly electricity bills and help the earth become a greener place.","In short, learners must stop using all electronic devices during their lessons and only read printed books to save the school's electricity.","However, students need to keep the schoolyard completely clean by picking up trash and putting plastic bottles into the correct recycling bins.","This means turning off lights, fans, and electronic devices when they are not in use, especially when leaving the classroom."]$$::jsonb,
$$This means turning off lights, fans, and electronic devices when they are not in use, especially when leaving the classroom.$$,
$$Câu này phải cụ thể hoá "tránh lãng phí năng lượng" bằng hành động thật (tắt đèn, quạt, thiết bị điện) — các câu khác lạc đề hoặc không liên quan tới chủ đề tiết kiệm điện.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q2
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'KHO', $$Reorder the following sentences to complete the second half of the text in a logical way.

a. By taking these simple actions, students can help reduce energy waste and protect the environment.
b. Finally, they should advise their classmates to save energy and work together to build good habits in the classroom.
c. Next, they should make use of sunlight and fresh air whenever possible by opening windows instead of using electric lights and air conditioners.$$,
$$["b - c - a","c - b - a","a - b - c","b - a - c"]$$::jsonb,
$$c - b - a$$,
$$"Next" (c) tiếp nối danh sách thói quen từ nửa đầu, "Finally" (b) là thói quen cuối cùng, "By taking these actions" (a) là câu kết luận tổng hợp.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q3-8 dùng chung đoạn văn về career/automation
-- Q3
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the following passage and answer the question.

For young people, planning a career now means more than choosing a job they like. They also need to understand how work is changing. In the past, a person might learn one set of skills and use it for many years. Today, however, technology and new customer needs are changing the way people work.

Automation is one clear example. When a machine can do a task faster, more accurately and at a lower cost, that task may become obsolete. This has happened to some simple jobs in ticket offices, factories and service counters. However, technology does not only take work away. It also creates new opportunities in fields such as online business, video editing, digital services and software development.

Because of these changes, workers need more than technical knowledge. They often have to collaborate with other people, share information, and solve problems together. A doctor may work with nurses and technicians to manage digital records, and a hairdresser may use an online booking app to arrange visits and communicate with customers before they arrive. Even jobs that seem practical or traditional may now require basic digital skills.

There is no single career path that suits every student. University may be the right choice for some, while vocational courses may help others prepare for skilled work sooner. To build a successful future, teenagers should develop useful skills, stay curious, and be prepared for further changes in the job market.

The word "obsolete" in paragraph 2 is OPPOSITE in meaning to ______.$$,
$$["useful and up-to-date","useless and outdated","simple and repeated","cheap and common"]$$::jsonb,
$$useful and up-to-date$$,
$$"obsolete" nghĩa là lỗi thời, không dùng được nữa — trái nghĩa là "hiện đại, còn dùng được" (useful and up-to-date).$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q4
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the passage in Q3 again. The word "It" in paragraph 2 refers to ______.$$,
$$["work","technology","business","machine"]$$::jsonb,
$$technology$$,
$$Câu trước đó: "technology does not only take work away. It also creates new opportunities..." — "It" thay cho "technology".$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q5
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'DE', $$Read the passage in Q3 again. The word "collaborate" in paragraph 3 is CLOSEST in meaning to ______.$$,
$$["work harder","work together","work longer","work alone"]$$::jsonb,
$$work together$$,
$$"collaborate" nghĩa là hợp tác, cùng làm việc với người khác.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q6
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the passage in Q3 again. Which of the following is TRUE according to the passage?$$,
$$["Students should believe that one career path is suitable for everyone.","Workers in practical jobs never need to use digital tools at work.","Hairdressers use online booking apps to avoid meeting customers.","Automation can change some jobs, but technology can also create new roles."]$$::jsonb,
$$Automation can change some jobs, but technology can also create new roles.$$,
$$Đúng theo đoạn 2-3 của bài: tự động hoá làm mất một số việc nhưng công nghệ cũng tạo ra cơ hội mới. Các câu còn lại trái với nội dung bài.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q7
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the passage in Q3 again. According to the passage, why might a hairdresser use an online booking app?$$,
$$["To work without speaking to any other people.","To replace all practical skills needed in hairdressing.","To stop customers from visiting the salon in person.","To make appointments with customers before their arrivals."]$$::jsonb,
$$To make appointments with customers before their arrivals.$$,
$$Bài viết: "...may use an online booking app to arrange visits and communicate with customers before they arrive."$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q8
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the passage in Q3 again. What is the main idea of the passage?$$,
$$["Students should choose one job and never change their career plans.","Technology has made all practical jobs disappear from the future job market.","Teenagers should build skills to adapt to changes in the job market.","Vocational courses are always better than university courses for teenagers."]$$::jsonb,
$$Teenagers should build skills to adapt to changes in the job market.$$,
$$Câu cuối bài tóm tắt ý chính: "teenagers should develop useful skills, stay curious, and be prepared for further changes in the job market."$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q9-14 dùng chung đoạn văn cloze về quản lý thời gian
-- Q9
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Mark the letter A, B, C, or D to indicate the correct option for blank (9).

Many teenagers feel stressed because they have too much schoolwork and too many activities after class. To study more effectively, students should build good time-management habits. One useful way is to make a clear timetable and write down important tasks. This helps students avoid forgetting homework or leaving everything until the last minute.

Students can also divide big tasks into smaller steps. For example, instead of trying to finish a whole project in one evening, they can complete one part each day. This makes the work less difficult and gives students more confidence. (9)______ can also help them stay calm before exams.$$,
$$["These steps simple","These simple steps","These steps are simple","These simple are steps"]$$::jsonb,
$$These simple steps$$,
$$Cần một cụm danh từ làm chủ ngữ cho "can also help" — "These simple steps" (tính từ + danh từ) đúng ngữ pháp, các phương án khác sai cấu trúc.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q10
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Mark the letter A, B, C, or D to indicate the correct option for blank (10).

Another useful habit is to keep away from distractions while studying. Students should turn off unnecessary notifications and choose a quiet place to work. This (10)______ their lessons more carefully and finish homework faster.$$,
$$["students allows to review","allows students reviewing","allows students to review","allows to students review"]$$::jsonb,
$$allows students to review$$,
$$Cấu trúc "allow somebody to do something" — "allows students to review" đúng ngữ pháp.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q11
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Mark the letter A, B, C, or D to indicate the correct option for blank (11).

Good time management is not only about studying. Teenagers also need time for rest, exercise and family. If they plan their day well, they can have enough time to relax without feeling guilty. This can improve both their physical and mental health. It may also help them (11)______ better results at school.$$,
$$["appear","revise","achieve","ignore"]$$::jsonb,
$$achieve$$,
$$Cấu trúc "help somebody + bare infinitive" — "help them achieve better results" phù hợp nghĩa "đạt kết quả tốt hơn".$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q12
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'KHO', $$Mark the letter A, B, C, or D to indicate the correct option for blank (12).

However, students should not make their timetable too strict. A good plan should be realistic and flexible. When something unexpected happens, they can change their schedule instead of feeling stressed. Learning to manage time well is an important skill because it has a strong (12)______ students' future success.$$,
$$["distance from","link between","access of","connection to"]$$::jsonb,
$$connection to$$,
$$Collocation "a strong connection to something" — "có liên hệ mật thiết tới".$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q13
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'DE', $$Mark the letter A, B, C, or D to indicate the correct option for blank (13).

(13)______ students practise these habits regularly, they will become more independent and responsible.$$,
$$["Although","During","Unless","If"]$$::jsonb,
$$If$$,
$$Câu điều kiện loại 1: "If students practise..., they will become...".$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q14
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Mark the letter A, B, C, or D to indicate the correct option for blank (14).

They will understand that (14)______ is not only about working hard, but also about working wisely.$$,
$$["success","successful","successive","succeed"]$$::jsonb,
$$success$$,
$$Cần danh từ làm chủ ngữ của "is not only about..." — "success" (thành công) là danh từ đúng.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q15
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'DE', $$Read the following notice and answer the question.

"This is NOT a public playground! Management is not responsible for injuries or accidents."

What does the notice say?$$,
$$["Staff are not responsible if people get hurt here.","The playground opens only during certain hours for visitors.","Public visitors may play here if they follow rules.","Visitors may enter this playground with the permission."]$$::jsonb,
$$Staff are not responsible if people get hurt here.$$,
$$Biển báo nói rõ "Management is not responsible for injuries or accidents" — quản lý không chịu trách nhiệm nếu có người bị thương.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q16
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'DE', $$Read the following message and answer the question.

"Please report any unattended bags to security staff immediately!"

What does the message mean?$$,
$$["You should move strange bags away from public areas yourself.","You must tell security staff if you see a bag left alone.","You can open unattended bags to find the owner's name.","You should take lost bags to your home and check them later."]$$::jsonb,
$$You must tell security staff if you see a bag left alone.$$,
$$"report ... to security staff" nghĩa là báo cho nhân viên an ninh, không phải tự xử lý túi đó.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q17-20 dùng chung thông báo Green School Week
-- Q17
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'DE', $$Read the announcement and mark the correct option for blank (17).

GREEN SCHOOL WEEK
To help protect the environment, all students are invited to join Green School Week.
Please follow these instructions:
- Sign up for the activity (17)______ the school website before Friday.
- Remember to (18)______ a clear goal for your group before you start.
- Bring (19)______ reusable water bottle instead of buying plastic ones.
- Try to (20)______ down on plastic waste by reusing bags and boxes whenever possible.$$,
$$["above","to","on","by"]$$::jsonb,
$$on$$,
$$"sign up on a website" — giới từ đúng đi với "website" là "on".$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q18
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the announcement in Q17 again. Mark the correct option for blank (18).$$,
$$["take","send","set","do"]$$::jsonb,
$$set$$,
$$Collocation "set a goal" — đặt mục tiêu.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q19
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'DE', $$Read the announcement in Q17 again. Mark the correct option for blank (19).$$,
$$["few","a","the","little"]$$::jsonb,
$$a$$,
$$"a reusable water bottle" — mạo từ "a" đứng trước danh từ đếm được số ít lần đầu nhắc tới.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Q20
insert into questions (id, teacher_id, kind, grade, difficulty, content, options, correct_answer, explanation, source, status) values
('20000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'MCQ', 9, 'TB', $$Read the announcement in Q17 again. Mark the correct option for blank (20).$$,
$$["give","cut","put","turn"]$$::jsonb,
$$cut$$,
$$Cụm động từ "cut down on something" — giảm bớt cái gì.$$,
'Đề vào 10 Hà Nội 2026-2027, mã 001', 'da_duyet');

-- Gắn tag kỹ năng cho từng câu (is_primary = true, mỗi câu 1 tag chính)
insert into question_tags (question_id, skill_tag_id, is_primary) values
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', true),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', true),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', true),
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', true),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000002', true),
('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000002', true),
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000006', true),
('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000006', true);
