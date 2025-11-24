import Link from "next/link";

type MissingStateProps = {
  label: string;
  description: string;
  href: string;
  ctaLabel?: string;
};

export default function MissingState({
  label,
  description,
  href,
  ctaLabel = "Go home",
}: MissingStateProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-dashed border-slate-800 bg-slate-900/70 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="text-base text-slate-300">{description}</p>
      <Link
        href={href}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-emerald-400 hover:text-white"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
