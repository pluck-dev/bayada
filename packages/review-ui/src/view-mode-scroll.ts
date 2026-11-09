// Match semantic sections before falling back to total document progress. This
// keeps sticky heroes aligned even when mobile content has a different height.
export function alignScroll(source: Window, target: Window) {
  if (source.location.pathname !== target.location.pathname) return;
  const header = (win: Window) => win.document.querySelector("body > header")?.getBoundingClientRect().height ?? 0;
  const sourceY = source.scrollY + header(source);
  const sections = [...source.document.querySelectorAll<HTMLElement>("main [data-feedback-key], main section, main .document-content > div")]
    .filter(el => !el.closest("[data-element-inspector]") && !["fixed", "sticky"].includes(source.getComputedStyle(el).position));
  let anchor: { element: HTMLElement; top: number; peer: Element } | undefined;
  for (const element of sections) {
    const rect = element.getBoundingClientRect(), top = rect.top + source.scrollY;
    if (rect.height < 1 || top > sourceY + 1 || (anchor && top < anchor.top)) continue;
    const key = element.getAttribute("data-feedback-key");
    const group = element.matches("main .document-content > div") ? "main .document-content > div" : "main section";
    const index = [...source.document.querySelectorAll(group)].indexOf(element);
    const peer = key ? [...target.document.querySelectorAll("main [data-feedback-key]")].find(el => el.getAttribute("data-feedback-key") === key)
      : target.document.querySelectorAll(group)[index];
    // Desktop navigation sections may exist but be hidden on mobile. They
    // cannot anchor a visible scroll position in the other viewport.
    if (peer && peer.getBoundingClientRect().height > 0) anchor = { element, top, peer };
  }
  let y: number;
  if (anchor) {
    const progress = Math.max(0, Math.min(1, (sourceY - anchor.top) / Math.max(1, anchor.element.getBoundingClientRect().height)));
    const rect = anchor.peer.getBoundingClientRect();
    y = rect.top + target.scrollY + progress * rect.height - header(target);
  } else {
    const range = Math.max(1, source.document.documentElement.scrollHeight - source.innerHeight);
    y = source.scrollY / range * Math.max(0, target.document.documentElement.scrollHeight - target.innerHeight);
  }
  target.scrollTo({ top: Math.max(0, y), behavior: "instant" });
}


export function framePath(win: Window | null | undefined) {
  try {
    if (!win || win.location.origin !== window.location.origin) return null;
    const url = new URL(win.location.href);url.searchParams.delete('__viewframe');
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}
export function previewUrl(path: string) {
  const url = new URL(path, window.location.origin);url.searchParams.set('__viewframe', '1');
  return url.pathname + url.search + url.hash;
}
