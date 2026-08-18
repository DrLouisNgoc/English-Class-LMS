"use server";

import { scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
  STUDENT_SESSION_COOKIE,
  STUDENT_SESSION_MAX_AGE,
  createStudentSessionValue,
} from "@/lib/supabase/studentSession";

// So PIN học sinh gõ vào với pin_hash đã lưu — băm lại PIN vừa gõ bằng đúng
// salt cũ, so 2 chuỗi băm bằng timingSafeEqual (tránh lộ thông tin qua thời
// gian so sánh, không dùng === thường cho dữ liệu bảo mật).
function verifyPin(pin: string, pinHash: string): boolean {
  const [salt, storedHash] = pinHash.split(":");
  if (!salt || !storedHash) return false;

  const computedHash = scryptSync(pin, salt, 64).toString("hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");
  if (storedBuffer.length !== computedBuffer.length) return false;

  return timingSafeEqual(storedBuffer, computedBuffer);
}

// Server action học sinh đăng nhập bằng mã lớp + username + PIN. Không dùng
// Supabase Auth (học sinh không có email) — tự kiểm tra rồi phát cookie riêng.
export async function signInStudent(formData: FormData) {
  const joinCode = formData.get("join_code");
  const username = formData.get("username");
  const pin = formData.get("pin");

  if (
    typeof joinCode !== "string" ||
    typeof username !== "string" ||
    typeof pin !== "string" ||
    !joinCode.trim() ||
    !username.trim() ||
    !pin.trim()
  ) {
    redirect(
      "/student-login?error=" + encodeURIComponent("Vui lòng nhập đủ mã lớp, username và PIN."),
    );
  }

  const supabase = createServerClient();

  const { data: klass } = await supabase
    .from("classes")
    .select("id")
    .eq("join_code", joinCode.trim().toUpperCase())
    .maybeSingle();

  // Không nói rõ "sai mã lớp" hay "sai username" hay "sai PIN" — tránh lộ
  // thông tin cho người dò đoán tài khoản của bạn khác.
  const genericError =
    "/student-login?error=" + encodeURIComponent("Mã lớp, username hoặc PIN không đúng.");

  if (!klass) {
    redirect(genericError);
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("students!inner(id, pin_hash)")
    .eq("class_id", klass.id)
    .eq("students.username", username.trim())
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
  if (!verifyPin(pin, student.pin_hash)) {
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
