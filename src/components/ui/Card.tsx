import { HTMLAttributes } from "react";
import { cx } from "../../utils/helpers";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-[24px] bg-white border border-[#dfd6c5] shadow-[0_5px_14px_rgba(93,84,73,0.05)]", className)} {...props} />;
}
