"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher({ currentLocale = "fr" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (locale) => {
    document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLanguage("fr")}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
          currentLocale === "fr"
            ? "bg-[var(--color-red)] text-white"
            : "text-[var(--color-muted)] hover:text-[var(--color-red)]"
        }`}
        disabled={isPending}
      >
        FR
      </button>
      <button
        onClick={() => switchLanguage("en")}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
          currentLocale === "en"
            ? "bg-[var(--color-red)] text-white"
            : "text-[var(--color-muted)] hover:text-[var(--color-red)]"
        }`}
        disabled={isPending}
      >
        EN
      </button>
    </div>
  );
}
