"use client";

/**
 * 커스텀 컨트롤의 폼 값. name 이 있으면 FormData 로 전송된다.
 * required 이면 hidden 대신 화면 밖 텍스트 입력을 써서 브라우저 제약 검증에 참여시키고,
 * FormGuard 가 invalid 이벤트를 가로채 data-proxy-for 의 트리거 옆에 디자인된 말풍선을 띄운다.
 */
export function FormValue({
  name,
  value,
  required,
  proxyFor,
}: {
  name?: string;
  value: string;
  required?: boolean;
  proxyFor: string;
}) {
  if (!name && !required) return null;
  if (!required) return <input type="hidden" name={name} value={value} />;
  return (
    <input
      name={name}
      value={value}
      required
      readOnly={false}
      onChange={() => {}}
      tabIndex={-1}
      aria-hidden
      data-proxy-for={proxyFor}
      className="pointer-events-none absolute bottom-0 left-4 size-px opacity-0"
    />
  );
}
