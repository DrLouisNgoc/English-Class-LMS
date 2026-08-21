"use server";

import { randomBytes, scryptSync } from "node:crypto";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";

function randomPin(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

// Băm PIN bằng scrypt (có sẵn trong Node.js, không cần cài thư viện thêm).
// Lưu dạng "salt:hash" để so sánh lúc học sinh đăng nhập (T3.4).
function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Server action GV thêm học sinh vào lớp. GV tự gõ username + mật khẩu (không
// tự sinh nữa) — chỉ kiểm tra username chưa ai dùng trong lớp này, rồi băm
// mật khẩu trước khi lưu (không bao giờ lưu mật khẩu dạng chữ thường).
export async function addStudent(classId: string, formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const klass = await getClassById(classId, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const fullName = formData.get("full_name");
  const usernameRaw = formData.get("username");
  const password = formData.get("password");

  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    typeof usernameRaw !== "string" ||
    !usernameRaw.trim() ||
    typeof password !== "string" ||
    !password.trim()
  ) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent("Vui lòng nhập đủ tên, username và mật khẩu.")}`,
    );
  }

  const username = usernameRaw.trim().toLowerCase();
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("enrollments")
    .select("students!inner(username)")
    .eq("class_id", classId)
    .eq("students.username", username)
    .is("left_at", null)
    .maybeSingle();

  if (existing) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent(`Username "${username}" đã có học sinh khác trong lớp dùng.`)}`,
    );
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({ full_name: fullName.trim(), username, pin_hash: hashPin(password) })
    .select("id")
    .single();

  if (studentError) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent(`Không tạo được học sinh: ${studentError.message}`)}`,
    );
  }

  const { error: enrollError } = await supabase
    .from("enrollments")
    .insert({ student_id: student.id, class_id: classId });

  if (enrollError) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent(`Không thêm được vào lớp: ${enrollError.message}`)}`,
    );
  }

  redirect(`/classes/${classId}?added=${encodeURIComponent(fullName.trim())}`);
}

// Server action GV reset PIN của 1 học sinh — sinh PIN mới, ghi đè pin_hash cũ.
// Kiểm tra học sinh đó có đang học lớp của đúng GV này không, tránh GV sửa URL
// để reset PIN học sinh của người khác.
export async function resetStudentPin(classId: string, studentId: string) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const klass = await getClassById(classId, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const supabase = createServerClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("students!inner(username)")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .is("left_at", null)
    .maybeSingle();

  // Supabase trả về "students" là 1 object (quan hệ nhiều-1: mỗi enrollment
  // ứng với đúng 1 học sinh) — kiểu TS suy ra mảng chỉ là suy đoán sai vì
  // client này không có generated types, ép kiểu lại cho đúng thực tế.
  const student = enrollment?.students as unknown as { username: string } | undefined;
  if (!student) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent("Không tìm thấy học sinh này trong lớp.")}`,
    );
  }

  const pin = randomPin();
  const { error } = await supabase
    .from("students")
    .update({ pin_hash: hashPin(pin) })
    .eq("id", studentId);

  if (error) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent(`Không reset được PIN: ${error.message}`)}`,
    );
  }

  redirect(`/classes/${classId}?newUsername=${encodeURIComponent(student.username)}&newPin=${pin}`);
}

// Server action GV cho học sinh rời lớp — chỉ đánh dấu left_at, KHÔNG xoá
// bảng students/attempts, để giữ lại lịch sử điểm đã làm.
export async function removeStudentFromClass(classId: string, studentId: string) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const klass = await getClassById(classId, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("enrollments")
    .update({ left_at: new Date().toISOString() })
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .is("left_at", null);

  if (error) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent(`Không xoá được học sinh: ${error.message}`)}`,
    );
  }

  redirect(`/classes/${classId}`);
}
