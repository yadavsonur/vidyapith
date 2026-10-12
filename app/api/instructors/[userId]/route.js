import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.userId },
      include: { profile: true },
    });
    if (!user || !["TEACHER", "ADMIN"].includes(user.role)) return new NextResponse("Instructor not found", { status: 404 });

    const [owned, assigned, reviews, students] = await Promise.all([
      db.course.findMany({ where: { userId: user.id, isPublished: true }, include: { category: true, chapters: { where: { isPublished: true }, select: { id: true } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy: { createAt: "desc" } }),
      db.course.findMany({ where: { isPublished: true, instructors: { some: { userId: user.id } }, NOT: { userId: user.id } }, include: { category: true, chapters: { where: { isPublished: true }, select: { id: true } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy: { createAt: "desc" } }),
      db.courseReview.findMany({ where: { status: "APPROVED", course: { OR: [{ userId: user.id }, { instructors: { some: { userId: user.id } } }] } }, select: { rating: true } }),
      db.enrollment.findMany({ where: { course: { OR: [{ userId: user.id }, { instructors: { some: { userId: user.id } } }] } }, select: { userId: true }, distinct: ["userId"] }),
    ]);

    const courses = [...owned, ...assigned];
    const allRatings = reviews.map((r) => r.rating);
    const averageRating = allRatings.length ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;

    return NextResponse.json({
      userId: user.id,
      role: user.role,
      profile: user.profile,
      courses,
      stats: { courseCount: courses.length, studentCount: students.length, reviewCount: reviews.length, averageRating },
    });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
