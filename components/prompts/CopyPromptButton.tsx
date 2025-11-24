"use client";

import { useEffect, useState } from "react";

type CopyPromptButtonProps = {
  prompt: string;
};

export default function CopyPromptButton({ prompt }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy prompt", error);
    }
  };

  return (
    <button
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400/90 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300"
      onClick={handleCopy}
      aria-live="polite"
    >
      {copied ? "Copied" : "Copy prompt"}
    </button>
  );
}
