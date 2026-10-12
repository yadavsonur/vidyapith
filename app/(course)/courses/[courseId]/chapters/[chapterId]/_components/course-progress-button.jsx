"use client";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        { isCompleted: !isCompleted }
      );
      if (!isCompleted && !nextChapterId && data?.completion?.completed) confetti.onOpen();
      toast.success("Progress record saved");
      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      type="button"
      variant={isCompleted ? "outline" : "default"}
      className={
        isCompleted
          ? "w-full md:w-auto border-ink-200 text-ink-700 hover:text-ink-950"
          : "w-full md:w-auto bg-sage-700 hover:bg-sage-800 text-white"
      }
    >
      {isCompleted ? (
        <>
          <RotateCcw className="h-3.5 w-3.5 mr-2 text-ink-500" />
          Mark as Incomplete
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
          Complete & Next Lesson
        </>
      )}
    </Button>
  );
};
