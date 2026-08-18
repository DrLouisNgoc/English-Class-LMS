import { createServerClient } from "@/lib/supabase/server";

export type ClassRow = {
  id: string;
  name: string;
  grade: number;
  join_code: string;
  is_active: boolean;
};

// Đọc danh sách lớp của một GV — dùng cho trang quản lý lớp.
export async function getClasses(teacherId: string): Promise<ClassRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, grade, join_code, is_active")
    .eq("teacher_id", teacherId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Không đọc được danh sách lớp: ${error.message}`);
  }

  return data;
}

// Đọc 1 lớp theo id, chỉ trả về nếu đúng là lớp của teacherId này — dùng cho
// trang chi tiết lớp, tránh GV xem được lớp của người khác qua sửa URL.
export async function getClassById(classId: string, teacherId: string): Promise<ClassRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, grade, join_code, is_active")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không đọc được thông tin lớp: ${error.message}`);
  }

  return data;
}
