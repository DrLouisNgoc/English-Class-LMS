"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/session";

const DIFFICULTIES = ["DE", "TB", "KHO"];

// Các thông tin của một câu hỏi sau khi đã đọc và kiểm tra xong từ form.
type QuestionFields = {
  grade: number;
  difficulty: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  source: string | null;
  skillTagId: string | null;
};

// Đọc và kiểm tra dữ liệu form. Trả về lỗi dưới dạng chuỗi thay vì tự chuyển
// trang, để hai action thêm/sửa dùng chung được mà mỗi bên vẫn quay về đúng
// trang của mình khi có lỗi.
//
// LƯU Ý quan trọng: cột `options` lưu NGUYÊN VĂN các phương án, `correct_answer`
// lưu NGUYÊN VĂN phương án đúng. Bộ chấm điểm trong lib/actions/attempts.ts so
// sánh chuỗi học sinh chọn với `correct_answer`, nên hai cột phải khớp từng ký tự.
function readQuestionForm(
  formData: FormData,
): { ok: true; fields: QuestionFields } | { ok: false; message: string } {
  const content = formData.get("content");
  if (typeof content !== "string" || !content.trim()) {
    return { ok: false, message: "Vui lòng nhập nội dung câu hỏi." };
  }

  const grade = Number(formData.get("grade"));
  if (!Number.isInteger(grade) || grade < 6 || grade > 9) {
    return { ok: false, message: "Khối lớp phải là số từ 6 đến 9." };
  }

  const difficulty = formData.get("difficulty");
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty)) {
    return { ok: false, message: "Độ khó phải là Dễ, Trung bình hoặc Khó." };
  }

  // Gom 4 ô nhập phương án lại thành một mảng, bỏ khoảng trắng thừa hai đầu.
  const options: string[] = [];
  for (let i = 0; i < 4; i++) {
    const option = formData.get(`option_${i}`);
    if (typeof option !== "string" || !option.trim()) {
      return { ok: false, message: `Vui lòng nhập đủ 4 phương án (còn thiếu phương án ${i + 1}).` };
    }
    options.push(option.trim());
  }

  // Hai phương án giống hệt nhau sẽ làm học sinh chọn đúng mà vẫn bị chấm sai,
  // vì bộ chấm chỉ so sánh chuỗi chứ không biết học sinh bấm vào ô nào.
  if (new Set(options).size !== options.length) {
    return { ok: false, message: "Bốn phương án phải khác nhau, không được trùng nội dung." };
  }

  const correctIndex = Number(formData.get("correct_index"));
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return { ok: false, message: "Vui lòng chọn phương án đúng." };
  }

  const explanation = formData.get("explanation");
  const source = formData.get("source");
  const skillTagId = formData.get("skill_tag_id");

  return {
    ok: true,
    fields: {
      grade,
      difficulty,
      content: content.trim(),
      options,
      correctAnswer: options[correctIndex],
      explanation:
        typeof explanation === "string" && explanation.trim() ? explanation.trim() : null,
      source: typeof source === "string" && source.trim() ? source.trim() : null,
      skillTagId: typeof skillTagId === "string" && skillTagId ? skillTagId : null,
    },
  };
}

// Ghi kỹ năng chính của một câu hỏi: xoá dòng cũ rồi ghi dòng mới, để khi GV
// đổi kỹ năng thì không còn sót kỹ năng cũ. Trả về lỗi nếu có.
async function saveSkillTag(questionId: string, skillTagId: string | null) {
  const supabase = createServerClient();

  const { error: deleteError } = await supabase
    .from("question_tags")
    .delete()
    .eq("question_id", questionId)
    .eq("is_primary", true);

  if (deleteError) {
    return deleteError.message;
  }

  if (!skillTagId) {
    return null;
  }

  const { error: insertError } = await supabase.from("question_tags").insert({
    question_id: questionId,
    skill_tag_id: skillTagId,
    is_primary: true,
  });

  return insertError ? insertError.message : null;
}

// Server action GV thêm một câu hỏi trắc nghiệm vào ngân hàng.
export async function createQuestion(formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const parsed = readQuestionForm(formData);
  if (!parsed.ok) {
    redirect("/questions/new?error=" + encodeURIComponent(parsed.message));
  }

  const { fields } = parsed;
  const supabase = createServerClient();

  const { data: inserted, error } = await supabase
    .from("questions")
    .insert({
      teacher_id: teacherId,
      kind: "MCQ",
      grade: fields.grade,
      difficulty: fields.difficulty,
      content: fields.content,
      options: fields.options,
      correct_answer: fields.correctAnswer,
      explanation: fields.explanation,
      source: fields.source,
      // Chỉ có một GV nên không cần bước duyệt: lưu là dùng giao bài được ngay.
      // Trang giao bài chỉ đọc câu có status "da_duyet".
      status: "da_duyet",
    })
    .select("id")
    .single();

  if (error) {
    redirect(
      "/questions/new?error=" + encodeURIComponent(`Không lưu được câu hỏi: ${error.message}`),
    );
  }

  const tagError = await saveSkillTag(inserted!.id, fields.skillTagId);
  if (tagError) {
    redirect(
      "/questions/new?error=" +
        encodeURIComponent(`Đã lưu câu hỏi nhưng không gắn được kỹ năng: ${tagError}`),
    );
  }

  redirect("/questions?saved=1");
}

// Server action GV sửa một câu hỏi đã có. Dùng chung phần kiểm tra dữ liệu với
// createQuestion. Gọi bằng updateQuestion.bind(null, questionId) trong form.
export async function updateQuestion(questionId: string, formData: FormData) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const parsed = readQuestionForm(formData);
  if (!parsed.ok) {
    redirect(`/questions/${questionId}?error=` + encodeURIComponent(parsed.message));
  }

  const { fields } = parsed;
  const supabase = createServerClient();

  const { error } = await supabase
    .from("questions")
    .update({
      grade: fields.grade,
      difficulty: fields.difficulty,
      content: fields.content,
      options: fields.options,
      correct_answer: fields.correctAnswer,
      explanation: fields.explanation,
      source: fields.source,
    })
    .eq("id", questionId);

  if (error) {
    redirect(
      `/questions/${questionId}?error=` +
        encodeURIComponent(`Không sửa được câu hỏi: ${error.message}`),
    );
  }

  const tagError = await saveSkillTag(questionId, fields.skillTagId);
  if (tagError) {
    redirect(
      `/questions/${questionId}?error=` +
        encodeURIComponent(`Đã sửa câu hỏi nhưng không lưu được kỹ năng: ${tagError}`),
    );
  }

  redirect("/questions?updated=1");
}

// Một câu hỏi gửi lên từ màn hình xem trước của trang dán hàng loạt.
export type BulkQuestionInput = {
  content: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};

// Server action lưu một lô câu hỏi vừa dán và xem trước xong.
//
// Trang xem trước đã kiểm tra dữ liệu một lần rồi, nhưng ở đây vẫn kiểm tra
// lại: mọi thứ gửi từ trình duyệt lên đều có thể bị sửa, nên server không bao
// giờ tin sẵn.
export async function createQuestionsBulk(
  questions: BulkQuestionInput[],
  grade: number,
  difficulty: string,
  skillTagId: string | null,
): Promise<{ error: string } | void> {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "Không có câu hỏi nào để lưu." };
  }

  if (!Number.isInteger(grade) || grade < 6 || grade > 9) {
    return { error: "Khối lớp phải là số từ 6 đến 9." };
  }

  if (!DIFFICULTIES.includes(difficulty)) {
    return { error: "Độ khó không hợp lệ." };
  }

  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const soThuTu = i + 1;

    if (typeof question.content !== "string" || !question.content.trim()) {
      return { error: `Câu ${soThuTu} thiếu nội dung đề bài.` };
    }

    const options = Array.isArray(question.options)
      ? question.options.map((option) => String(option).trim())
      : [];

    if (options.length !== 4 || options.some((option) => !option)) {
      return { error: `Câu ${soThuTu} phải có đủ 4 phương án.` };
    }

    if (new Set(options).size !== options.length) {
      return { error: `Câu ${soThuTu} có hai phương án trùng nội dung.` };
    }

    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex > 3
    ) {
      return { error: `Câu ${soThuTu} chưa chọn đáp án đúng.` };
    }

    rows.push({
      teacher_id: teacherId,
      kind: "MCQ",
      grade,
      difficulty,
      content: question.content.trim(),
      options,
      correct_answer: options[question.correctIndex],
      explanation:
        typeof question.explanation === "string" && question.explanation.trim()
          ? question.explanation.trim()
          : null,
      status: "da_duyet",
    });
  }

  const supabase = createServerClient();

  const { data: inserted, error } = await supabase.from("questions").insert(rows).select("id");

  if (error) {
    return { error: `Không lưu được: ${error.message}` };
  }

  // Gắn cùng một kỹ năng cho cả lô (nếu GV có chọn).
  if (skillTagId && inserted) {
    const { error: tagError } = await supabase.from("question_tags").insert(
      inserted.map((row) => ({
        question_id: row.id,
        skill_tag_id: skillTagId,
        is_primary: true,
      })),
    );

    if (tagError) {
      return { error: `Đã lưu câu hỏi nhưng không gắn được kỹ năng: ${tagError.message}` };
    }
  }

  redirect(`/questions?imported=${rows.length}`);
}

// Server action GV xoá một câu hỏi.
//
// Câu hỏi đã được giao trong bài tập thì KHÔNG xoá được, vì các bảng
// assignment_questions và answers còn trỏ tới nó — xoá đi sẽ hỏng dữ liệu bài
// cũ của học sinh. Trường hợp đó chuyển sang ẩn câu hỏi (status = "an"): nó
// biến mất khỏi trang giao bài nhưng bài cũ vẫn nguyên vẹn.
export async function deleteQuestion(questionId: string) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const supabase = createServerClient();

  const { count, error: usageError } = await supabase
    .from("assignment_questions")
    .select("question_id", { count: "exact", head: true })
    .eq("question_id", questionId);

  if (usageError) {
    redirect(
      "/questions?error=" +
        encodeURIComponent(`Không kiểm tra được câu hỏi: ${usageError.message}`),
    );
  }

  if (count && count > 0) {
    const { error } = await supabase
      .from("questions")
      .update({ status: "an" })
      .eq("id", questionId);

    if (error) {
      redirect("/questions?error=" + encodeURIComponent(`Không ẩn được câu hỏi: ${error.message}`));
    }

    redirect("/questions?hidden=1");
  }

  // Chưa dùng ở đâu: xoá thật. Phải xoá dòng trong question_tags trước vì bảng
  // đó trỏ tới questions (database không tự xoá theo).
  const { error: tagError } = await supabase
    .from("question_tags")
    .delete()
    .eq("question_id", questionId);

  if (tagError) {
    redirect(
      "/questions?error=" +
        encodeURIComponent(`Không xoá được kỹ năng của câu hỏi: ${tagError.message}`),
    );
  }

  const { error } = await supabase.from("questions").delete().eq("id", questionId);

  if (error) {
    redirect("/questions?error=" + encodeURIComponent(`Không xoá được câu hỏi: ${error.message}`));
  }

  redirect("/questions?deleted=1");
}
