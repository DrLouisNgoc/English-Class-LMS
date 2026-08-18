import { createServerClient } from "@/lib/supabase/server";

export type StudentAssignment = {
  id: string;
  title: string;
  due_at: string;
  class_name: string;
};

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
