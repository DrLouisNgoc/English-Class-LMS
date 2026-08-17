"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Tạo client Supabase đọc/ghi cookie phiên đăng nhập, dùng chung cho các
// server action đăng nhập/đăng xuất trong file này.
async function createActionSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local");
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

// Server action xử lý đăng nhập GV. Chạy ở server nên mật khẩu không lộ ra
// network tab kiểu client gọi thẳng — form chỉ POST lên server action này.
export async function signInTeacher(_prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  const supabase = await createActionSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  redirect("/questions");
}

// Server action đăng xuất GV — xoá phiên đăng nhập, quay về trang login.
export async function signOutTeacher() {
  const supabase = await createActionSupabaseClient();
  await supabase.auth.signOut();
  redirect("/teacher-login");
}
