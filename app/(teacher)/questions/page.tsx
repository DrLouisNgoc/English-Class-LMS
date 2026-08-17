import { getQuestions } from "@/lib/queries/questions";
import { signOutTeacher } from "@/lib/actions/auth";

export default async function QuestionsPage() {
  const questions = await getQuestions();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">
          Ngân hàng câu hỏi
        </h1>
        <form action={signOutTeacher}>
          <button type="submit" className="text-sm text-zinc-500 underline">
            Đăng xuất
          </button>
        </form>
      </div>

      {questions.length === 0 ? (
        <p className="text-zinc-500">Chưa có câu hỏi nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded border border-zinc-200 p-4"
            >
              <p className="text-sm text-zinc-500">
                Khối {question.grade} · {question.difficulty} · {question.kind}
              </p>
              <p className="mt-1 text-zinc-900">{question.content}</p>
              <p className="mt-1 text-sm text-emerald-700">
                Đáp án: {question.correct_answer}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
