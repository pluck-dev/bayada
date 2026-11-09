import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { getSiteInfo } from "@/lib/web-content";
import { ContactForm } from "./ContactClient";

// 전화·이메일·오시는 길은 어드민 웹사이트 > 사이트 정보 값. 폼 접수는 lib/inquiry.ts (문의 CRM)
export default async function ContactPage() {
  const site = await getSiteInfo();
  return (
    <>
      <PageHero title="Contact Us" subtitle="서비스 문의 신청" />
      <section className="py-[var(--section-gap)]">
        <Container>
          <ContactForm site={site} />
        </Container>
      </section>
    </>
  );
}
