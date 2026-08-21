"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_MAX_AGE,
  createStudentSessionValue,
} from "@/lib/supabase/studentSession";

// Băm mật khẩu bằng scrypt (giống lib/actions/students.ts) — lưu dạng
// "salt:hash" để so sánh lúc học sinh đăng nhập.
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// So mật khẩu học sinh gõ vào với pin_hash đã lưu — băm lại mật khẩu vừa gõ
// bằng đúng salt cũ, so 2 chuỗi băm bằng timingSafeEqual (tránh lộ thông tin
// qua thời gian so sánh, không dùng === thường cho dữ liệu bảo mật).
function verifyPin(pin: string, pinHash: string): boolean {
  const [salt, storedHash] = pinHash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = scryptSync(pin, salt, 64).toString("hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");
  if (storedBuffer.length !== computedBuffer.length) return false;

  return timingSafeEqual(storedBuffer, computedBuffer);
}

// Server action học sinh đăng nhập bằng mã lớp + username + mật khẩu. Không
// dùng Supabase Auth (học sinh không có email) — tự kiểm tra rồi phát cookie riêng.
export async function signInStudent(formData: FormData) {
  const joinCode = formData.get("join_code");
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    typeof joinCode !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    !joinCode.trim() ||
    !username.trim() ||
    !password.trim()
  ) {
    redirect(
      "/student-login?error=" +
        encodeURIComponent("Vui lòng nhập đủ mã lớp, username và mật khẩu."),
    );
  }

  const supabase = createServerClient();

  const { data: klass } = await supabase
    .from("classes")
    .select("id")
    .eq("join_code", joinCode.trim().toUpperCase())
    .maybeSingle();

  // Không nói rõ "sai mã lớp" hay "sai username" hay "sai mật khẩu" — tránh
  // lộ thông tin cho người dò đoán tài khoản của bạn khác.
  const genericError =
    "/student-login?error=" + encodeURIComponent("Mã lớp, username hoặc mật khẩu không đúng.");

  if (!klass) {
    redirect(genericError);
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("students!inner(id, pin_hash)")
    .eq("class_id", klass.id)
    .eq("students.username", username.trim().toLowerCase())
    .is("left_at", null)
    .maybeSingle();

  if (!enrollment) {
    redirect(genericError);
  }

  // Supabase trả về "students" là 1 object (quan hệ nhiều-1: mỗi enrollment
  // ứng với đúng 1 học sinh) — kiểu TS suy ra mảng chỉ là suy đoán sai vì
  // client này không có generated types, ép kiểu lại cho đúng thực tế.
  const student = enrollment.students as unknown as { id: string; pin_hash: string } | undefined;
  if (!student) {
    redirect(genericError);
  }
  if (!verifyPin(password, student.pin_hash)) {
    redirect(genericError);
  }

  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, createStudentSessionValue(student.id), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: STUDENT_SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/student/home");
}

// Server action học sinh tự đăng ký tài khoản — cần đúng mã lớp GV đã cấp,
// tự chọn username + mật khẩu. Username phải chưa ai dùng trong lớp đó.
export async function registerStudent(formData: FormData) {
  const joinCode = formData.get("join_code");
  const fullName = formData.get("full_name");
  const usernameRaw = formData.get("username");
  const password = formData.get("password");

  if (
    typeof joinCode !== "string" ||
    typeof fullName !== "string" ||
    typeof usernameRaw !== "string" ||
    typeof password !== "string" ||
    !joinCode.trim() ||
    !fullName.trim() ||
    !usernameRaw.trim() ||
    !password.trim()
  ) {
    redirect(
      "/student-register?error=" +
        encodeURIComponent("Vui lòng nhập đủ mã lớp, họ tên, username và mật khẩu."),
    );
  }

  const supabase = createServerClient();

  const { data: klass } = await supabase
    .from("classes")
    .select("id")
    .eq("join_code", joinCode.trim().toUpperCase())
    .maybeSingle();

  if (!klass) {
    redirect("/student-register?error=" + encodeURIComponent("Không tìm thấy lớp với mã này."));
  }

  const username = usernameRaw.trim().toLowerCase();

  const { data: existing } = await supabase
    .from("enrollments")
    .select("students!inner(username)")
    .eq("class_id", klass.id)
    .eq("students.username", username)
    .is("left_at", null)
    .maybeSingle();

  if (existing) {
    redirect(
      "/student-register?error=" +
        encodeURIComponent(`Username "${username}" đã có bạn khác trong lớp dùng, chọn tên khác.`),
    );
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({ full_name: fullName.trim(), username, pin_hash: hashPassword(password) })
    .select("id")
    .single();

  if (studentError) {
    redirect(
      "/student-register?error=" +
        encodeURIComponent(`Không tạo được tài khoản: ${studentError.message}`),
    );
  }

  const { error: enrollError } = await supabase
    .from("enrollments")
    .insert({ student_id: student.id, class_id: klass.id });

  if (enrollError) {
    redirect(
      "/student-register?error=" +
        encodeURIComponent(`Không thêm được vào lớp: ${enrollError.message}`),
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, createStudentSessionValue(student.id), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: STUDENT_SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/student/home");
}
