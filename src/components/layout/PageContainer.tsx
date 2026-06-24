import { ReactNode } from "react";

export default function PageContainer({ children }: { children: ReactNode }) {
  return <main className="flex-1 overflow-y-auto px-10 pt-9 pb-40 custom-scrollbar max-[520px]:px-5">{children}</main>;
}
