-- 0007_add_attempt_comment.sql
-- Lời phê của giáo viên cho một lượt làm bài đã nộp (tính năng B4).
-- Mỗi lượt làm bài có tối đa 1 lời phê nên để thẳng cột trong attempts,
-- không cần bảng riêng. Cho phép NULL vì lời phê là tuỳ chọn — giáo viên
-- không viết thì thôi.

alter table attempts add column comment text;
