import { cx } from "@/components/ui";

export function ProviderLogo({ name, logo, size = "sm" }: { name: string; logo: string | null; size?: "sm" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 text-[16px]" : "h-8 w-8 text-[12px]";
  return logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt="" className={cx(box, "shrink-0 rounded-md border border-line bg-white object-contain")} />
  ) : (
    <span className={cx(box, "flex shrink-0 items-center justify-center rounded-md bg-zinc-100 font-semibold text-zinc-500")}>
      {name.slice(0, 1)}
    </span>
  );
}
