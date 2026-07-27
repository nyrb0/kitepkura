"use client";

import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaWhatsapp,
  FaLink,
} from "react-icons/fa";

interface SocialShareProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function SocialShare({
  title = "Kitepkura",
  description = "Сынакты бөлүшүңүз",
  className = "",
}: SocialShareProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const currentUrl = shareUrl || "";
  const shareText = `${title}${description ? ` — ${description}` : ""}`;

  const openShare = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=700");
  };

  const handleCopy = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-8 ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted sm:text-xs">
            БӨЛҮШҮҮ
          </p>

          <h2 className="mt-1 text-lg font-semibold text-text sm:text-xl">
            Башкалар менен бөлүшүңүз
          </h2>

          <p className="mt-2 text-sm leading-5 text-text-muted">
            Бул сынакты досторуңуз менен бөлүшүңүз.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              openShare(
                `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-lg text-text transition hover:bg-neutral-50"
            aria-label="Telegram аркылуу бөлүшүү"
          >
            <FaTelegramPlane />
          </button>

          <button
            type="button"
            onClick={() =>
              openShare(
                `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`,
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-lg text-text transition hover:bg-neutral-50"
            aria-label="WhatsApp аркылуу бөлүшүү"
          >
            <FaWhatsapp />
          </button>

          <button
            type="button"
            onClick={() =>
              openShare(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-lg text-text transition hover:bg-neutral-50"
            aria-label="Facebook аркылуу бөлүшүү"
          >
            <FaFacebookF />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
            aria-label="Шилтемени көчүрүү"
          >
            <FaLink />
            <span>{copied ? "Көчүрүлдү" : "Шилтеме"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
