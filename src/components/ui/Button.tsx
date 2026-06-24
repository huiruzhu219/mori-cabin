import { ButtonHTMLAttributes } from "react";
import { cx } from "../../utils/helpers";

export default function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cx("rounded-full font-bold transition-all active:scale-95", className)} {...props} />;
}
