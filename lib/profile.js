import { db } from "@/lib/db";

export const getPublicUserName = async (userId) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } },
  });
  return user?.profile?.displayName || user?.studentProfile?.displayName || "Learner";
};
