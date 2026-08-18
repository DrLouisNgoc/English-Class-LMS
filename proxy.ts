import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionValue } from "@/lib/supabase/studentSession";

// MỘT chỗ duy nhất kiểm tra quyền GV/HS (theo ARCHITECTURE.md).
// Chưa đăng nhập mà vào trang GV → đá về /teacher-login.
// Chưa đăng nhập mà vào trang HS → đá về /student-login.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isTeacherRoute =
    request.nextUrl.pathname.startsWith("/questions") ||
    request.nextUrl.pathname.startsWith("/classes");

  if (isTeacherRoute && !user) {
    const loginUrl = new URL("/teacher-login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const isStudentRoute = request.nextUrl.pathname.startsWith("/student");

  if (isStudentRoute) {
    const cookieValue = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const studentId = verifyStudentSessionValue(cookieValue);

    if (!studentId) {
      const loginUrl = new URL("/student-login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/questions/:path*", "/classes/:path*", "/student/:path*"],
};
