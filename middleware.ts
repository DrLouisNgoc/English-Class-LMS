import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// MỘT chỗ duy nhất kiểm tra quyền GV/HS (theo ARCHITECTURE.md).
// Chưa đăng nhập mà vào trang GV → đá về /teacher-login.
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isTeacherRoute = request.nextUrl.pathname.startsWith("/questions");

  if (isTeacherRoute && !user) {
    const loginUrl = new URL("/teacher-login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/questions/:path*"],
};
