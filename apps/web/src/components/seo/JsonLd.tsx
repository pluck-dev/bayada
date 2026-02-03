import { SITE_URL, SITE_NAME } from "@/lib/seo";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/** 범용 JSON-LD 스크립트 삽입 컴포넌트 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization 구조화 데이터 */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        alternateName: ["BAYADA Home Health Care Korea", "바야다홈헬스케어"],
        url: SITE_URL,
        logo: `${SITE_URL}/images/brand/logo.png`,
        description:
          "BAYADA 홈헬스케어 - 가정에서 받는 최고의 간호 및 돌봄 서비스",
        address: {
          "@type": "PostalAddress",
          addressCountry: "KR",
        },
        sameAs: [],
      }}
    />
  );
}

/** WebSite 구조화 데이터 (검색 엔진 사이트링크 검색상자) */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "ko",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/ko/blog?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** BreadcrumbList 구조화 데이터 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

/** Article 구조화 데이터 (블로그 포스트용) */
export function ArticleJsonLd({
  title,
  description,
  url,
  publishedTime,
  author,
  image,
}: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  author: string;
  image?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        datePublished: publishedTime,
        author: {
          "@type": "Organization",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/images/brand/logo.png`,
          },
        },
        ...(image && {
          image: {
            "@type": "ImageObject",
            url: image,
          },
        }),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      }}
    />
  );
}

/** FAQPage 구조화 데이터 */
export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

/** Service 구조화 데이터 */
export function ServiceJsonLd({
  name,
  description,
  url,
  provider,
}: {
  name: string;
  description: string;
  url: string;
  provider?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name,
        description,
        url,
        provider: {
          "@type": "Organization",
          name: provider || SITE_NAME,
        },
      }}
    />
  );
}
