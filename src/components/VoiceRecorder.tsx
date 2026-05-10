import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Loader2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

// ======================================================
// TYPES
// ======================================================
interface VoiceRecorderProps {
  ticketId: string;
  onUploadComplete: (url: string) => void;
  onClear: () => void;
  onRecordingStateChange: (isRecording: boolean) => void;
}

type RecorderStatus = "idle" | "recording" | "paused" | "preview";

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  ticketId,
  onUploadComplete,
  onClear,
  onRecordingStateChange,
}) => {
  // States
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [duration, setDuration] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(
    new Array(20).fill(2),
  );

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Timer Logic
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Visualizer Logic
  const startVisualizer = (stream: MediaStream): void => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = (): void => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 20)).map((val) =>
          Math.max(4, (val / 255) * 32),
        );
        setAudioLevels(levels);
      }
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };
    updateLevels();
  };

  const stopVisualizer = (): void => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Recording Controls
  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // CEK FORMAT YANG DIDUKUNG (Fix buat iPhone)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Gunakan mimeType yang sama saat membuat Blob
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setStatus("preview");
        await handleUpload(blob);
      };

      mediaRecorder.start();
      setStatus("recording");
      onRecordingStateChange(true);
      startVisualizer(stream);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  const pauseRecording = (): void => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
    }
  };

  const resumeRecording = (): void => {
    if (mediaRecorderRef.current && status === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      stopVisualizer();
      onRecordingStateChange(false);
    }
  };

  const handleUpload = async (blob: Blob): Promise<void> => {
    setIsUploading(true);
    console.log("Memulai Upload...", blob.size);

    try {
      const fileName = `replies/${ticketId}-${Date.now()}.webm`;

      // Pastikan bucket name 'consultation_voice_notes' sudah benar di Supabase
      const { data, error } = await supabase.storage
        .from("consultation_voice_notes")
        .upload(fileName, blob);

      if (error) {
        console.error("Supabase Storage Error:", error.message);
        Swal.fire("Upload Gagal", error.message, "error"); // Tambahkan alert biar kelihatan
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("consultation_voice_notes")
        .getPublicUrl(data.path);

      console.log("Upload Sukses, URL:", publicUrl);
      onUploadComplete(publicUrl); // Ini yang akan mengaktifkan tombol Send di parent
    } catch (err) {
      console.error("Fatal Upload Error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = (): void => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDuration(0);
    setStatus("idle");
    onClear();
  };

  // Render Preview Mode
  if (status === "preview" && previewUrl) {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-2xl border border-emerald-200 animate-in fade-in zoom-in duration-300">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-100"
          onClick={() => {
            if (audioPreviewRef.current) {
              audioPreviewRef.current.play().catch((err) => {
                console.error("Playback failed:", err);
              });
            }
          }}
        >
          <Play size={18} fill="currentColor" />
        </Button>

        {/* Tambahkan playsInline dan perjelas tipe-nya */}
        <audio
          ref={audioPreviewRef}
          src={previewUrl || ""}
          className="hidden"
          playsInline
          controls={false}
        />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase leading-none">
            {isUploading ? "Uploading..." : "Voice Ready"}
          </span>
          <span className="text-[10px] text-emerald-600/60 font-mono">
            {formatTime(duration)}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-700"
          onClick={reset}
        >
          <Trash2 size={16} />
        </Button>
        {isUploading && (
          <Loader2 size={14} className="animate-spin text-emerald-600" />
        )}
      </div>
    );
  }

  // Render Recording/Paused Mode
  if (status === "recording" || status === "paused") {
    return (
      <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 rounded-2xl border border-rose-100 dark:border-rose-900 w-full animate-in slide-in-from-bottom-2 shadow-inner">
        <div
          className={`w-2 h-2 rounded-full bg-rose-500 ${status === "recording" ? "animate-pulse" : ""}`}
        />

        {/* WAVEFORM VISUALIZER */}
        <div className="flex-1 flex items-center justify-center gap-[2px] h-6">
          {audioLevels.map((h, i) => (
            <div
              key={i}
              className="w-[3px] bg-rose-400 dark:bg-rose-600 rounded-full transition-all duration-75"
              style={{ height: `${status === "recording" ? h : 4}px` }}
            />
          ))}
        </div>

        <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400 w-12">
          {formatTime(duration)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={status === "recording" ? pauseRecording : resumeRecording}
            className="text-rose-600 h-9 w-9 hover:bg-rose-100 hover:text-rose-700 rounded-xl"
          >
            {status === "recording" ? (
              <Pause size={20} />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            className="rounded-xl h-9 w-9 shadow-md"
          >
            <Square size={16} fill="currentColor" />
          </Button>
        </div>
      </div>
    );
  }

  // Render Idle Mode
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={startRecording}
      className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-90 h-10 w-10 shadow-sm"
    >
      <Mic size={20} />
    </Button>
  );
};

export default VoiceRecorder;
