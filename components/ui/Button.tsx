import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]";

const variants = {
  primary: "bg-brand-500 text-ink-900 shadow-lg shadow-brand-500/20 hover:bg-brand-400",
  ghost: "border border-white/15 text-white hover:bg-white/5",
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
