import { db } from "@/lib/db";
import { calculateProgressPercentage } from "@/lib/progress";

export const getProgress = async (userId, courseId) => {
  try {
    const [total, completed] = await Promise.all([
      db.chapter.count({
        where: { courseId, isPublished: true },
      }),
      db.userProgress.count({
        where: {
          userId,
          isCompleted: true,
          chapter: { courseId, isPublished: true },
        },
      }),
    ]);

    return calculateProgressPercentage(completed, total);
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
};
