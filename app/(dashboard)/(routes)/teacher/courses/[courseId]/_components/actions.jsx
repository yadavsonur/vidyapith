"use client";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { Trash2, Globe2, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const Actions = ({
  disabled,
  courseId,
  isPublished,
  courseStatus = "DRAFT",
  isAdmin = false,
  canPublish = true,
  canDelete = true,
}) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!isPublished && !isAdmin && courseStatus === "PENDING_REVIEW") return;
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/unpublish`);
        toast.success("Course unpublished");
      } else if (isAdmin) {
        await axios.patch(`/api/courses/${courseId}/publish`);
        toast.success("Course published to catalog");
        confetti.onOpen();
      } else {
        await axios.patch(`/api/courses/${courseId}/submit-review`);
        toast.success("Course submitted for admin review");
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
      await axios.delete(`/api/courses/${courseId}/`);
      toast.success("Course deleted successfully");
      router.refresh();
      router.push(`/teacher/courses/`);
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
          disabled={disabled || isLoading || (!isPublished && !isAdmin && courseStatus === "PENDING_REVIEW")}
          variant={isPublished || courseStatus === "PENDING_REVIEW" ? "outline" : "default"}
          size="sm"
          className={!isPublished && courseStatus !== "PENDING_REVIEW" ? "bg-ochre-500 hover:bg-ochre-600 text-ink-950 font-semibold" : "border-ink-200"}
        >
          {isPublished ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1.5" />
              Unpublish
            </>
          ) : (
            <>
              <Globe2 className="h-3.5 w-3.5 mr-1.5" />
              {courseStatus === "PENDING_REVIEW" ? "Awaiting Admin Review" : "Submit for Review"}
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
