"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink, ImageIcon, Upload } from 'lucide-react';
import { safeUrl } from '@bayada/korea';
import { Button, Disclosure, inputClass } from '@/components/ui';
import { useFeedback } from '@/components/ui/feedback';

export function useKoreaDraft(dirty: boolean) {
  const router = useRouter(); const { confirm } = useFeedback(); const leaving = useRef(false);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { if (!leaving.current) { event.preventDefault(); event.returnValue = ''; } };
    const navigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname + url.search === location.pathname + location.search) return;
      event.preventDefault(); event.stopPropagation();
      void confirm({ title: '저장하지 않은 변경이 있습니다', body: '이동하면 현재 수정 내용이 사라집니다.', confirmLabel: '저장하지 않고 이동', cancelLabel: '계속 편집' }).then(ok => { if (ok) { leaving.current = true; router.push(url.pathname + url.search + url.hash); } });
    };
    window.addEventListener('beforeunload', unload); document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', navigate, true); };
  }, [dirty, router, confirm]);
}

export function KoreaSaveBar({ dirty, pending, updatedAt, label = '변경 저장', children }: { dirty: number; pending: boolean; updatedAt: string | null; label?: string; children?: React.ReactNode }) {
  return <div className="sticky bottom-3 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/95 px-5 py-3 shadow-float backdrop-blur"><div role="status" className="flex items-center gap-2 text-sm"><span className={dirty ? 'size-2 rounded-full bg-warning' : 'size-2 rounded-full bg-success'} />{dirty ? <strong>{dirty}개 변경 · 저장 전</strong> : <span className="text-muted"><Check className="mr-1 inline size-4" aria-hidden />{updatedAt ? '저장된 상태' : '변경 사항 없음'}</span>}</div><div className="flex items-center gap-2">{children}<Button type="submit" variant="brand" loading={pending} disabled={!dirty}>{label}</Button></div></div>;
}

export async function uploadKoreaFile(file: File): Promise<string> {
  const data = new FormData(); data.append('file', file);
  const response = await fetch('/api/korea/media', { method: 'POST', body: data }); const value = await response.json();
  if (!response.ok) throw new Error(value.error || '파일을 올리지 못했습니다.');
  return value.url;
}

export function KoreaAssetInput({ value, onChange, label, publicOrigin }: { value: string; onChange: (value: string) => void; label: string; publicOrigin: string }) {
  const input = useRef<HTMLInputElement>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [value]);
  const url = value.startsWith('/') ? publicOrigin.replace(/\/$/, '') + value : value;
  const image = safeUrl(value, true) && /\.(png|jpe?g|webp|gif|svg|avif)(?:[?#]|$)/i.test(value);
  let filename = value.split('?')[0]?.split('/').pop() || '선택된 파일 없음'; try { filename = decodeURIComponent(filename); } catch {}
  return <div className="space-y-3"><div className="flex items-center gap-4"><div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-wash">{image && !failed ? <img src={url} alt={label} className="h-full w-full object-contain p-2" onError={() => setFailed(true)} /> : <ImageIcon className="size-7 text-muted" aria-hidden />}</div><div className="min-w-0 space-y-2"><p className="max-w-64 truncate text-xs text-muted" data-tip={filename}>{filename}</p><Button size="sm" variant="outline" loading={busy} onClick={() => input.current?.click()}><Upload aria-hidden />이미지 바꾸기</Button>{safeUrl(value, true) && <a href={url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs text-muted" aria-label={`${label} 새 창에서 보기`}><ExternalLink className="size-3.5" />보기</a>}</div></div><input ref={input} className="sr-only" type="file" aria-label={`${label} 파일 선택`} accept="image/png,image/jpeg,image/gif,image/webp,application/pdf" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); setError(''); try { onChange(await uploadKoreaFile(file)); } catch (e) { setError(e instanceof Error ? e.message : '업로드하지 못했습니다.'); } finally { setBusy(false); event.target.value = ''; } }} />{error && <p role="alert" className="text-sm text-danger">{error}</p>}<Disclosure summary="주소 직접 입력"><input className={inputClass} aria-label={`${label} 주소`} value={value} onChange={e => onChange(e.target.value)} /></Disclosure></div>;
}
