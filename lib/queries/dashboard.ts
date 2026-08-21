import { createServerClient } from "@/lib/supabase/server";

export type TeacherDashboardStats = {
  classCount: number;
  studentCount: number;
  assignmentCount: number;
  // null nếu chưa có bài nào được nộp — không có gì để tính tỉ lệ.
  onTimeRate: number | null;
};

// Số liệu tổng quan cho GV: đếm trên toàn bộ lớp của GV này, không phải 1 lớp.
export async function getTeacherDashboardStats(teacherId: string): Promise<TeacherDashboardStats> {
  const supabase = createServerClient();

  const { data: classes, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", teacherId);

  if (classError) {
    throw new Error(`Không đọc được danh sách lớp: ${classError.message}`);
  }

  const classIds = classes.map((c) => c.id);
  if (classIds.length === 0) {
    return { classCount: 0, studentCount: 0, assignmentCount: 0, onTimeRate: null };
  }

  const { count: studentCount, error: enrollError } = await supabase
    .from("enrollments")
    .select("student_id", { count: "exact", head: true })
    .in("class_id", classIds)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được số học sinh: ${enrollError.message}`);
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, due_at")
    .in("class_id", classIds);

  if (assignmentError) {
    throw new Error(`Không đọc được danh sách bài giao: ${assignmentError.message}`);
  }

  const assignmentIds = assignments.map((a) => a.id);
  const dueAtByAssignmentId = new Map(assignments.map((a) => [a.id, a.due_at]));

  let onTimeRate: number | null = null;
  if (assignmentIds.length > 0) {
    const { data: submittedAttempts, error: attemptError } = await supabase
      .from("attempts")
      .select("assignment_id, submitted_at")
      .in("assignment_id", assignmentIds)
      .not("submitted_at", "is", null);

    if (attemptError) {
      throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
    }

    if (submittedAttempts.length > 0) {
      const onTimeCount = submittedAttempts.filter((attempt) => {
        const dueAt = dueAtByAssignmentId.get(attempt.assignment_id);
        return dueAt && attempt.submitted_at && attempt.submitted_at <= dueAt;
      }).length;
      onTimeRate = Math.round((onTimeCount / submittedAttempts.length) * 100);
    }
  }

  return {
    classCount: classIds.length,
    studentCount: studentCount ?? 0,
    assignmentCount: assignmentIds.length,
    onTimeRate,
  };
}

export type ClassDashboardStats = {
  studentCount: number;
  assignmentCount: number;
  // null nếu chưa có bài nào được nộp trong lớp — không có gì để tính.
  onTimeRate: number | null;
  averageScore: number | null;
};

// Số liệu tổng quan cho đúng 1 lớp — dùng cho trang chi tiết lớp của GV.
export async function getClassDashboardStats(classId: string): Promise<ClassDashboardStats> {
  const supabase = createServerClient();

  const { count: studentCount, error: enrollError } = await supabase
    .from("enrollments")
    .select("student_id", { count: "exact", head: true })
    .eq("class_id", classId)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được số học sinh: ${enrollError.message}`);
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, due_at")
    .eq("class_id", classId);

  if (assignmentError) {
    throw new Error(`Không đọc được danh sách bài giao: ${assignmentError.message}`);
  }

  const assignmentIds = assignments.map((a) => a.id);
  const dueAtByAssignmentId = new Map(assignments.map((a) => [a.id, a.due_at]));

  let onTimeRate: number | null = null;
  let averageScore: number | null = null;

  if (assignmentIds.length > 0) {
    const { data: submittedAttempts, error: attemptError } = await supabase
      .from("attempts")
      .select("assignment_id, submitted_at, score")
      .in("assignment_id", assignmentIds)
      .not("submitted_at", "is", null);

    if (attemptError) {
      throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
    }

    if (submittedAttempts.length > 0) {
      const onTimeCount = submittedAttempts.filter((attempt) => {
        const dueAt = dueAtByAssignmentId.get(attempt.assignment_id);
        return dueAt && attempt.submitted_at && attempt.submitted_at <= dueAt;
      }).length;
      onTimeRate = Math.round((onTimeCount / submittedAttempts.length) * 100);

      const scores = submittedAttempts
        .map((a) => a.score)
        .filter((score): score is number => score !== null);
      if (scores.length > 0) {
        const sum = scores.reduce((total, score) => total + score, 0);
        averageScore = Math.round((sum / scores.length) * 10) / 10;
      }
    }
  }

  return {
    studentCount: studentCount ?? 0,
    assignmentCount: assignmentIds.length,
    onTimeRate,
    averageScore,
  };
}
