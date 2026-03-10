import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { createMetadata } from "@/lib/seo";
import { EmployeesClient } from "./EmployeesClient";

export const metadata = createMetadata({
  title: "임직원 포털",
  description:
    "바야다홈헬스케어 임직원을 위한 포털입니다. 로그인, 추천인 제도, 교육 자료를 확인하세요.",
  path: "/ko/employees",
});

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <PageHero
        title="Employee Portal"
        subtitle="바야다홈헬스케어 임직원 전용 포털"
        backgroundImage="/images/about/banner.jpg"
      />

      <section className="py-[var(--section-gap)]">
        <Container>
          <EmployeesClient locale={locale} />
        </Container>
      </section>
    </>
  );
}
