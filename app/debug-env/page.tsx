// Trang tạm để kiểm tra biến môi trường có đọc được trên Vercel không —
// chỉ in true/false, KHÔNG in giá trị thật. Xoá file này sau khi debug xong.
export const dynamic = "force-dynamic";

export default function DebugEnvPage() {
  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STUDENT_SESSION_SECRET: process.env.STUDENT_SESSION_SECRET,
  };

  return (
    <div className="p-6 font-mono text-sm">
      <h1 className="mb-4 text-lg font-bold">Debug biến môi trường</h1>
      <ul>
        {Object.entries(vars).map(([key, value]) => (
          <li key={key}>
            {key}: {value ? `CÓ (dài ${value.length} ký tự)` : "KHÔNG CÓ"}
          </li>
        ))}
      </ul>
    </div>
  );
}
