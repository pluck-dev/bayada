"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@bayada/ui";

// YouTube URL이면 영상 ID 반환 (watch / youtu.be / embed / shorts)
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

interface VideoPlayerProps {
  videoUrl?: string | null;
  title: string;
  /** 이어보기 시작 위치(초) */
  startAt?: number;
  /** 앞으로 건너뛰기 막기: 지금까지 본 가장 먼 지점까지만 이동할 수 있다 */
  lockForward?: boolean;
  /** 서버에 기록된, 지금까지 본 가장 먼 지점(초) */
  watchedUntil?: number;
  /** 5초마다: 본 가장 먼 지점(초)과 영상 길이 */
  onTimeUpdate?: (watchedSec: number, duration: number) => void;
  onComplete?: (duration: number) => void;
  /** 영상을 못 불러왔을 때 '다시 시도' — 서명 주소가 만료됐을 수 있어 새 주소를 받아 온다 */
  onReload?: () => void;
}

/**
 * 강의 영상 플레이어. 브라우저 기본 컨트롤 대신 디자인된 컨트롤:
 * 재생/일시정지 · 10초 앞뒤 · 탐색 막대(키보드 ←→) · 음소거 · 재생 속도 · 전체 화면(컨트롤 유지) · 이어보기.
 * 재생 중엔 2.5초 뒤 컨트롤이 숨고, 마우스·터치·키보드가 있으면 다시 보인다. 끝까지 보면 onComplete.
 * lockForward 면 본 구간 안에서만 이동할 수 있다(뒤로 가기·다시 보기는 자유). 진짜 판정은 서버가 한다.
 */
export function VideoPlayer({
  videoUrl,
  title,
  startAt = 0,
  lockForward = false,
  watchedUntil = 0,
  onTimeUpdate,
  onComplete,
  onReload,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const speedBtn = useRef<HTMLButtonElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReported = useRef(0);
  const furthestRef = useRef(watchedUntil);
  const [furthest, setFurthest] = useState(watchedUntil);
  // 오류 뒤 새 주소로 다시 불러올 때 이어서 볼 위치
  const resumeAfterReload = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [resumed, setResumed] = useState<number | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 2500);
  }, []);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === boxRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => setError(true));
    else v.pause();
    showControls();
  }, [showControls]);

  const seekTo = useCallback(
    (sec: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration)) return;
      const limit = lockForward ? Math.min(v.duration, furthestRef.current) : v.duration;
      v.currentTime = Math.min(Math.max(0, sec), limit);
      setCurrent(v.currentTime);
      showControls();
    },
    [showControls, lockForward]
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (box.requestFullscreen) void box.requestFullscreen();
    // iOS Safari: 요소 전체 화면이 없어 영상 자체 전체 화면으로
    else (videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const v = videoRef.current;
    if (!v || (e.target as HTMLElement).closest("[data-no-hotkey]")) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      togglePlay();
    } else if (k === "arrowright" || k === "l") {
      e.preventDefault();
      seekTo(v.currentTime + (k === "l" ? 10 : 5));
    } else if (k === "arrowleft" || k === "j") {
      e.preventDefault();
      seekTo(v.currentTime - (k === "j" ? 10 : 5));
    } else if (k === "m") toggleMute();
    else if (k === "f") toggleFullscreen();
  };

  // 영상이 없을 때
  if (!videoUrl) {
    return (
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 bg-side px-8 text-center text-white">
        <span className="flex size-16 items-center justify-center rounded-full bg-white/10">
          <Play className="h-7 w-7 opacity-60" aria-hidden />
        </span>
        <p className="text-body-sm font-semibold text-white/80">{title}</p>
        <p className="text-caption text-white/50">영상이 아직 등록되지 않았어요</p>
      </div>
    );
  }

  // YouTube 영상은 iframe 임베드로 재생 (실제 영상 업로드 전 샘플용)
  const youTubeId = getYouTubeId(videoUrl);
  if (youTubeId) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}?rel=0&modestbranding=1`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;
  const watchedPct = duration ? Math.min(100, (furthest / duration) * 100) : 0;
  const controlsShown = controlsVisible || !playing || speedOpen;

  return (
    <div
      ref={boxRef}
      role="region"
      aria-label={`영상 플레이어: ${title}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={showControls}
      onPointerDown={showControls}
      className={cn(
        "group/player relative w-full overflow-hidden bg-black outline-none focus-visible:ring-3 focus-visible:ring-brand-400",
        fullscreen ? "h-full" : "aspect-video",
        !controlsShown && "cursor-none",
      )}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        preload="metadata"
        className="h-full w-full"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          showControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onError={() => {
          resumeAfterReload.current = videoRef.current?.currentTime ?? 0;
          setError(true);
        }}
        onSeeking={() => {
          // 브라우저·OS 기본 컨트롤(전체 화면 iOS, 미디어 키)로 앞으로 건너뛴 경우도 되돌린다
          const v = videoRef.current;
          if (v && lockForward && v.currentTime > furthestRef.current + 1) v.currentTime = furthestRef.current;
        }}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (!v) return;
          setDuration(v.duration);
          setError(false);
          if (resumeAfterReload.current > 0) {
            v.currentTime = resumeAfterReload.current;
            setCurrent(resumeAfterReload.current);
            resumeAfterReload.current = 0;
            return;
          }
          // 이어보기: 끝 10초 전까지만 (거의 다 본 영상은 처음부터)
          if (startAt > 5 && startAt < v.duration - 10) {
            v.currentTime = startAt;
            setCurrent(startAt);
            setResumed(startAt);
          }
        }}
        onProgress={() => {
          const v = videoRef.current;
          if (v && v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v) return;
          setCurrent(v.currentTime);
          // 이어서 재생한 구간만 '본 지점'으로 늘린다 (건너뛴 구간은 안 셈)
          if (!v.seeking && v.currentTime > furthestRef.current && v.currentTime <= furthestRef.current + 3) {
            furthestRef.current = v.currentTime;
            setFurthest(v.currentTime);
          }
          const sec = Math.floor(v.currentTime);
          // 5초마다 본 가장 먼 지점 보고(이어보기·완료 판정용)
          if (Math.abs(sec - lastReported.current) >= 5) {
            lastReported.current = sec;
            onTimeUpdate?.(Math.floor(furthestRef.current), v.duration);
          }
        }}
        onEnded={() => {
          const v = videoRef.current;
          setPlaying(false);
          setControlsVisible(true);
          if (v) {
            furthestRef.current = Math.max(furthestRef.current, v.duration);
            setFurthest(furthestRef.current);
          }
          onComplete?.(v?.duration ?? 0);
        }}
      />

      {/* 가운데: 큰 재생 버튼 / 로딩 / 오류 */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center text-white">
          <AlertCircle className="h-8 w-8 text-brand-300" aria-hidden />
          <p className="text-body font-semibold">영상을 불러오지 못했어요</p>
          <p className="text-caption text-white/60">네트워크를 확인한 뒤 다시 시도해 주세요.</p>
          <button
            type="button"
            onClick={() => {
              setError(false);
              // 새 서명 주소를 받아 오면 src 가 바뀌어 다시 불러온다. 주소가 그대로면(네트워크 문제) 지금 다시 시도
              onReload?.();
              videoRef.current?.load();
            }}
            className="mt-1 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-body-sm font-bold text-ink hover:bg-neutral-200"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> 다시 시도
          </button>
        </div>
      ) : waiting && playing ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/90" aria-label="불러오는 중" />
        </div>
      ) : !playing ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={current > 0 ? "이어서 재생" : "재생"}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25 transition-colors hover:bg-black/15"
        >
          <span className="flex size-[72px] items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover/player:scale-105 md:size-20">
            <Play className="ml-1 h-8 w-8 fill-current" aria-hidden />
          </span>
          {resumed !== null && current > 0 && (
            <span className="rounded-full bg-black/60 px-3 py-1 text-caption font-semibold text-white">
              {formatTime(current)}부터 이어서 봐요
            </span>
          )}
        </button>
      ) : null}

      {/* 하단 컨트롤 */}
      <div
        data-no-hotkey={speedOpen || undefined}
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-10 text-white transition-opacity duration-200 md:px-4 md:pb-3",
          controlsShown ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="재생 위치"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              e.stopPropagation();
              seekTo(current + (e.key === "ArrowRight" ? 5 : -5));
            }
          }}
          onPointerDown={(e) => {
            const bar = e.currentTarget;
            const at = (x: number) => {
              const r = bar.getBoundingClientRect();
              seekTo(((x - r.left) / r.width) * duration);
            };
            at(e.clientX);
            bar.setPointerCapture(e.pointerId);
            const move = (ev: PointerEvent) => at(ev.clientX);
            const up = () => {
              bar.removeEventListener("pointermove", move);
              bar.removeEventListener("pointerup", up);
            };
            bar.addEventListener("pointermove", move);
            bar.addEventListener("pointerup", up);
          }}
          className="group/seek relative flex h-5 cursor-pointer touch-none items-center outline-none"
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5 group-focus-visible/seek:h-1.5">
            <div className="absolute inset-y-0 left-0 bg-white/35" style={{ width: `${bufPct}%` }} />
            {lockForward && <div className="absolute inset-y-0 left-0 bg-white/60" style={{ width: `${watchedPct}%` }} />}
            <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${pct}%` }} />
          </div>
          <span
            aria-hidden
            className="absolute size-3.5 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/seek:opacity-100 group-focus-visible/seek:opacity-100 group-focus-visible/seek:ring-3 group-focus-visible/seek:ring-brand-400"
            style={{ left: `${pct}%` }}
          />
        </div>

        <div className="mt-1 flex items-center gap-1 md:gap-2">
          <CtrlButton label={playing ? "일시정지" : "재생"} onClick={togglePlay}>
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </CtrlButton>
          <CtrlButton label="10초 뒤로" onClick={() => seekTo(current - 10)}>
            <RotateCcw className="h-[18px] w-[18px]" />
          </CtrlButton>
          <CtrlButton label={lockForward ? "10초 앞으로 (본 구간까지)" : "10초 앞으로"} onClick={() => seekTo(current + 10)}>
            <RotateCw className="h-[18px] w-[18px]" />
          </CtrlButton>
          <CtrlButton label={muted ? "소리 켜기" : "음소거"} onClick={toggleMute}>
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </CtrlButton>
          <span className="tabular ml-1 text-caption font-medium text-white/85">
            {formatTime(current)} <span className="text-white/50">/ {formatTime(duration)}</span>
          </span>
          <span className="flex-1" />
          {/* 재생 속도 — 전체 화면에서도 보이도록 포털이 아니라 플레이어 안에 띄운다 */}
          <div
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setSpeedOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setSpeedOpen(false);
                speedBtn.current?.focus();
              }
            }}
          >
            <button
              ref={speedBtn}
              type="button"
              aria-label={`재생 속도 ${speed}배`}
              aria-haspopup="listbox"
              aria-expanded={speedOpen}
              onClick={() => setSpeedOpen((o) => !o)}
              className="tabular inline-flex h-9 min-w-12 items-center justify-center rounded-full px-2.5 text-caption font-bold transition-colors hover:bg-white/15"
            >
              {speed}x
            </button>
            {speedOpen && (
              <ul
                role="listbox"
                aria-label="재생 속도"
                className="animate-pop-up absolute bottom-full right-0 mb-2 w-32 rounded-2xl bg-canvas p-1.5 text-ink shadow-lg"
              >
                {SPEEDS.map((sp) => (
                  <li key={sp}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={sp === speed}
                      onClick={() => {
                        if (videoRef.current) videoRef.current.playbackRate = sp;
                        setSpeed(sp);
                        setSpeedOpen(false);
                        speedBtn.current?.focus();
                      }}
                      className={cn(
                        "tabular flex w-full items-center justify-between rounded-xl px-3 py-2 text-body-sm transition-colors hover:bg-surface-sunken",
                        sp === speed ? "font-bold text-ink" : "text-ink-soft",
                      )}
                    >
                      {sp === 1 ? "보통" : `${sp}배`}
                      {sp === speed && <span className="size-1.5 rounded-full bg-brand" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CtrlButton label={fullscreen ? "전체 화면 끝내기" : "전체 화면"} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </CtrlButton>
        </div>
      </div>
    </div>
  );
}

function CtrlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white md:size-10 [&_svg]:pointer-events-none"
    >
      {children}
    </button>
  );
}
