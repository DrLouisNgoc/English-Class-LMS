import { createHmac, timingSafeEqual } from "node:crypto";

// Học sinh không dùng Supabase Auth (không có email) — tự ký 1 cookie riêng
// để nhớ "học sinh nào đang đăng nhập". Cookie chứa student_id + hạn dùng +
// chữ ký HMAC, để không ai tự sửa cookie giả mạo thành học sinh khác.
export const STUDENT_SESSION_COOKIE = "student_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 ngày

function getSecret(): string {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) {
    throw new Error("Thiếu STUDENT_SESSION_SECRET trong .env.local");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

// Tạo giá trị cookie cho 1 học sinh vừa đăng nhập thành công.
export function createStudentSessionValue(studentId: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${studentId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export const STUDENT_SESSION_MAX_AGE = MAX_AGE_SECONDS;

// Kiểm tra cookie có hợp lệ không (chữ ký đúng + chưa hết hạn). Trả về
// student_id nếu hợp lệ, null nếu không (cookie giả, bị sửa, hoặc hết hạn).
export function verifyStudentSessionValue(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;

  const parts = cookieValue.split(".");
  if (parts.length !== 3) return null;

  const [studentId, expiresAtRaw, signature] = parts;
  const payload = `${studentId}.${expiresAtRaw}`;
  const expectedSignature = sign(payload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return studentId;
}
