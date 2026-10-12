"use client";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

export const VideoPlayer = ({
  playbackId,
  playbackToken,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  initialPosition = 0,
  title,
}) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();
  const lastSavedRef = useRef(initialPosition);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        const { data } = await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, { isCompleted: true });
        if (!nextChapterId && data?.completion?.completed) confetti.onOpen();
        toast.success("Lesson progress recorded");
        router.refresh();
        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onTimeUpdate = async (event) => {
    const currentTime = Number(event?.target?.currentTime || 0);
    if (currentTime - lastSavedRef.current < 10) return;
    lastSavedRef.current = currentTime;
    try { await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/progress`, { videoPositionSeconds: currentTime }); } catch {}
  };

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-ink-900 bg-ink-950 shadow-elevated">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950 text-parchment-100 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-ochre-400" />
          <span className="font-mono text-xs text-ink-400 uppercase tracking-widest">
            Buffering Stream...
          </span>
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-ink-900 to-ink-950 flex-col gap-y-3 text-parchment-100 p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center text-ochre-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-medium text-parchment-50">
              Restricted Curriculum Module
            </h4>
            <p className="text-xs text-ink-400 mt-1 max-w-sm font-sans">
              Enroll in this syllabus or matriculate into the cohort to stream this lecture and access attached resources.
            </p>
          </div>
        </div>
      )}

      {!isLocked && !playbackToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950 p-6 text-center text-parchment-100">
          <div className="max-w-md">
            <ShieldAlert className="h-8 w-8 mx-auto text-ochre-400 mb-3" />
            <h4 className="font-serif text-lg">Secure playback is unavailable</h4>
            <p className="text-xs text-ink-300 mt-1 font-sans">The lesson is protected, but the playback signing service is not configured on this deployment.</p>
          </div>
        </div>
      )}

      {!isLocked && playbackToken && (
        <MuxPlayer
          title={title}
          className={cn(!isReady && "hidden")}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          onTimeUpdate={onTimeUpdate}
          startTime={initialPosition}
          autoPlay
          playbackId={playbackId}
          tokens={{ playback: playbackToken }}
        />
      )}
    </div>
  );
};
