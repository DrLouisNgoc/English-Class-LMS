import NotebookPage from "@/components/NotebookPage";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/supabase/session";
import { getQuestionById, getSkillTags } from "@/lib/queries/questions";
import { updateQuestion } from "@/lib/actions/questions";
import QuestionForm from "@/components/QuestionForm";
import DeleteQuestionButton from "@/components/DeleteQuestionButton";

// Không prerender tĩnh lúc build — trang đọc dữ liệu theo người đang đăng nhập.
export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const teacherId = await getCurrentUserId();
  if (!teacherId) {
    redirect("/teacher-login");
  }

  const { id } = await params;
  const { error } = await searchParams;

  const question = await getQuestionById(id);
  if (!question) {
    redirect("/questions");
  }

  const skillTags = await getSkillTags();

  // Trong database chỉ lưu nguyên văn đáp án đúng, không lưu vị trí. Tìm xem
  // nó đang là phương án thứ mấy để tích sẵn ô tròn tương ứng trong form.
  const correctIndex = question.options.indexOf(question.correct_answer);

  // updateQuestion nhận 2 tham số (id câu hỏi và dữ liệu form). bind gắn sẵn
  // tham số đầu, để form chỉ cần gửi dữ liệu như một action bình thường.
  const updateThisQuestion = updateQuestion.bind(null, id);

  return (
    <NotebookPage width="narrow">
      <Link href="/questions" className="text-sm text-text/60 underline hover:text-ink">
        ← Ngân hàng câu hỏi
      </Link>

      <h1 className="font-display mt-2 mb-1 text-xl font-semibold text-ink md:text-2xl">
        Sửa câu hỏi
      </h1>
      <p className="mb-4 text-sm text-text/60">
        Sửa xong bấm Lưu thay đổi. Điểm các bài học sinh đã nộp trước đó giữ nguyên, không chấm lại.
      </p>

      {question.status === "an" && (
        <p className="mb-4 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-dark">
          Câu hỏi này đang ẩn nên không hiện ra khi giao bài mới. Bài tập cũ vẫn dùng bình thường.
        </p>
      )}

      {correctIndex === -1 && (
        <p className="mb-4 rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          Đáp án đúng đang lưu trong máy không khớp với phương án nào bên dưới. Hãy tích lại phương
          án đúng rồi lưu, nếu không học sinh sẽ bị chấm sai.
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-pen/40 bg-red-pen/5 px-3 py-2 text-sm text-red-pen">
          {error}
        </p>
      )}

      <QuestionForm
        action={updateThisQuestion}
        skillTags={skillTags}
        submitLabel="Lưu thay đổi"
        pendingLabel="Đang lưu…"
        values={{
          content: question.content,
          options: question.options,
          correctIndex: correctIndex === -1 ? null : correctIndex,
          explanation: question.explanation,
          source: question.source,
          grade: question.grade,
          difficulty: question.difficulty,
          skillTagId: question.skill_tag_id,
        }}
        extraAction={<DeleteQuestionButton questionId={id} />}
      />
    </NotebookPage>
  );
}
