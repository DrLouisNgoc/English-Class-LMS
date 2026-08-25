"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";

// Đọc và kiểm tra dữ liệu từ form bài đọc. Trả về lỗi bằng chuỗi tiếng Việt
// thay vì ném exception, để chỗ gọi tự quyết định hiện lỗi ở trang nào.
function readPassageForm(formData: FormData): { title: string; content: string } | string {
  const titleRaw = formData.get("title");
  const contentRaw = formData.get("content");

  if (typeof titleRaw !== "string" || !titleRaw.trim()) {
    return "Vui lòng nhập tên bài đọc.";
  }
  if (typeof contentRaw !== "string" || !contentRaw.trim()) {
    return "Vui lòng nhập nội dung đoạn văn.";
  }

  const title = titleRaw.trim();
  const content = contentRaw.trim();

  if (title.length > 200) {
    return "Tên bài đọc quá dài (tối đa 200 ký tự).";
  }
  // Một đoạn văn đọc hiểu trong đề thi THCS thường 150–300 từ. 10000 ký tự là
  // rộng rãi; đặt giới hạn để tránh dán nhầm cả file vào.
  if (content.length > 10000) {
    return "Đoạn văn quá dài (tối đa 10000 ký tự).";
  }

  return { title, content };
}

// Server action GV tạo bài đọc mới. Dùng trực tiếp làm form action nên báo lỗi
// bằng redirect kèm query string, giống createClass/createQuestion.
export async function createPassage(formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const parsed = readPassageForm(formData);
  if (typeof parsed === "string") {
    redirect("/passages?error=" + encodeURIComponent(parsed));
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("passages").insert({
    teacher_id: teacherId,
    title: parsed.title,
    content: parsed.content,
  });

  if (error) {
    redirect("/passages?error=" + encodeURIComponent(`Không lưu được bài đọc: ${error.message}`));
  }

  redirect("/passages?saved=1");
}

// Server action GV sửa bài đọc đã có. Gọi bằng updatePassage.bind(null, id).
// Điều kiện teacher_id trong lệnh update là lớp chặn quan trọng: GV sửa id
// trên URL cũng không đụng được bài đọc của người khác.
export async function updatePassage(passageId: string, formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const parsed = readPassageForm(formData);
  if (typeof parsed === "string") {
    redirect(`/passages/${passageId}?error=` + encodeURIComponent(parsed));
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("passages")
    .update({ title: parsed.title, content: parsed.content })
    .eq("id", passageId)
    .eq("teacher_id", teacherId);

  if (error) {
    redirect(
      `/passages/${passageId}?error=` +
        encodeURIComponent(`Không lưu được bài đọc: ${error.message}`),
    );
  }

  redirect("/passages?saved=1");
}

// Server action GV xoá bài đọc. Còn câu hỏi nào dùng đoạn văn này thì KHÔNG
// xoá — báo lỗi để GV tự gỡ các câu ra trước. Cố ý không xoá lan sang câu hỏi:
// mất câu hỏi là mất dữ liệu thật, còn đoạn văn thừa thì chỉ chiếm chỗ.
export async function deletePassage(passageId: string) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const supabase = createServerClient();

  const { count, error: usageError } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("passage_id", passageId);

  if (usageError) {
    redirect(
      "/passages?error=" + encodeURIComponent(`Không kiểm tra được bài đọc: ${usageError.message}`),
    );
  }

  if (count && count > 0) {
    redirect(
      "/passages?error=" +
        encodeURIComponent(
          `Bài đọc này đang có ${count} câu hỏi dùng chung. Hãy gỡ các câu đó ra khỏi bài đọc trước khi xoá.`,
        ),
    );
  }

  const { error } = await supabase
    .from("passages")
    .delete()
    .eq("id", passageId)
    .eq("teacher_id", teacherId);

  if (error) {
    redirect("/passages?error=" + encodeURIComponent(`Không xoá được bài đọc: ${error.message}`));
  }

  redirect("/passages?deleted=1");
}
