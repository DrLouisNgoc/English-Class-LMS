"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";

const DIFFICULTIES = ["DE", "TB", "KHO"];

// Server action GV thêm một câu hỏi trắc nghiệm vào ngân hàng.
//
// Lưu ý quan trọng về cách lưu đáp án: cột `options` chứa NGUYÊN VĂN 4 phương
// án (không phải nhãn A/B/C/D), còn `correct_answer` chứa NGUYÊN VĂN phương án
// đúng. Bộ chấm điểm trong lib/actions/attempts.ts so sánh chuỗi học sinh chọn
// với `correct_answer`, nên hai cột này bắt buộc phải khớp từng ký tự.
export async function createQuestion(formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const content = formData.get("content");
  const explanation = formData.get("explanation");
  const source = formData.get("source");
  const gradeRaw = formData.get("grade");
  const difficultyRaw = formData.get("difficulty");
  const correctIndexRaw = formData.get("correct_index");
  const skillTagId = formData.get("skill_tag_id");

  const fail = (message: string) => {
    redirect("/questions/new?error=" + encodeURIComponent(message));
  };

  if (typeof content !== "string" || !content.trim()) {
    fail("Vui lòng nhập nội dung câu hỏi.");
  }

  const grade = Number(gradeRaw);
  if (!Number.isInteger(grade) || grade < 6 || grade > 9) {
    fail("Khối lớp phải là số từ 6 đến 9.");
  }

  if (typeof difficultyRaw !== "string" || !DIFFICULTIES.includes(difficultyRaw)) {
    fail("Độ khó phải là DE, TB hoặc KHO.");
  }

  // Gom 4 ô nhập phương án lại thành một mảng, bỏ khoảng trắng thừa hai đầu.
  const options: string[] = [];
  for (let i = 0; i < 4; i++) {
    const option = formData.get(`option_${i}`);
    if (typeof option !== "string" || !option.trim()) {
      fail(`Vui lòng nhập đủ 4 phương án (còn thiếu phương án ${i + 1}).`);
    }
    options.push((option as string).trim());
  }

  // Hai phương án giống hệt nhau sẽ làm học sinh chọn đúng mà vẫn bị chấm sai,
  // vì bộ chấm chỉ so sánh chuỗi chứ không biết học sinh bấm vào ô nào.
  if (new Set(options).size !== options.length) {
    fail("Bốn phương án phải khác nhau, không được trùng nội dung.");
  }

  const correctIndex = Number(correctIndexRaw);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    fail("Vui lòng chọn phương án đúng.");
  }

  const supabase = createServerClient();

  const { data: inserted, error } = await supabase
    .from("questions")
    .insert({
      teacher_id: teacherId,
      kind: "MCQ",
      grade,
      difficulty: difficultyRaw as string,
      content: (content as string).trim(),
      options,
      correct_answer: options[correctIndex],
      explanation:
        typeof explanation === "string" && explanation.trim() ? explanation.trim() : null,
      source: typeof source === "string" && source.trim() ? source.trim() : null,
      // Chỉ có một GV nên không cần bước duyệt: lưu là dùng giao bài được ngay.
      // Trang giao bài chỉ đọc câu có status "da_duyet".
      status: "da_duyet",
    })
    .select("id")
    .single();

  if (error) {
    fail(`Không lưu được câu hỏi: ${error.message}`);
  }

  // Gắn kỹ năng (nếu GV có chọn). Câu hỏi vẫn dùng được nếu chưa gắn kỹ năng,
  // chỉ là sẽ không hiện lên khi lọc theo kỹ năng lúc giao bài.
  if (typeof skillTagId === "string" && skillTagId) {
    const { error: tagError } = await supabase.from("question_tags").insert({
      question_id: inserted!.id,
      skill_tag_id: skillTagId,
      is_primary: true,
    });

    if (tagError) {
      fail(`Đã lưu câu hỏi nhưng không gắn được kỹ năng: ${tagError.message}`);
    }
  }

  redirect("/questions?saved=1");
}
