import { ReactNode } from "react";

export default function PageContainer({ children }: { children: ReactNode }) {
  return <main className="flex-1 overflow-y-auto overflow-x-hidden px-10 pt-9 pb-40 custom-scrollbar max-[520px]:px-4 max-[520px]:pt-6 max-[520px]:pb-32">{children}</main>;
}
