import { createServerClient } from "@/lib/supabase/server";
import { getStudentSkillStats } from "@/lib/queries/students";

// Điểm thưởng cộng thêm cho mỗi bài nộp trước hạn — để khuyến khích nộp đúng
// hạn chứ không chỉ chạy theo điểm số. Canh theo thang điểm 10 (10% điểm tối đa).
const ON_TIME_BONUS = 1;

// Đổi một mốc thời gian sang "ngày nào theo giờ Việt Nam", dạng 2026-08-23.
// Cách làm: cộng thêm 7 tiếng rồi lấy phần ngày. Giờ Việt Nam luôn là UTC+7,
// không có giờ mùa hè, nên cộng cố định như vậy là đủ chính xác.
function vietnamDateKey(isoTime: string): string {
  const shifted = new Date(new Date(isoTime).getTime() + 7 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

// Lùi một ngày so với chuỗi ngày dạng 2026-08-23.
function previousDateKey(dateKey: string): string {
  const shifted = new Date(new Date(`${dateKey}T00:00:00Z`).getTime() - 24 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

export type Badge = {
  emoji: string;
  title: string;
  description: string;
};

export type StudentProgress = {
  totalPoints: number;
  streakDays: number;
  badges: Badge[];
};

// Điểm tích luỹ, chuỗi ngày làm bài và huy hiệu của một học sinh.
//
// Tất cả đều tính ra từ dữ liệu đã có trong bảng attempts và answers — không
// có bảng riêng nào lưu điểm thưởng, nên không bao giờ lệch với điểm thật.
export async function getStudentProgress(studentId: string): Promise<StudentProgress> {
  const supabase = createServerClient();

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", studentId)
    .is("left_at", null);

  if (enrollError) {
    throw new Error(`Không đọc được danh sách lớp: ${enrollError.message}`);
  }

  const classIds = enrollments.map((row) => row.class_id);
  if (classIds.length === 0) {
    return { totalPoints: 0, streakDays: 0, badges: [] };
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, due_at")
    .in("class_id", classIds);

  if (assignmentError) {
    throw new Error(`Không đọc được danh sách bài giao: ${assignmentError.message}`);
  }

  if (assignments.length === 0) {
    return { totalPoints: 0, streakDays: 0, badges: [] };
  }

  const dueAtByAssignmentId = new Map(assignments.map((row) => [row.id, row.due_at]));

  const { data: attempts, error: attemptError } = await supabase
    .from("attempts")
    .select("assignment_id, submitted_at, score")
    .eq("student_id", studentId)
    .in(
      "assignment_id",
      assignments.map((row) => row.id),
    )
    .not("submitted_at", "is", null);

  if (attemptError) {
    throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
  }

  let totalPoints = 0;
  let onTimeCount = 0;
  let hasPerfectScore = false;
  const submittedDays = new Set<string>();

  for (const attempt of attempts) {
    totalPoints += attempt.score ?? 0;

    if (attempt.score === 10) {
      hasPerfectScore = true;
    }

    if (!attempt.submitted_at) {
      continue;
    }

    submittedDays.add(vietnamDateKey(attempt.submitted_at));

    const dueAt = dueAtByAssignmentId.get(attempt.assignment_id);
    if (dueAt && attempt.submitted_at <= dueAt) {
      onTimeCount += 1;
      totalPoints += ON_TIME_BONUS;
    }
  }

  // Chuỗi ngày: đếm lùi từ hôm nay. Nếu hôm nay chưa làm bài thì bắt đầu đếm
  // từ hôm qua, để em không bị mất chuỗi chỉ vì chưa kịp làm bài trong ngày.
  const today = vietnamDateKey(new Date().toISOString());
  let streakDays = 0;
  let cursor = submittedDays.has(today) ? today : previousDateKey(today);
  while (submittedDays.has(cursor)) {
    streakDays += 1;
    cursor = previousDateKey(cursor);
  }

  const skillStats = await getStudentSkillStats(studentId);
  // "Chinh phục" một kỹ năng: làm ít nhất 5 câu thuộc kỹ năng đó và đúng từ 90%
  // trở lên. Yêu cầu tối thiểu 5 câu để tránh trường hợp đúng 1/1 câu cũng được huy hiệu.
  const masteredSkill = skillStats.find(
    (skill) => skill.total >= 5 && skill.correct / skill.total >= 0.9,
  );

  const badges: Badge[] = [];
  if (attempts.length >= 1) {
    badges.push({
      emoji: "🌱",
      title: "Bài đầu tiên",
      description: "Đã nộp bài tập đầu tiên",
    });
  }
  if (hasPerfectScore) {
    badges.push({
      emoji: "💯",
      title: "Điểm tuyệt đối",
      description: "Có một bài đúng hết tất cả các câu",
    });
  }
  if (onTimeCount >= 5) {
    badges.push({
      emoji: "⏰",
      title: "Luôn đúng hạn",
      description: "Nộp đúng hạn từ 5 bài trở lên",
    });
  }
  if (streakDays >= 7) {
    badges.push({
      emoji: "🔥",
      title: "Chuỗi 7 ngày",
      description: "Làm bài 7 ngày liên tiếp",
    });
  }
  if (masteredSkill) {
    badges.push({
      emoji: "🏅",
      title: `Giỏi ${masteredSkill.name_vi}`,
      description: "Đúng từ 90% trở lên ở kỹ năng này",
    });
  }

  return { totalPoints: Math.round(totalPoints), streakDays, badges };
}

export type LeaderboardRow = {
  studentId: string;
  fullName: string;
  points: number;
};

export type ClassLeaderboard = {
  className: string;
  // Chỉ 5 bạn đứng đầu — bạn xếp cuối không bị nêu tên.
  top: LeaderboardRow[];
  myRank: number;
  myPoints: number;
  totalStudents: number;
};

// Bảng xếp hạng trong lớp của học sinh đang đăng nhập.
//
// RIÊNG TƯ: hàm này chỉ trả về TÊN và ĐIỂM TÍCH LUỸ của các bạn cùng lớp, và
// chỉ 5 bạn đứng đầu. Tuyệt đối không trả điểm từng bài hay bài làm của bạn
// khác — học sinh không được xem bài của nhau.
export async function getClassLeaderboard(studentId: string): Promise<ClassLeaderboard | null> {
  const supabase = createServerClient();

  // Học sinh có thể học nhiều lớp; lấy lớp em vào sớm nhất làm lớp chính.
  const { data: myEnrollment, error: enrollError } = await supabase
    .from("enrollments")
    .select("class_id, classes(name)")
    .eq("student_id", studentId)
    .is("left_at", null)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (enrollError) {
    throw new Error(`Không đọc được lớp của em: ${enrollError.message}`);
  }

  if (!myEnrollment) {
    return null;
  }

  const classId = myEnrollment.class_id;
  const className = myEnrollment.classes?.[0]?.name ?? "Lớp của em";

  // Danh sách bạn cùng lớp đang còn học.
  const { data: classmates, error: classmateError } = await supabase
    .from("enrollments")
    .select("student_id, students(full_name)")
    .eq("class_id", classId)
    .is("left_at", null);

  if (classmateError) {
    throw new Error(`Không đọc được danh sách lớp: ${classmateError.message}`);
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, due_at")
    .eq("class_id", classId);

  if (assignmentError) {
    throw new Error(`Không đọc được danh sách bài giao: ${assignmentError.message}`);
  }

  // Mặc định ai cũng 0 điểm, rồi cộng dần theo từng lượt nộp.
  const pointsByStudentId = new Map<string, number>();
  for (const row of classmates) {
    pointsByStudentId.set(row.student_id, 0);
  }

  if (assignments.length > 0) {
    const dueAtByAssignmentId = new Map(assignments.map((row) => [row.id, row.due_at]));

    const { data: attempts, error: attemptError } = await supabase
      .from("attempts")
      .select("student_id, assignment_id, submitted_at, score")
      .in(
        "assignment_id",
        assignments.map((row) => row.id),
      )
      .not("submitted_at", "is", null);

    if (attemptError) {
      throw new Error(`Không đọc được lượt nộp bài: ${attemptError.message}`);
    }

    for (const attempt of attempts) {
      // Bỏ qua lượt nộp của học sinh đã rời lớp.
      if (!pointsByStudentId.has(attempt.student_id)) {
        continue;
      }

      let points = attempt.score ?? 0;
      const dueAt = dueAtByAssignmentId.get(attempt.assignment_id);
      if (dueAt && attempt.submitted_at && attempt.submitted_at <= dueAt) {
        points += ON_TIME_BONUS;
      }

      pointsByStudentId.set(
        attempt.student_id,
        pointsByStudentId.get(attempt.student_id)! + points,
      );
    }
  }

  const ranked: LeaderboardRow[] = classmates
    .map((row) => ({
      studentId: row.student_id,
      fullName: row.students?.[0]?.full_name ?? "Bạn học",
      points: Math.round(pointsByStudentId.get(row.student_id) ?? 0),
    }))
    .sort((a, b) => b.points - a.points || a.fullName.localeCompare(b.fullName, "vi"));

  const myIndex = ranked.findIndex((row) => row.studentId === studentId);

  return {
    className,
    top: ranked.slice(0, 5),
    myRank: myIndex === -1 ? ranked.length : myIndex + 1,
    myPoints: myIndex === -1 ? 0 : ranked[myIndex].points,
    totalStudents: ranked.length,
  };
}
