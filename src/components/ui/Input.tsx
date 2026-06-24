import { InputHTMLAttributes } from "react";
import { cx } from "../../utils/helpers";

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("bg-transparent outline-none", className)} {...props} />;
}
