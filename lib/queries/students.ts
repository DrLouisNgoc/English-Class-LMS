import { createServerClient } from "@/lib/supabase/server";

export type StudentRow = {
  id: string;
  full_name: string;
  username: string;
};

// Đọc danh sách học sinh đang học trong một lớp — không bao giờ trả về pin_hash.
export async function getStudentsInClass(classId: string): Promise<StudentRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select("students(id, full_name, username)")
    .eq("class_id", classId)
    .is("left_at", null);

  if (error) {
    throw new Error(`Không đọc được danh sách học sinh: ${error.message}`);
  }

  return data.flatMap((row) => row.students);
}
