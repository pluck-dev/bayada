"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@bayada/ui";
import { HEALTH_METRICS, type HealthMetric } from "@bayada/shared/member";

export type HealthPoint = { t: number; sys?: number | null; dia?: number | null; bloodSugar?: number | null; temperature?: number | null; heartRate?: number | null; weight?: number | null };

// 색: 수축기=브랜드 레드, 이완기=블루 (dataviz 검증 통과: CVD ΔE 29.9). 하나뿐인 지표는 레드 한 줄.
const C1 = "#ce0e2d";
const C2 = "#2563eb";
const PAD = { l: 40, r: 16, t: 16, b: 28 };

const fmtDay = (t: number) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(t);
const fmtFull = (t: number) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(t);

function niceTicks(min: number, max: number, n = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const step0 = (max - min) / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((s) => s >= step0) ?? step0;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(2)));
  return out;
}

/** 건강 수치 추이 — 지표 하나씩 (혈압만 수축기·이완기 두 줄, 축 하나). 아래 기록 목록이 표 보기 역할 */
export function HealthChart({ points }: { points: HealthPoint[] }) {
  const [metric, setMetric] = useState<HealthMetric>("bloodPressure");
  const [hover, setHover] = useState<number | null>(null);
  // 실제 폭으로 그린다 (viewBox 를 늘리면 휴대폰에서 글자가 너무 작아진다)
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 500 ? 200 : 260;
  const meta = HEALTH_METRICS.find((x) => x.key === metric)!;

  const series = useMemo(() => {
    const pts = [...points].sort((a, b) => a.t - b.t);
    if (metric === "bloodPressure") {
      const rows = pts.filter((p) => p.sys != null && p.dia != null);
      return { rows, lines: [{ key: "sys", label: "수축기", color: C1 }, { key: "dia", label: "이완기", color: C2 }] as const };
    }
    const rows = pts.filter((p) => p[metric] != null);
    return { rows, lines: [{ key: metric, label: meta.label, color: C1 }] as const };
  }, [points, metric, meta.label]);

  const rows = series.rows;
  const vals = rows.flatMap((r) => series.lines.map((l) => r[l.key as keyof HealthPoint] as number));
  const ticks = vals.length ? niceTicks(Math.min(...vals), Math.max(...vals)) : [];
  const yMin = ticks[0] ?? 0;
  const yMax = ticks[ticks.length - 1] ?? 1;
  const tMin = rows[0]?.t ?? 0;
  const tMax = rows[rows.length - 1]?.t ?? 1;
  const x = (t: number) => (rows.length === 1 ? (PAD.l + W - PAD.r) / 2 : PAD.l + ((t - tMin) / (tMax - tMin || 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.t - PAD.b);
  const xTicks = rows.length <= 1 ? rows.map((r) => r.t) : [0, 0.5, 1].map((f) => tMin + f * (tMax - tMin));
  const h = hover != null ? rows[hover] : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!rows.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    rows.forEach((row, i) => {
      if (Math.abs(x(row.t) - px) < Math.abs(x(rows[best].t) - px)) best = i;
    });
    setHover(best);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="지표">
        {HEALTH_METRICS.map((mm) => (
          <button
            key={mm.key}
            type="button"
            role="tab"
            aria-selected={metric === mm.key}
            onClick={() => (setMetric(mm.key), setHover(null))}
            className={cn("h-9 rounded-full px-4 text-sm font-semibold transition-colors", metric === mm.key ? "bg-[color:var(--fg)] text-white" : "bg-[#f0f4f7] text-gray-600 hover:text-[color:var(--fg)]")}
          >
            {mm.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-xl bg-[#f8f9fa] text-sm text-[color:var(--muted)]">최근 90일 {meta.label} 기록이 없어요</div>
      ) : (
        <div className="relative overflow-hidden" ref={box}>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[color:var(--muted)]">
            <span>
              {meta.label} ({meta.unit}) · 최근 90일 {rows.length}회
            </span>
            {series.lines.length > 1 && (
              <span className="flex items-center gap-3">
                {series.lines.map((l) => (
                  <span key={l.key} className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded" style={{ background: l.color }} aria-hidden />
                    {l.label}
                  </span>
                ))}
              </span>
            )}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block touch-none select-none" role="img" aria-label={`${meta.label} 추이`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
            {ticks.map((tv) => (
              <g key={tv}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(tv)} y2={y(tv)} stroke="#eef0f2" strokeWidth={1} />
                <text x={PAD.l - 8} y={y(tv)} dy="0.32em" textAnchor="end" fontSize={11} fill="#9ca3af" className="tabular-nums">
                  {tv}
                </text>
              </g>
            ))}
            {xTicks.map((t, i) => (
              <text key={i} x={x(t)} y={H - 8} textAnchor={xTicks.length === 1 ? "middle" : i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"} fontSize={11} fill="#9ca3af">
                {fmtDay(t)}
              </text>
            ))}
            {h && <line x1={x(h.t)} x2={x(h.t)} y1={PAD.t} y2={H - PAD.b} stroke="#d1d5db" strokeWidth={1} strokeDasharray="3 3" />}
            {series.lines.map((l) => {
              const d = rows.map((r, i) => `${i ? "L" : "M"}${x(r.t).toFixed(1)},${y(r[l.key as keyof HealthPoint] as number).toFixed(1)}`).join(" ");
              return (
                <g key={l.key}>
                  <path d={d} fill="none" stroke={l.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {rows.map((r, i) => (
                    <circle key={i} cx={x(r.t)} cy={y(r[l.key as keyof HealthPoint] as number)} r={hover === i ? 5 : 3.5} fill={l.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </g>
              );
            })}
          </svg>
          {h && (
            <div
              className="pointer-events-none absolute top-6 z-10 -translate-x-1/2 rounded-xl bg-[#1f2328] px-3 py-2 text-xs text-white shadow-lg"
              style={{ left: `${Math.min(88, Math.max(12, (x(h.t) / W) * 100))}%` }}
            >
              <p className="text-white/70">{fmtFull(h.t)}</p>
              {series.lines.map((l) => (
                <p key={l.key} className="mt-0.5 flex items-center gap-1.5 font-semibold tabular-nums">
                  <span className="size-2 rounded-full" style={{ background: l.color }} aria-hidden />
                  {l.label} {h[l.key as keyof HealthPoint]} {meta.unit}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
