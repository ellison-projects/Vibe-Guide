import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  id: string;
  label: ReactNode;
  href?: string;
  isCurrent?: boolean;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="rounded-3xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2">
            {item.href && !item.isCurrent ? (
              <Link
                href={item.href}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-400 transition hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className={item.isCurrent ? "text-white" : "text-slate-400"}>{item.label}</span>
            )}
            {index < items.length - 1 && <span className="text-slate-700">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
