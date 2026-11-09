// 로그인·가입·비밀번호 재설정 — 요청마다 세션을 읽는다(정적 생성 안 함)
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f8f9fa] px-4 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-[480px]">{children}</div>
    </div>
  );
}
