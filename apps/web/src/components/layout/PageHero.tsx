import Image from "next/image";
import { cn } from "@bayada/ui";
import { Container } from "./Container";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  className?: string;
}

export function PageHero({ title, subtitle, backgroundImage, className }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-[color:var(--surface)] py-20 lg:py-28", className)}>
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/90" />
      <Container className="relative">
        <h1 className="text-display-lg font-bold text-[color:var(--fg)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-body-lg text-[color:var(--muted)]">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}
