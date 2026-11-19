import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { quarantine } from "@bayada/korea/server";
export default async function ArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requirePage("korea.content", locale);
  return <><PageHeader title="원본 공개 이관 검토" description="원본의 미분류 게시글입니다. 광고성·무관한 자료가 섞여 있어 공개 이관에서 분리했습니다. 원본 백업은 보존되어 있습니다." /><p className="mb-4 text-sm">검토 대기 {quarantine.length}개 · 원본 사이트 삭제 없음</p><div className="overflow-x-auto rounded-xl border border-line"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">원본 ID</th><th className="p-3">제목</th></tr></thead><tbody>{quarantine.map(item => <tr key={item.legacyId} className="border-t border-line"><td className="p-3">{item.legacyId}</td><td className="p-3">{item.title}</td></tr>)}</tbody></table></div></>;
}
