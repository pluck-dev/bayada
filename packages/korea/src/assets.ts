const roots = [
  ['/wp-content/uploads/', '/assets/media/'],
  ['/wp-content/plugins/', '/assets/vendor/'],
  ['/wp-content/themes/', '/assets/theme/'],
  ['/wp-includes/', '/assets/runtime/'],
] as const;

/** Accept old saved links without retaining the old layout in public output. */
export function normalizeAssetPaths(text: string): string {
  let value = text.replace(/https?:\/\/(?:i[0-3]\.wp\.com\/)?(?:www\.)?bayadakorea\.com(?=\/wp-(?:content|includes)\/)/gi, '');
  value = value.replace(/https?:\/\/(?:korea\.54-116-157-4\.sslip\.io|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)(?=\/wp-(?:content|includes)\/)/gi, '');
  for (const origin of ['https:\\/\\/www.bayadakorea.com', 'http:\\/\\/www.bayadakorea.com', 'https:\\/\\/bayadakorea.com', 'http:\\/\\/bayadakorea.com']) {
    value = value.replaceAll(origin + '\\/wp-', '\\/wp-');
  }
  for (const [oldRoot, newRoot] of roots) {
    value = value.replaceAll('sourceURL=' + oldRoot, 'sourceURL=' + newRoot);
    const escape = (root: string) => root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefix = String.raw`(?<![\w.:/\\?=&%~-])`;
    value = value.replace(new RegExp(prefix + escape(oldRoot), 'g'), newRoot)
      .replace(new RegExp(prefix + escape(oldRoot.replaceAll('/', '\\/')), 'g'), () => newRoot.replaceAll('/', '\\/'));
    const boundary = String.raw`(?=$|[?#"'\s<>)]|\\["'])`;
    for (const escaped of [false, true]) {
      const oldBase = oldRoot.slice(0, -1), newBase = newRoot.slice(0, -1);
      value = value.replace(new RegExp(prefix + escape(escaped ? oldBase.replaceAll('/', '\\/') : oldBase) + boundary, 'g'), () => escaped ? newBase.replaceAll('/', '\\/') : newBase);
    }
  }
  return value.replace(/(\/assets\/[^\s"'<>\\)?]+)\?([^\s"'<>\\)#]*)/g, (_, path: string, raw: string) => {
    const query = new URLSearchParams(raw.replaceAll('&amp;', '&'));
    for (const key of ['fit', 'resize', 'ssl', 'w', 'h', 'quality', 'strip']) query.delete(key);
    const suffix = query.toString();
    return path + (suffix ? '?' + (raw.includes('&amp;') ? suffix.replaceAll('&', '&amp;') : suffix) : '');
  });
}

export function normalizeAssetData<T>(value: T): T {
  if (typeof value === 'string') return normalizeAssetPaths(value) as T;
  if (Array.isArray(value)) return value.map(normalizeAssetData) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeAssetData(item)])) as T;
  return value;
}
