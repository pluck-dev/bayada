// 로그인·비밀번호 재설정 화면 공통 틀 (왼쪽 브랜드 패널 + 오른쪽 폼) — 로그인 화면과 같은 구성
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-side p-10 text-zinc-400 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">B</span>
          <span className="text-[14px] font-semibold text-white">Bayada Academy</span>
        </div>
        <div>
          <p className="text-[22px] font-semibold leading-snug tracking-[-0.02em] text-white">
            프로그램 등록부터 승인·게시까지,
            <br />
            아카데미 운영 콘솔
          </p>
          <p className="mt-3 text-[13px] leading-relaxed">재설정 링크는 30분 동안, 한 번만 쓸 수 있습니다.</p>
        </div>
        <p className="text-[12px] text-zinc-600">&copy; BAYADA Home Health Care</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[340px]">{children}</div>
      </div>
    </div>
  );
}
