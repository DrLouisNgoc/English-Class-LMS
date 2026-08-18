import { createClient } from "@supabase/supabase-js";

// Client dùng ở server (Server Component, Server Action). Không import file
// này từ code chạy trong trình duyệt — dùng service role key nên bỏ qua RLS,
// lộ ra trình duyệt là mất an toàn toàn bộ dữ liệu học sinh.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local",
    );
  }

  return createClient(url, serviceRoleKey);
}
