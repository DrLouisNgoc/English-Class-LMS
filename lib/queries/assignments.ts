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
