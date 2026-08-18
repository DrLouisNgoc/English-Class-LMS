"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getClassById } from "@/lib/queries/classes";

// Server action GV tạo bài giao cho lớp. Nhận danh sách question_id đã chọn
// qua checkbox (tên "question_id", có nhiều giá trị), tạo 1 dòng assignments
// rồi tạo nhiều dòng assignment_questions nối bài với từng câu, giữ thứ tự.
export async function createAssignment(classId: string, formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const klass = await getClassById(classId, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const title = formData.get("title");
  const dueAtRaw = formData.get("due_at");
  const questionIds = formData
    .getAll("question_id")
    .filter((v): v is string => typeof v === "string");

  if (typeof title !== "string" || !title.trim()) {
    redirect(
      `/classes/${classId}/assign?error=${encodeURIComponent("Vui lòng nhập tiêu đề bài.")}`,
    );
  }

  if (typeof dueAtRaw !== "string" || !dueAtRaw) {
    redirect(`/classes/${classId}/assign?error=${encodeURIComponent("Vui lòng chọn hạn nộp.")}`);
  }

  if (questionIds.length === 0) {
    redirect(
      `/classes/${classId}/assign?error=${encodeURIComponent("Vui lòng chọn ít nhất 1 câu hỏi.")}`,
    );
  }

  const supabase = createServerClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({ class_id: classId, title: title.trim(), due_at: new Date(dueAtRaw).toISOString() })
    .select("id")
    .single();

  if (assignmentError) {
    redirect(
      `/classes/${classId}/assign?error=${encodeURIComponent(`Không tạo được bài giao: ${assignmentError.message}`)}`,
    );
  }

  const rows = questionIds.map((questionId, index) => ({
    assignment_id: assignment.id,
    question_id: questionId,
    position: index + 1,
  }));

  const { error: linkError } = await supabase.from("assignment_questions").insert(rows);

  if (linkError) {
    redirect(
      `/classes/${classId}/assign?error=${encodeURIComponent(`Không gắn được câu hỏi vào bài: ${linkError.message}`)}`,
    );
  }

  redirect(`/classes/${classId}`);
}
