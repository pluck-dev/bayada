import { cx } from "@/components/ui";

export function ProviderLogo({ name, logo, size = "sm" }: { name: string; logo: string | null; size?: "sm" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 text-body" : "h-8 w-8 text-caption";
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt="" className={cx(box, "shrink-0 rounded-lg border border-hairline bg-canvas object-contain")} />
  ) : (
    <span className={cx(box, "flex shrink-0 items-center justify-center rounded-md bg-surface-sunken font-semibold text-subtle")}>
      {name.slice(0, 1)}
    </span>
  );
}
