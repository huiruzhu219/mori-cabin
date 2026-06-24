import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  children: ReactNode;
}

export default function Modal({ open, children }: ModalProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] bg-[#5d5449]/40 backdrop-blur-sm flex items-center justify-center p-5">{children}</div>;
}
