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

export type StudentDashboardStats = {
  assignedCount: number;
  submittedCount: number;
  onTimeRate: number | null;
  averageScore: number | null;
};

// Số liệu tổng quan cho 1 học sinh: gộp tất cả bài được giao ở mọi lớp em
// đang học, chỉ tính lượt đã nộp cho điểm trung bình/tỉ lệ đúng hạn.
export async function getStudentDashboardStats(studentId: string): Promise<StudentDashboardStats> {
  const supabase = createServerClient();

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", studentId)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được danh sách lớp: ${enrollError.message}`);
  }

  const classIds = enrollments.map((e) => e.class_id);
  if (classIds.length === 0) {
    return { assignedCount: 0, submittedCount: 0, onTimeRate: null, averageScore: null };
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

  let submittedCount = 0;
  let onTimeRate: number | null = null;
  let averageScore: number | null = null;

  if (assignmentIds.length > 0) {
    const { data: submittedAttempts, error: attemptError } = await supabase
      .from("attempts")
      .select("assignment_id, submitted_at, score")
      .eq("student_id", studentId)
      .in("assignment_id", assignmentIds)
      .not("submitted_at", "is", null);

    if (attemptError) {
      throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
    }

    submittedCount = submittedAttempts.length;

    if (submittedCount > 0) {
      const onTimeCount = submittedAttempts.filter((attempt) => {
        const dueAt = dueAtByAssignmentId.get(attempt.assignment_id);
        return dueAt && attempt.submitted_at && attempt.submitted_at <= dueAt;
      }).length;
      onTimeRate = Math.round((onTimeCount / submittedCount) * 100);

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
    assignedCount: assignmentIds.length,
    submittedCount,
    onTimeRate,
    averageScore,
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

export type ClassSkillMissRow = {
  skill_tag_id: string;
  name_vi: string;
  wrong_count: number;
  answered_count: number;
};

// Kỹ năng cả lớp hay sai nhất — gộp câu trả lời từ TẤT CẢ bài đã giao trong
// lớp (chỉ tính lượt đã nộp), sắp giảm dần theo số lần sai. Lấy top 5.
export async function getClassSkillMissStats(classId: string): Promise<ClassSkillMissRow[]> {
  const supabase = createServerClient();

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id")
    .eq("class_id", classId);

  if (assignmentError) {
    throw new Error(`Không đọc được danh sách bài giao: ${assignmentError.message}`);
  }

  const assignmentIds = assignments.map((a) => a.id);
  if (assignmentIds.length === 0) {
    return [];
  }

  const { data: submittedAttempts, error: attemptError } = await supabase
    .from("attempts")
    .select("id")
    .in("assignment_id", assignmentIds)
    .not("submitted_at", "is", null);

  if (attemptError) {
    throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
  }

  const attemptIds = submittedAttempts.map((a) => a.id);
  if (attemptIds.length === 0) {
    return [];
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, is_correct")
    .in("attempt_id", attemptIds);

  if (answersError) {
    throw new Error(`Không đọc được câu trả lời: ${answersError.message}`);
  }

  const questionIds = [...new Set(answers.map((a) => a.question_id))];
  if (questionIds.length === 0) {
    return [];
  }

  const { data: tags, error: tagsError } = await supabase
    .from("question_tags")
    .select("question_id, skill_tags(id, name_vi)")
    .in("question_id", questionIds);

  if (tagsError) {
    throw new Error(`Không đọc được nhãn kỹ năng: ${tagsError.message}`);
  }

  const isCorrectByQuestionId = new Map(answers.map((a) => [a.question_id, a.is_correct]));
  const stats = new Map<string, { name_vi: string; wrong: number; answered: number }>();

  for (const tag of tags) {
    const skillTag = tag.skill_tags as unknown as { id: string; name_vi: string };
    const isCorrect = isCorrectByQuestionId.get(tag.question_id);
    const entry = stats.get(skillTag.id) ?? { name_vi: skillTag.name_vi, wrong: 0, answered: 0 };
    entry.answered++;
    if (!isCorrect) entry.wrong++;
    stats.set(skillTag.id, entry);
  }

  return [...stats.entries()]
    .map(([skill_tag_id, entry]) => ({
      skill_tag_id,
      name_vi: entry.name_vi,
      wrong_count: entry.wrong,
      answered_count: entry.answered,
    }))
    .sort((a, b) => b.wrong_count - a.wrong_count)
    .slice(0, 5);
}

export type StudentNeedingAttentionRow = {
  student_id: string;
  full_name: string;
  submissionRate: number | null;
  averageScore: number | null;
  reasons: string[];
};

// Học sinh cần chú ý: nộp bài ít hơn 70% số bài đã giao, hoặc điểm trung
// bình thấp hơn điểm trung bình cả lớp từ 1.5 điểm trở lên. Ngưỡng này chọn
// thô để dễ hiểu, không phải công thức thống kê chuẩn — GV nhìn số liệu bên
// cạnh để tự đánh giá thêm.
export async function getStudentsNeedingAttention(
  classId: string,
): Promise<StudentNeedingAttentionRow[]> {
  const supabase = createServerClient();

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("students(id, full_name)")
    .eq("class_id", classId)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được danh sách học sinh: ${enrollError.message}`);
  }

  const students = enrollments.flatMap((row) => row.students) as unknown as {
    id: string;
    full_name: string;
  }[];
  if (students.length === 0) {
    return [];
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id")
    .eq("class_id", classId);

  if (assignmentError) {
    throw new Error(`Không đọc được danh sách bài giao: ${assignmentError.message}`);
  }

  const assignmentCount = assignments.length;
  const assignmentIds = assignments.map((a) => a.id);

  const attemptsByStudentId = new Map<string, { submittedCount: number; scores: number[] }>();
  let classScoreSum = 0;
  let classScoreCount = 0;

  if (assignmentIds.length > 0) {
    const { data: submittedAttempts, error: attemptError } = await supabase
      .from("attempts")
      .select("student_id, score")
      .in("assignment_id", assignmentIds)
      .not("submitted_at", "is", null);

    if (attemptError) {
      throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
    }

    for (const attempt of submittedAttempts) {
      const entry = attemptsByStudentId.get(attempt.student_id) ?? {
        submittedCount: 0,
        scores: [],
      };
      entry.submittedCount++;
      if (attempt.score !== null) {
        entry.scores.push(attempt.score);
        classScoreSum += attempt.score;
        classScoreCount++;
      }
      attemptsByStudentId.set(attempt.student_id, entry);
    }
  }

  const classAverage = classScoreCount > 0 ? classScoreSum / classScoreCount : null;

  return students
    .map((student) => {
      const attempt = attemptsByStudentId.get(student.id) ?? { submittedCount: 0, scores: [] };
      const submissionRate =
        assignmentCount > 0 ? Math.round((attempt.submittedCount / assignmentCount) * 100) : null;
      const averageScore =
        attempt.scores.length > 0
          ? Math.round((attempt.scores.reduce((sum, s) => sum + s, 0) / attempt.scores.length) * 10) / 10
          : null;

      const reasons: string[] = [];
      if (submissionRate !== null && submissionRate < 70) {
        reasons.push(`Nộp ${submissionRate}% số bài`);
      }
      if (averageScore !== null && classAverage !== null && averageScore < classAverage - 1.5) {
        reasons.push(`Điểm TB ${averageScore} (lớp ${Math.round(classAverage * 10) / 10})`);
      }

      return {
        student_id: student.id,
        full_name: student.full_name,
        submissionRate,
        averageScore,
        reasons,
      };
    })
    .filter((row) => row.reasons.length > 0);
}
