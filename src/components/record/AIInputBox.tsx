import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Sparkles, Square, Trash2 } from "lucide-react";
import { AudioNote } from "../../types";

const MAX_RECORD_SECONDS = 60;

interface AIInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  hint: string;
  isParsing: boolean;
  audioNote: AudioNote | null;
  onAudioNoteChange: (audioNote: AudioNote | null) => void;
  onParse: () => void;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Invalid audio result"));
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read audio"));
    reader.readAsDataURL(blob);
  });
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function AIInputBox({ value, onChange, hint, isParsing, audioNote, onAudioNoteChange, onParse }: AIInputBoxProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const stopTimerRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceHint, setVoiceHint] = useState("");

  useEffect(() => {
    let timer: number | null = null;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordSeconds(Math.min(MAX_RECORD_SECONDS, Math.round((Date.now() - startTimeRef.current) / 1000)));
      }, 300);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopRecording = () => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceHint("当前浏览器暂不支持录音，可以先写文字记录。");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const preferredMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: preferredMime, audioBitsPerSecond: 64000 });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setVoiceHint("录音遇到一点问题，可以再试一次。");
        setIsRecording(false);
      };

      recorder.onstop = async () => {
        const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsRecording(false);

        if (!chunksRef.current.length) {
          setVoiceHint("这段录音太短，没有保存。");
          return;
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || preferredMime });
        const dataUrl = await blobToDataUrl(blob);
        onAudioNoteChange({
          id: `${Date.now()}-${Math.round(Math.random() * 10000)}`,
          dataUrl,
          mimeType: blob.type || preferredMime,
          durationSeconds: Math.min(MAX_RECORD_SECONDS, durationSeconds),
          createdAt: new Date().toISOString(),
        });
        setVoiceHint(`已保存 ${formatDuration(Math.min(MAX_RECORD_SECONDS, durationSeconds))} 语音记录。`);
      };

      startTimeRef.current = Date.now();
      setRecordSeconds(0);
      setIsRecording(true);
      setVoiceHint("正在录音，保留此刻的语气和心情...");
      recorder.start();
      stopTimerRef.current = window.setTimeout(stopRecording, MAX_RECORD_SECONDS * 1000);
    } catch (error) {
      console.warn("Audio recording failed", error);
      setVoiceHint("麦克风权限被拒绝了，可以在浏览器地址栏重新允许。");
      setIsRecording(false);
    }
  };

  return (
    <section className="rounded-[24px] bg-white border border-[#dfd6c5] p-5 shadow-sm rotate-[-0.35deg]">
      <div className="flex gap-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="flex-1 resize-none bg-transparent text-base outline-none placeholder:text-[#a0907d]/70"
          placeholder="说说今天 ✨ 例如：今天喝了奶茶有点开心"
        />
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isRecording ? "bg-[#e3a387] text-white shadow-[0_0_0_6px_rgba(227,163,135,0.16)] animate-pulse" : "bg-[#8e9a86]/10 text-[#8e9a86]"
          }`}
          aria-label={isRecording ? "停止录音" : "开始录音"}
        >
          {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={19} />}
        </button>
      </div>

      {(audioNote || isRecording) && (
        <div className="mt-4 rounded-2xl bg-[#faf6ee] border border-[#eadfce] p-3">
          {isRecording ? (
            <div className="flex items-center justify-between text-sm font-bold text-[#c86f50]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e3a387] animate-pulse" />
                录音中 {formatDuration(recordSeconds)}
              </span>
              <span>最长 {MAX_RECORD_SECONDS} 秒</span>
            </div>
          ) : (
            audioNote && (
              <div className="flex items-center gap-3">
                <audio controls src={audioNote.dataUrl} className="h-9 flex-1 min-w-0" />
                <span className="text-xs font-bold text-[#a0907d]">{formatDuration(audioNote.durationSeconds)}</span>
                <button type="button" onClick={() => onAudioNoteChange(null)} className="w-8 h-8 rounded-full bg-white border border-[#dfd6c5] text-[#a0907d] flex items-center justify-center">
                  <Trash2 size={15} />
                </button>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#dfd6c5] pt-3">
        <p className="text-xs text-[#a0907d]">{voiceHint || hint || "AI 会把一句话整理成心情、吃喝、穿搭和地点；录音会保留当时的语气。"}</p>
        <button
          type="button"
          onClick={onParse}
          disabled={isParsing}
          className="rounded-full bg-[#8e9a86] px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
        >
          {isParsing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI解析
        </button>
      </div>
    </section>
  );
}
