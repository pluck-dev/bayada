// 로그인·비밀번호 재설정 화면 공통 틀 — 왼쪽 검정 브랜드 면 + 오른쪽 콘솔 회색 위 흰 카드
export function AuthShell({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-console">
      <div className="relative hidden w-[58%] max-w-[880px] shrink-0 flex-col justify-between overflow-hidden bg-side px-12 py-12 lg:flex">
        <div className="flex items-center gap-2">
          <span className="text-[24px] font-black leading-none tracking-[-0.045em] text-white">
            BAYADA<span className="text-brand">.</span>
          </span>
          <span className="rounded-full bg-brand px-2 py-[3px] text-[10.5px] font-extrabold leading-none tracking-[0.02em] text-white">ADMIN</span>
        </div>
        <p className="select-none text-[clamp(64px,8.4vw,128px)] font-black leading-[0.92] tracking-[-0.055em] text-white" aria-hidden>
          CARE
          <br />
          <span className="text-brand">CONSOLE.</span>
        </p>
        <p className="max-w-[440px] text-[13.5px] leading-[1.65] text-white/55">
          {note ?? "바야다코리아·리뉴얼 브랜드·아카데미를 함께 운영하는 관리자 전용 공간입니다. 콘텐츠 변경은 감사 로그에 남습니다."}
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px] animate-sheet-in rounded-[28px] bg-canvas p-9 shadow-[0_24px_60px_-30px_rgb(21_20_20/0.25)]">
          <div className="mb-7 flex items-center gap-2 lg:hidden">
            <span className="text-[20px] font-black tracking-[-0.045em]">
              BAYADA<span className="text-brand">.</span>
            </span>
            <span className="rounded-full bg-brand px-2 py-[3px] text-[10px] font-extrabold text-white">ADMIN</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/** 인증 화면 제목 + 설명 */
export function AuthTitle({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <>
      <h1 className="text-[24px] font-extrabold tracking-[-0.035em] text-ink">{title}</h1>
      {description && <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted">{description}</p>}
    </>
  );
}

/** 인증 화면 오류 띠 */
export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mt-5 animate-pop-in rounded-2xl bg-pill-danger/70 px-4 py-3 text-[13px] font-medium leading-[1.55] text-danger">
      {children}
    </div>
  );
}
