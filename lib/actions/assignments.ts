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

// Server action GV xoá một bài đã giao.
//
// `force` = true nghĩa là thầy đã đọc cảnh báo và đồng ý xoá luôn bài làm của
// học sinh (dùng khi lỡ giao nhầm đề mà đã có em làm). Mặc định false thì
// hàm này TỪ CHỐI xoá nếu đã có ai làm — để một cú bấm nhầm không thổi bay
// điểm của cả lớp.
//
// Schema không đặt "on delete cascade" ở khoá ngoại nào, nên phải tự xoá con
// trước cha theo đúng thứ tự: answers → attempts → assignment_questions →
// assignments. Xoá sai thứ tự sẽ bị database chặn vì còn dòng trỏ vào.
export async function deleteAssignment(classId: string, assignmentId: string, force: boolean) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const klass = await getClassById(classId, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const supabase = createServerClient();

  const backWithError = (message: string) =>
    redirect(`/classes/${classId}?error=${encodeURIComponent(message)}`);

  // Bài giao phải thuộc đúng lớp này. Không kiểm thì người khác sửa
  // assignmentId trong request có thể xoá bài của lớp không phải của mình.
  const { data: assignment, error: findError } = await supabase
    .from("assignments")
    .select("id")
    .eq("id", assignmentId)
    .eq("class_id", classId)
    .maybeSingle();

  if (findError) {
    backWithError(`Không tìm được bài giao: ${findError.message}`);
  }
  if (!assignment) {
    backWithError("Không tìm thấy bài giao này trong lớp.");
  }

  const { data: attempts, error: attemptsError } = await supabase
    .from("attempts")
    .select("id")
    .eq("assignment_id", assignmentId);

  if (attemptsError) {
    backWithError(`Không đọc được bài làm của học sinh: ${attemptsError.message}`);
  }

  const attemptIds = (attempts ?? []).map((a) => a.id);

  if (attemptIds.length > 0 && !force) {
    backWithError(
      `Bài này đã có ${attemptIds.length} bài làm của học sinh nên không xoá thẳng được.`,
    );
  }

  if (attemptIds.length > 0) {
    const { error: answersError } = await supabase
      .from("answers")
      .delete()
      .in("attempt_id", attemptIds);

    if (answersError) {
      backWithError(`Không xoá được câu trả lời: ${answersError.message}`);
    }

    const { error: deleteAttemptsError } = await supabase
      .from("attempts")
      .delete()
      .eq("assignment_id", assignmentId);

    if (deleteAttemptsError) {
      backWithError(`Không xoá được bài làm: ${deleteAttemptsError.message}`);
    }
  }

  const { error: unlinkError } = await supabase
    .from("assignment_questions")
    .delete()
    .eq("assignment_id", assignmentId);

  if (unlinkError) {
    backWithError(`Không gỡ được câu hỏi khỏi bài: ${unlinkError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("class_id", classId);

  if (deleteError) {
    backWithError(`Không xoá được bài giao: ${deleteError.message}`);
  }

  redirect(`/classes/${classId}`);
}

// Server action GV ẩn / bỏ ẩn một bài đã giao.
//
// Khác hẳn deleteAssignment: KHÔNG xoá dòng nào. Chỉ ghi (hoặc xoá) một dấu
// thời gian ở cột hidden_at. Bài biến khỏi danh sách việc cần làm của học
// sinh, nhưng điểm, lịch sử và trang "Kỹ năng của em" giữ nguyên.
//
// Vì không phá gì nên không cần hỏi xác nhận — bấm nhầm thì bấm lại là xong.
export async function setAssignmentHidden(classId: string, assignmentId: string, hidden: boolean) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const klass = await getClassById(classId, teacherId);
  if (!klass) {
    redirect("/classes");
  }

  const supabase = createServerClient();

  // Lọc thêm theo class_id: bài phải thuộc đúng lớp của thầy. Không kiểm thì
  // người khác sửa assignmentId trong request có thể ẩn bài của lớp khác.
  const { error } = await supabase
    .from("assignments")
    .update({ hidden_at: hidden ? new Date().toISOString() : null })
    .eq("id", assignmentId)
    .eq("class_id", classId);

  if (error) {
    const action = hidden ? "ẩn" : "bỏ ẩn";
    redirect(
      `/classes/${classId}?error=${encodeURIComponent(`Không ${action} được bài giao: ${error.message}`)}`,
    );
  }

  redirect(`/classes/${classId}`);
}
