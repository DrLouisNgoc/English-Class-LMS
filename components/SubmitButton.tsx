"use client";

// "use client": useFormStatus chỉ chạy được trong trình duyệt.
// Component này phải được đặt BÊN TRONG một thẻ <form> thì mới hoạt động —
// nó tự "nghe" xem form cha có đang submit hay không, không cần truyền props.

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
};

export default function SubmitButton({ children, pendingText, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
