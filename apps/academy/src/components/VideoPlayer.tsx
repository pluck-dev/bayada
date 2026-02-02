"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlayCircle, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  videoUrl?: string | null;
  title: string;
  onTimeUpdate?: (currentTime: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ videoUrl, title, onTimeUpdate, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastReportedTime = useRef(0);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const current = Math.floor(video.currentTime);
    setCurrentTime(current);
    setProgress((video.currentTime / video.duration) * 100 || 0);

    // 5초마다 시청 시간 보고
    if (current - lastReportedTime.current >= 5) {
      lastReportedTime.current = current;
      onTimeUpdate?.(current);
    }
  }, [onTimeUpdate]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [onComplete]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // videoUrl이 없으면 플레이스홀더 표시
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full bg-gray-900 shadow-2xl z-10">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
          <div className="rounded-full bg-white/10 p-6 backdrop-blur-sm">
            <PlayCircle className="h-16 w-16 opacity-60" />
          </div>
          <div className="text-center px-8">
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-white/40 text-xs mt-1">영상이 아직 등록되지 않았습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black shadow-2xl z-10 group">
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onClick={togglePlay}
      />

      {/* 재생 오버레이 (일시정지 시) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="rounded-full bg-white/10 p-6 backdrop-blur-sm transition-transform hover:scale-110">
            <PlayCircle className="h-16 w-16 text-white opacity-90 fill-white/20" />
          </div>
        </div>
      )}

      {/* 컨트롤 바 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
        {/* 프로그레스 바 */}
        <div
          className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/30 hover:h-1.5 transition-all"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-[var(--brand-primary)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-white/80 transition-colors">
              {isPlaying ? <Pause className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-white/80 transition-colors">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <span className="text-xs text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-white/80 transition-colors">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
