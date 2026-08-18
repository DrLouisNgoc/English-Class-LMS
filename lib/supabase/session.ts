import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Đọc cookie phiên đăng nhập để biết ai đang đăng nhập (dùng anon key, không
// bỏ qua RLS). Dùng trong server action/Server Component cần biết teacher_id
// hiện tại — ví dụ khi GV tạo lớp, tạo câu hỏi.
export async function getCurrentUserId(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local",
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Component không được phép ghi cookie — bỏ qua, middleware đã lo việc làm mới phiên.
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
