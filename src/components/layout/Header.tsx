import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold font-serif tracking-wide">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#a0907d]">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
