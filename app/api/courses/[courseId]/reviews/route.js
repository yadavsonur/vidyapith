import { db } from "@/lib/db";
import { requireAuth, ROLES } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const reviews = await db.courseReview.findMany({
      where: { courseId: params.courseId, status: "APPROVED" },
      include: { user: { select: { id: true, profile: { select: { displayName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}

const validate = ({ rating, review }) => {
  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return "Rating must be an integer from 1 to 5";
  }
  if (review != null && String(review).length > 4000) return "Review is too long";
  return null;
};

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validationError = validate(body);
    if (validationError) return new NextResponse(validationError, { status: 400 });

    const [enrollment, purchase] = await Promise.all([
      db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: params.courseId } } }),
      db.purchase.findUnique({ where: { userId_courseId: { userId: user.id, courseId: params.courseId } } }),
    ]);
    if ((enrollment?.status === "CANCELLED" || !enrollment) && purchase?.status !== "SUCCEEDED") {
      return new NextResponse("Enroll in the course before reviewing it", { status: 403 });
    }

    const review = await db.courseReview.create({
      data: {
        userId: user.id,
        courseId: params.courseId,
        rating: Number(body.rating),
        review: body.review ? String(body.review).trim() : null,
      },
    });
    return NextResponse.json(review);
  } catch (error) {
    const status = error?.code === "P2002" ? 409 : error?.status || 500;
    return new NextResponse(
      error?.code === "P2002" ? "You have already reviewed this course" : error?.message || "Internal Error",
      { status }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validationError = validate(body);
    if (validationError) return new NextResponse(validationError, { status: 400 });

    const existing = await db.courseReview.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
    });
    if (!existing) return new NextResponse("Review not found", { status: 404 });

    const review = await db.courseReview.update({
      where: { id: existing.id },
      data: { rating: Number(body.rating), review: body.review ? String(body.review).trim() : null, status: "PENDING", moderatedBy: null, moderatedAt: null },
    });
    return NextResponse.json(review);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth();
    const review = await db.courseReview.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
    });
    if (!review && user.role !== ROLES.ADMIN) return new NextResponse("Review not found", { status: 404 });
    if (user.role === ROLES.ADMIN) {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("reviewId");
      if (id) {
        const target = await db.courseReview.findFirst({ where: { id, courseId: params.courseId } });
        if (!target) return new NextResponse("Review not found", { status: 404 });
        await db.courseReview.delete({ where: { id: target.id } });
      } else if (review) {
        await db.courseReview.delete({ where: { id: review.id } });
      }
    } else {
      await db.courseReview.delete({ where: { id: review.id } });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
