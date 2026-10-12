"use client";
import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FileUpload } from "@/components/file-upload";

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({ initialData, courseId, chapterId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const onSubmit = async (values) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Video lecture updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ink-100">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
          Lecture Recording
        </span>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          size="sm"
          className="text-xs text-ink-600 hover:text-ink-950 h-7 px-2"
        >
          {isEditing && (
            <>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </>
          )}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-3 w-3 mr-1" />
              Upload Video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-3 w-3 mr-1" />
              Replace Video
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        !initialData.videoUrl ? (
          <div className="flex flex-col items-center justify-center h-56 bg-parchment-100/70 border border-dashed border-ink-300 rounded-md">
            <Video className="h-8 w-8 text-ink-400 mb-1" />
            <p className="text-xs text-ink-500 font-mono">No video lecture asset attached yet</p>
          </div>
        ) : (
          <div className="relative aspect-video mt-2 rounded-md overflow-hidden border border-ink-900 bg-ink-950 shadow-card">
            <MuxPlayer playbackId={initialData?.muxData?.playbackId || ""} />
          </div>
        )
      )}

      {isEditing && (
        <div className="pt-2">
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <div className="text-[11px] font-mono text-ink-400 mt-2 text-center">
            Supported MP4 / WebM video streams · Handled via resilient Mux transcoding
          </div>
        </div>
      )}

      {initialData.videoUrl && !isEditing && (
        <div className="text-[11px] font-mono text-ink-400 pt-1">
          HLS video encoding may take several minutes to finish processing.
        </div>
      )}
    </div>
  );
};
