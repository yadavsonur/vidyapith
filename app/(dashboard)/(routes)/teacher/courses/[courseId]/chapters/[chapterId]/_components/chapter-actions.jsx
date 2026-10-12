"use client";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash2, Globe2, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
  canPublish = true,
  canDelete = true,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/unpublish`);
        toast.success("Chapter unpublished");
      } else {
        await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/publish`);
        toast.success("Chapter published");
      }
      router.refresh();
    } catch (error) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
      toast.success("Chapter deleted successfully");
      router.refresh();
      router.push(`/teacher/courses/${courseId}`);
    } catch (error) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2.5">
      {canPublish && (
        <Button
          onClick={onClick}
          disabled={disabled || isLoading}
          variant={isPublished ? "outline" : "default"}
          size="sm"
          className={!isPublished ? "bg-ochre-500 hover:bg-ochre-600 text-ink-950 font-semibold" : "border-ink-200"}
        >
          {isPublished ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1.5" />
              Unpublish
            </>
          ) : (
            <>
              <Globe2 className="h-3.5 w-3.5 mr-1.5" />
              Publish Chapter
            </>
          )}
        </Button>
      )}

      {canDelete && (
        <ConfirmModal onConfirm={onDelete}>
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            className="border-ink-200 text-ink-500 hover:text-vermilion-700 hover:border-vermilion-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </ConfirmModal>
      )}
    </div>
  );
};
