import { db } from "@/lib/db";

export const createNotification = async ({ userId, type, title, body, link = null, dedupeKey = null, tx = db }) => {
  if (dedupeKey) {
    return tx.notification.upsert({
      where: { dedupeKey },
      update: {},
      create: { userId, type, title, body, link, dedupeKey },
    });
  }
  return tx.notification.create({ data: { userId, type, title, body, link } });
};

export const notifyCourseStudents = async ({ courseId, type, title, body, link = null, eventKey }) => {
  const enrollments = await db.enrollment.findMany({
    where: { courseId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { userId: true },
  });
  if (!enrollments.length) return [];
  const results = [];
  for (const enrollment of enrollments) {
    results.push(await createNotification({
      userId: enrollment.userId,
      type,
      title,
      body,
      link,
      dedupeKey: eventKey ? `${eventKey}:${enrollment.userId}` : null,
    }));
  }
  return results;
};
