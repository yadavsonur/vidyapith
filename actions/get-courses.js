import { db } from "@/lib/db";

export const getCourses = async ({ userId, title = "", categoryId, minPrice, maxPrice, minRating, instructorId, sort = "newest", page = 1, pageSize = 24 }) => {
  try {
    const price = {};
    if (minPrice !== undefined && minPrice !== "") price.gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== "") price.lte = Number(maxPrice);
    const where = {
      isPublished: true,
      ...(title ? { title: { contains: title } } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(Object.keys(price).length ? { price } : {}),
      ...(instructorId ? { OR: [{ userId: instructorId }, { instructors: { some: { userId: instructorId } } }] } : {}),
    };
    const orderBy = sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : sort === "oldest" ? { createAt: "asc" } : { createAt: "desc" };
    const courses = await db.course.findMany({
      where,
      include: {
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        chapters: { where: { isPublished: true }, select: { id: true } },
        _count: { select: { enrollments: true } },
        ...(userId ? {
          purchases: { where: { userId, status: "SUCCEEDED" }, select: { id: true } },
          enrollments: { where: { userId, status: { not: "CANCELLED" } }, select: { id: true, status: true } },
        } : {}),
      },
      orderBy,
    });
    const enriched = courses.map((course) => {
      const ratings = course.reviews.map((r) => r.rating);
      return { course, averageRating: ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0, ratingCount: ratings.length, access: !!(course.purchases?.length || course.enrollments?.length) };
    }).filter(({ averageRating }) => !minRating || minRating === "" || averageRating >= Number(minRating));
    if (sort === "rating") enriched.sort((a,b)=>b.averageRating-a.averageRating);
    if (sort === "popular") enriched.sort((a,b)=>b.course._count.enrollments-a.course._count.enrollments);
    const total = enriched.length;
    const start = (Math.max(1, Number(page)) - 1) * Math.min(100, Math.max(1, Number(pageSize)));
    return { items: enriched.slice(start, start + Math.min(100, Math.max(1, Number(pageSize)))).map(({course,averageRating,ratingCount,access})=>({ ...course, averageRating, ratingCount, progress: null, access })), total, page: Math.max(1, Number(page)), pageSize: Math.min(100, Math.max(1, Number(pageSize))), pages: Math.ceil(total / Math.min(100, Math.max(1, Number(pageSize)))) };
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return { items: [], total: 0, page: 1, pageSize: Number(pageSize) || 24, pages: 0 };
  }
};
