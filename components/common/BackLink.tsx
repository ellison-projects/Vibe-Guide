import Link from "next/link";

type BackLinkProps = {
  href: string;
  label: string;
};

export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-white"
    >
      <span aria-hidden>↩</span>
      {label}
    </Link>
  );
}
