"use server";

import { randomBytes, scryptSync } from "node:crypto";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";

// Bỏ dấu tiếng Việt để ra username gõ được bằng bàn phím thường.
function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

// Lấy từ cuối cùng của họ tên làm gốc username — ở Việt Nam đây thường là tên gọi hàng ngày.
function usernameBase(fullName: string): string {
  const words = stripDiacritics(fullName.trim()).split(/\s+/);
  const lastWord = words[words.length - 1] ?? "hs";
  return lastWord.toLowerCase().replace(/[^a-z]/g, "") || "hs";
}

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

// Server action GV thêm học sinh vào lớp. Tự sinh username (duy nhất trong
// lớp) và PIN 6 số, băm PIN trước khi lưu — PIN gốc chỉ hiện ra đúng 1 lần
// qua query string ngay sau khi tạo, không lưu ở đâu khác.
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
  if (typeof fullName !== "string" || !fullName.trim()) {
    redirect(`/classes/${classId}?error=${encodeURIComponent("Vui lòng nhập tên học sinh.")}`);
  }

  const supabase = createServerClient();
  const base = usernameBase(fullName);

  let username = "";
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = attempt === 0 ? base : `${base}${Math.floor(Math.random() * 90 + 10)}`;

    const { data: existing } = await supabase
      .from("enrollments")
      .select("students!inner(username)")
      .eq("class_id", classId)
      .eq("students.username", candidate)
      .maybeSingle();

    if (!existing) {
      username = candidate;
      break;
    }
  }

  if (!username) {
    redirect(
      `/classes/${classId}?error=${encodeURIComponent("Không sinh được username, thử lại.")}`,
    );
  }

  const pin = randomPin();
  const pinHash = hashPin(pin);

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({ full_name: fullName.trim(), username, pin_hash: pinHash })
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

  redirect(`/classes/${classId}?newUsername=${encodeURIComponent(username)}&newPin=${pin}`);
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
