"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RegenerateButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRegenerate = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleRegenerate}
      disabled={isPending}
      className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        className={`h-4 w-4 transition-transform group-hover:rotate-180 ${
          isPending ? "animate-spin" : ""
        }`}
      />
      {isPending ? "Checking the vibes..." : "Regenerate Vibe"}
    </button>
  );
}
