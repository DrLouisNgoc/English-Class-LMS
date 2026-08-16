import { getQuestions } from "@/lib/queries/questions";

export default async function QuestionsPage() {
  const questions = await getQuestions();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-semibold text-zinc-900">
        Ngân hàng câu hỏi
      </h1>

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
