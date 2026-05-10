import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface CustomAudioPlayerProps {
  src: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Fix Safari Duration (The Hack)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fixSafariDuration = () => {
      // Safari/iOS sering melapor Infinity atau NaN untuk durasi Blob/WebM
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        audio.currentTime = 1e101; // "Pancing" dengan seek ke waktu yang sangat jauh
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          audio.currentTime = 0; // Kembalikan ke awal
          const d = audio.duration;
          if (isFinite(d)) setDuration(d);
        };
      } else {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", fixSafariDuration);
    // Jalankan juga saat audio src berubah
    if (audio.readyState >= 1) fixSafariDuration();

    return () => audio.removeEventListener("loadedmetadata", fixSafariDuration);
  }, [src]);

  // 2. Play/Pause Toggle
  const togglePlay = (): void => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 3. Update Progress & Current Time secara Reaktif
  const handleTimeUpdate = (): void => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (isFinite(total) && total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  // 4. Manual Progress Change (Scrubbing)
  const handleProgressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (audioRef.current && isFinite(duration) && duration > 0) {
      const newPercent = Number(e.target.value);
      const newTime = (newPercent / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(newPercent);
      setCurrentTime(newTime);
    }
  };

  // 5. Time Formatter (Handle NaN/Infinity)
  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 bg-emerald-900/40 backdrop-blur-md p-3 rounded-2xl border border-emerald-400/20 shadow-inner w-full group">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={(): void => setIsPlaying(false)}
        playsInline
      />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition-all active:scale-90"
      >
        {isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} className="ml-1" fill="currentColor" />
        )}
      </button>

      {/* Progress & Info */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-emerald-200 tracking-widest uppercase opacity-80">
          <span>Voice Note</span>
          <span>
            {/* Pakai state currentTime, jangan dari ref langsung agar reaktif */}
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="relative w-full h-1.5 bg-emerald-800/50 rounded-full overflow-hidden">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress || 0}
            onChange={handleProgressChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="absolute top-0 left-0 h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Volume2 size={16} className="text-emerald-300/50 hidden sm:block" />
    </div>
  );
};

export default CustomAudioPlayer;
