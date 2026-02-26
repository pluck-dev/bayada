import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/Container";

export const metadata = createMetadata({
  title: "이용약관",
  description: "바야다홈헬스케어 서비스 이용약관",
  path: "/ko/terms",
  noIndex: true,
});

const sections = [
  {
    id: "article-1",
    title: "제1조 (목적)",
    content: [
      "이 약관은 바야다홈헬스케어(이하 \"회사\")가 운영하는 웹사이트 및 관련 서비스(이하 \"서비스\")를 이용함에 있어 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
    ],
  },
  {
    id: "article-2",
    title: "제2조 (정의)",
    content: [
      "이 약관에서 사용하는 용어의 정의는 다음과 같습니다.",
      "① \"서비스\"란 회사가 제공하는 홈헬스케어 정보 제공, 상담 신청, 교육 콘텐츠 등 일체의 온라인 서비스를 의미합니다.",
      "② \"이용자\"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.",
      "③ \"회원\"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 이용할 수 있는 자를 의미합니다.",
      "④ \"비회원\"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.",
    ],
  },
  {
    id: "article-3",
    title: "제3조 (약관의 효력 및 변경)",
    content: [
      "① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.",
      "② 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.",
      "③ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다. 변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용하는 경우 약관의 변경 사항에 동의한 것으로 간주합니다.",
    ],
  },
  {
    id: "article-4",
    title: "제4조 (서비스의 제공)",
    content: [
      "① 회사는 다음과 같은 서비스를 제공합니다.",
      "   1. 홈헬스케어 서비스 정보 제공",
      "   2. 서비스 상담 신청 및 연결",
      "   3. 건강 관련 교육 콘텐츠 및 강의 제공",
      "   4. 시니어 케어 관련 커뮤니티 및 정보 서비스",
      "   5. 기타 회사가 추가 개발하거나 제휴를 통해 이용자에게 제공하는 서비스",
      "② 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 점검 등의 사유로 일시적으로 서비스가 중단될 수 있습니다.",
    ],
  },
  {
    id: "article-5",
    title: "제5조 (회원가입 및 관리)",
    content: [
      "① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.",
      "② 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 거부할 수 있습니다.",
      "   1. 실명이 아니거나 타인의 정보를 이용한 경우",
      "   2. 허위 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우",
      "   3. 이전에 약관 위반으로 자격을 상실한 경우",
      "③ 회원은 등록 사항에 변경이 있는 경우, 즉시 온라인으로 수정하거나 전자우편을 통해 회사에 변경사항을 통보해야 합니다.",
    ],
  },
  {
    id: "article-6",
    title: "제6조 (개인정보 보호)",
    content: [
      "① 회사는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다.",
      "② 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우 및 서비스 제공을 위해 필요한 최소한의 범위 내에서 업무 위탁 시에는 예외로 합니다.",
      "③ 개인정보의 수집·이용 목적, 수집 항목, 보유·이용 기간 등 상세한 내용은 개인정보처리방침을 통해 확인할 수 있습니다.",
    ],
  },
  {
    id: "article-7",
    title: "제7조 (회원의 의무)",
    content: [
      "① 이용자는 다음 행위를 하여서는 안 됩니다.",
      "   1. 신청 또는 변경 시 허위 내용의 등록",
      "   2. 타인의 정보 도용",
      "   3. 회사가 게시한 정보의 변경",
      "   4. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시",
      "   5. 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해",
      "   6. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위",
      "   7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위",
    ],
  },
  {
    id: "article-8",
    title: "제8조 (서비스 이용 제한)",
    content: [
      "① 회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.",
      "② 회사는 전항에도 불구하고, 개인정보 도용 및 결제사기, 불법프로그램의 제공 및 운영, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」을 위반한 불법통신 및 해킹 등의 경우 즉시 영구이용정지를 할 수 있습니다.",
    ],
  },
  {
    id: "article-9",
    title: "제9조 (책임 제한)",
    content: [
      "① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.",
      "② 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.",
      "③ 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.",
    ],
  },
  {
    id: "article-10",
    title: "제10조 (분쟁 해결)",
    content: [
      "① 회사는 이용자로부터 제출되는 불만사항 및 의견을 우선적으로 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보합니다.",
      "② 이 약관에 관한 분쟁은 대한민국 법령에 의하고, 분쟁에 관한 소송은 회사의 본사 소재지 관할 법원에 제기합니다.",
      "③ 기타 이 약관에서 정하지 않은 사항은 관계 법령 및 상관습에 따릅니다.",
    ],
  },
];

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await getDictionary(locale as Locale);

  return (
    <>
      {/* Hero */}
      <section className="bg-[color:var(--surface)] py-16 lg:py-20">
        <Container>
          <h1 className="text-display-lg font-bold text-[color:var(--fg)]">
            이용약관
          </h1>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            최종 수정일: 2026년 1월 1일
          </p>
        </Container>
      </section>

      {/* Body */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="flex gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                  목차
                </p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted)]">
                본 약관은 바야다홈헬스케어가 제공하는 서비스의 이용과 관련하여 회사와
                이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정합니다.
                서비스를 이용하시기 전에 본 약관을 주의 깊게 읽어주시기 바랍니다.
              </div>

              <div className="mt-10 space-y-12">
                {sections.map((s) => (
                  <article key={s.id} id={s.id} className="scroll-mt-8">
                    <h2 className="text-lg font-bold text-[color:var(--fg)]">
                      <span className="mr-2 inline-block h-1 w-1 rounded-full bg-[#ce0e2d] align-middle" />
                      {s.title}
                    </h2>
                    <div className="mt-4 space-y-2">
                      {s.content.map((line, i) => (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed text-[color:var(--muted)] ${
                            line.startsWith("   ") ? "pl-6" : ""
                          }`}
                        >
                          {line.trimStart()}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-16 rounded-xl border border-[color:var(--border)] p-6">
                <p className="text-sm font-semibold text-[color:var(--fg)]">
                  문의처
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  이용약관에 관한 문의사항은 아래 연락처로 문의주시기 바랍니다.
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  전화: <span className="font-medium text-[color:var(--fg)]">1670-1379</span>
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  이메일:{" "}
                  <a
                    href="mailto:info@bayada.co.kr"
                    className="font-medium text-[#ce0e2d] hover:underline"
                  >
                    info@bayada.co.kr
                  </a>
                </p>
              </div>
            </main>
          </div>
        </Container>
      </section>
    </>
  );
}
