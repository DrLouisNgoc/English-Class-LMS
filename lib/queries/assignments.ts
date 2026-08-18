import { createServerClient } from "@/lib/supabase/server";

export type StudentAssignment = {
  id: string;
  title: string;
  due_at: string;
  class_name: string;
};

export type AssignmentInfo = {
  id: string;
  title: string;
  due_at: string;
};

// Đọc 1 bài giao, chỉ trả về nếu học sinh này đang học đúng lớp được giao bài
// đó — tránh HS sửa URL để mở bài của lớp khác.
export async function getAssignmentForStudent(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentInfo | null> {
  const supabase = createServerClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, title, due_at, class_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Không đọc được bài giao: ${assignmentError.message}`);
  }
  if (!assignment) {
    return null;
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("class_id", assignment.class_id)
    .eq("student_id", studentId)
    .is("left_at", null)
    .maybeSingle();

  if (!enrollment) {
    return null;
  }

  return { id: assignment.id, title: assignment.title, due_at: assignment.due_at };
}

export type AssignmentQuestion = {
  id: string;
  kind: string;
  content: string;
  options: string[] | null;
};

// Đọc câu hỏi của 1 bài giao theo đúng thứ tự đã sắp — CỐ Ý không lấy cột
// correct_answer, vì đây là dữ liệu gửi xuống trình duyệt cho học sinh làm bài.
export async function getAssignmentQuestions(assignmentId: string): Promise<AssignmentQuestion[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("assignment_questions")
    .select("position, questions(id, kind, content, options)")
    .eq("assignment_id", assignmentId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(`Không đọc được câu hỏi của bài giao: ${error.message}`);
  }

  // Supabase trả "questions" là 1 object (mỗi assignment_questions ứng với
  // đúng 1 câu hỏi) — kiểu TS suy ra mảng chỉ là suy đoán sai, ép lại cho đúng.
  return data.map((row) => row.questions as unknown as AssignmentQuestion);
}

// Đọc danh sách bài đã giao của 1 lớp — dùng cho trang chi tiết lớp của GV.
export async function getAssignmentsForClass(classId: string): Promise<AssignmentInfo[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, due_at")
    .eq("class_id", classId)
    .order("due_at", { ascending: false });

  if (error) {
    throw new Error(`Không đọc được danh sách bài giao: ${error.message}`);
  }

  return data;
}

export type QuestionMissRow = {
  question_id: string;
  content: string;
  wrong_count: number;
  answered_count: number;
};

// Thống kê câu sai nhiều nhất của 1 bài giao — chỉ tính trên các lượt ĐÃ NỘP
// (attempts.submitted_at khác null), sắp giảm dần theo số lần sai (T6.2).
export async function getQuestionMissStats(assignmentId: string): Promise<QuestionMissRow[]> {
  const supabase = createServerClient();

  const { data: assignmentQuestions, error: aqError } = await supabase
    .from("assignment_questions")
    .select("question_id, position, questions(content)")
    .eq("assignment_id", assignmentId)
    .order("position", { ascending: true });

  if (aqError) {
    throw new Error(`Không đọc được câu hỏi của bài giao: ${aqError.message}`);
  }

  const { data: submittedAttempts, error: attemptError } = await supabase
    .from("attempts")
    .select("id")
    .eq("assignment_id", assignmentId)
    .not("submitted_at", "is", null);

  if (attemptError) {
    throw new Error(`Không đọc được lượt làm bài: ${attemptError.message}`);
  }

  const attemptIds = submittedAttempts.map((a) => a.id);
  if (attemptIds.length === 0) {
    return assignmentQuestions.map((row) => ({
      question_id: row.question_id,
      content: (row.questions as unknown as { content: string }).content,
      wrong_count: 0,
      answered_count: 0,
    }));
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, is_correct")
    .in("attempt_id", attemptIds);

  if (answersError) {
    throw new Error(`Không đọc được câu trả lời: ${answersError.message}`);
  }

  const stats = new Map<string, { wrong: number; answered: number }>();
  for (const answer of answers) {
    const entry = stats.get(answer.question_id) ?? { wrong: 0, answered: 0 };
    entry.answered++;
    if (!answer.is_correct) entry.wrong++;
    stats.set(answer.question_id, entry);
  }

  return assignmentQuestions
    .map((row) => {
      const entry = stats.get(row.question_id) ?? { wrong: 0, answered: 0 };
      return {
        question_id: row.question_id,
        content: (row.questions as unknown as { content: string }).content,
        wrong_count: entry.wrong,
        answered_count: entry.answered,
      };
    })
    .sort((a, b) => b.wrong_count - a.wrong_count);
}

export type AssignmentReportRow = {
  student_id: string;
  full_name: string;
  submitted: boolean;
  score: number | null;
};

// Bảng điểm 1 bài giao: mỗi học sinh đang học trong lớp đã nộp chưa, điểm bao
// nhiêu — dùng cho trang bảng điểm của GV (T6.1).
export async function getAssignmentReport(
  assignmentId: string,
  classId: string,
): Promise<AssignmentReportRow[]> {
  const supabase = createServerClient();

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("students(id, full_name)")
    .eq("class_id", classId)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được danh sách học sinh: ${enrollError.message}`);
  }

  const { data: attempts, error: attemptError } = await supabase
    .from("attempts")
    .select("student_id, submitted_at, score")
    .eq("assignment_id", assignmentId);

  if (attemptError) {
    throw new Error(`Không đọc được lượt làm bài: ${attemptError.message}`);
  }

  const attemptByStudentId = new Map(attempts.map((a) => [a.student_id, a]));

  return enrollments
    .flatMap((row) => row.students)
    .map((student) => {
      const attempt = attemptByStudentId.get(student.id);
      return {
        student_id: student.id,
        full_name: student.full_name,
        submitted: Boolean(attempt?.submitted_at),
        score: attempt?.submitted_at ? attempt.score : null,
      };
    });
}

// Đọc bài giao của các lớp mà học sinh đang học (bỏ qua lớp đã rời —
// left_at khác null) — dùng cho trang chủ học sinh, sắp theo hạn nộp gần nhất.
export async function getAssignmentsForStudent(studentId: string): Promise<StudentAssignment[]> {
  const supabase = createServerClient();

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", studentId)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được lớp đang học: ${enrollError.message}`);
  }

  const classIds = enrollments.map((e) => e.class_id);
  if (classIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, due_at, classes(name)")
    .in("class_id", classIds)
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(`Không đọc được danh sách bài giao: ${error.message}`);
  }

  // Supabase trả "classes" là 1 object (quan hệ nhiều-1: mỗi assignment ứng
  // với đúng 1 lớp) — kiểu TS suy ra mảng chỉ là suy đoán sai, ép lại cho đúng.
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    due_at: row.due_at,
    class_name: (row.classes as unknown as { name: string } | null)?.name ?? "",
  }));
}
