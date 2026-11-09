// 디자인 수정 중 텍스트 노드의 공백이 CSS 로 옮겨 가는 일이 많다.
// 저장된 발췌 확인은 유지하되 공백 차이는 무시한다.
export function matchesFeedbackText(actual: string | null, expected: string) {
  const normalize = (value: string) => value.replace(/[⋯…]/g, "...").replace(/\s+/g, "");
  return !expected || normalize(actual ?? "").startsWith(normalize(expected));
}

/**
 * 저장된 selector 로 요소를 다시 찾는다. 유일하게 맞고 텍스트가 같으면 그대로,
 * 아니면 탭 패널 키·마지막 태그 + 텍스트로 한 번 더 찾는다. 화면 좌표로 추측하지 않는다.
 * (원본의 페이지별 이전 규칙은 다른 사이트 전용이라 옮기지 않았다)
 */
export function resolveFeedbackTarget(selector: string, text = ""): Element | null {
  const query = (value: string) => {
    try { return [...document.querySelectorAll(value)].filter(e => !e.closest("[data-element-inspector]")); } catch { return []; }
  };
  const unique = (elements: Element[]) => elements.length === 1 ? elements[0] : null;
  const direct = unique(query(selector));
  if (direct && matchesFeedbackText(direct.textContent, text)) return direct;
  // React useId 는 새로고침마다 바뀐다 — 탭의 의미 있는 키만 남겨 찾는다
  const tab = selector.match(/^#[^ >]+-panel-([\w-]+)(.*)$/);
  if (tab) {
    const match = unique(query(`[role="tabpanel"][id$="-panel-${tab[1]}"]${tab[2]}`).filter(e => matchesFeedbackText(e.textContent, text)));
    if (match) return match;
  }
  if (!text.trim()) return null;
  const tag = selector.split(" > ").at(-1)?.match(/^([a-z][\w-]*)/i)?.[1];
  if (tag) {
    const match = unique(query(`main ${tag}`).filter(e => matchesFeedbackText(e.textContent, text)));
    if (match) return match;
  }
  return null;
}

export function revealFeedbackTarget(element: Element) {
  for (let parent: Element | null = element; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    if (parent.matches('[role="tabpanel"][hidden]')) {
      const tab = document.getElementById(parent.getAttribute("aria-labelledby") ?? "");
      if (tab instanceof HTMLButtonElement && tab.getAttribute("role") === "tab" && !tab.disabled) tab.click();
    }
  }
}
