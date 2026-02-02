import Link from "next/link";

interface CTABannerProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: "default" | "brand";
}

export function CTABanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant = "default",
}: CTABannerProps) {
  const isDefault = variant === "default";

  return (
    <div
      className={`rounded-2xl px-8 py-12 text-center ${
        isDefault
          ? "bg-[color:var(--surface)]"
          : "bg-[#ce0e2d]"
      }`}
    >
      <h2
        className={`text-2xl font-bold ${
          isDefault ? "text-[color:var(--fg)]" : "text-white"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mx-auto mt-3 max-w-lg text-sm ${
            isDefault ? "text-[color:var(--muted)]" : "text-white/80"
          }`}
        >
          {description}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href={primaryHref}
          className={`rounded-full px-8 py-3 text-sm font-semibold transition-colors ${
            isDefault
              ? "bg-[#ce0e2d] text-white hover:bg-[#b00c27]"
              : "bg-white text-[#ce0e2d] hover:bg-white/90"
          }`}
        >
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className={`rounded-full border px-8 py-3 text-sm font-medium transition-colors ${
              isDefault
                ? "border-[color:var(--border)] text-[color:var(--fg)] hover:bg-white"
                : "border-white/30 text-white hover:bg-white/10"
            }`}
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
