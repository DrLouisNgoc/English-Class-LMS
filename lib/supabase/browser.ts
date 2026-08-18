import { createBrowserClient } from "@supabase/ssr";

// Client dùng trong trình duyệt (Client Component, ví dụ form đăng nhập).
// Dùng anon key nên bị RLS chặn theo policy — an toàn khi lộ ra trình duyệt.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local",
    );
  }

  return createBrowserClient(url, anonKey);
}
