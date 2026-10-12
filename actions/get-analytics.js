import { db } from "@/lib/db";

export const getAnalytics = async (user) => {
  try {
    const where = user.role === "ADMIN"
      ? { status: "SUCCEEDED" }
      : {
          status: "SUCCEEDED",
          course: {
            OR: [
              { userId: user.id },
              { instructors: { some: { userId: user.id } } },
            ],
          },
        };

    const purchases = await db.purchase.findMany({
      where,
      include: { course: true },
    });

    const grouped = {};
    for (const purchase of purchases) {
      grouped[purchase.course.title] = (grouped[purchase.course.title] || 0) + Number(purchase.amount ?? purchase.course.price ?? 0);
    }

    const data = Object.entries(grouped).map(([name, total]) => ({ name, total }));
    const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);
    return { data, totalRevenue, totalSales: purchases.length };
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return { data: [], totalRevenue: 0, totalSales: 0 };
  }
};
