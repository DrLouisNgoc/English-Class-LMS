"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";

// Ký tự dùng sinh mã lớp — bỏ 0/O và 1/I vì học sinh dễ đọc nhầm khi GV đọc to hoặc in phiếu.
const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

// Server action GV tạo lớp mới. Tự sinh mã lớp ngẫu nhiên, thử lại nếu trùng
// (join_code có ràng buộc unique trong database). Dùng trực tiếp làm form
// action nên báo lỗi bằng cách redirect kèm query string, không cần component client riêng.
export async function createClass(formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const name = formData.get("name");
  const gradeRaw = formData.get("grade");
  const customJoinCodeRaw = formData.get("join_code");

  if (typeof name !== "string" || !name.trim()) {
    redirect("/classes?error=" + encodeURIComponent("Vui lòng nhập tên lớp."));
  }

  const grade = Number(gradeRaw);
  if (!Number.isInteger(grade) || grade < 6 || grade > 9) {
    redirect("/classes?error=" + encodeURIComponent("Khối lớp phải là số từ 6 đến 9."));
  }

  const customJoinCode =
    typeof customJoinCodeRaw === "string" && customJoinCodeRaw.trim()
      ? customJoinCodeRaw.trim().toUpperCase()
      : null;

  if (customJoinCode && !/^[A-Z0-9]{3,10}$/.test(customJoinCode)) {
    redirect(
      "/classes?error=" +
        encodeURIComponent("Mã lớp chỉ gồm chữ/số, dài 3-10 ký tự."),
    );
  }

  const supabase = createServerClient();

  // GV tự chọn mã lớp: chỉ thử đúng 1 lần, báo lỗi rõ nếu trùng để GV tự đổi mã khác.
  if (customJoinCode) {
    const { error } = await supabase.from("classes").insert({
      teacher_id: teacherId,
      name: name.trim(),
      join_code: customJoinCode,
      grade,
    });

    if (error) {
      const message =
        error.code === "23505"
          ? `Mã lớp "${customJoinCode}" đã có lớp khác dùng, chọn mã khác.`
          : `Không tạo được lớp: ${error.message}`;
      redirect("/classes?error=" + encodeURIComponent(message));
    }

    redirect("/classes");
  }

  // Không gõ mã lớp: tự sinh ngẫu nhiên, thử lại nếu trùng.
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const joinCode = generateJoinCode();
    const { error } = await supabase.from("classes").insert({
      teacher_id: teacherId,
      name: name.trim(),
      join_code: joinCode,
      grade,
    });

    if (!error) {
      redirect("/classes");
    }

    // Mã lớp trùng — thử sinh mã khác. Lỗi khác thì báo luôn, không thử lại.
    if (error.code !== "23505") {
      redirect("/classes?error=" + encodeURIComponent(`Không tạo được lớp: ${error.message}`));
    }
  }

  redirect("/classes?error=" + encodeURIComponent("Không sinh được mã lớp không trùng, thử lại."));
}
