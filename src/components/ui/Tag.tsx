import { HTMLAttributes } from "react";
import { cx } from "../../utils/helpers";

export default function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("rounded-full px-3 py-1 text-xs font-bold", className)} {...props} />;
}
