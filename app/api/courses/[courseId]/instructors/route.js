import { db } from "@/lib/db";
import { requireCourseOwner } from "@/lib/auth";
import { NextResponse } from "next/server";

const getManager = async (courseId) => {
  try {
    return await requireCourseOwner(courseId);
  } catch (error) {
    if (error?.status !== 403) throw error;
    throw error;
  }
};

export async function GET(req, { params }) {
  try {
    const { user, course } = await getManager(params.courseId);
    void user;
    const instructors = await db.courseInstructor.findMany({
      where: { courseId: params.courseId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ ownerId: course.userId, instructors });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}

export async function POST(req, { params }) {
  try {
    const { user } = await getManager(params.courseId);
    const { userId, role } = await req.json();

    if (!userId || !["EDITOR", "INSTRUCTOR"].includes(role)) {
      return new NextResponse("Invalid instructor data", { status: 400 });
    }

    if (userId === user.id) {
      return new NextResponse("The course owner is already an owner", { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return new NextResponse(
        "User not found. Promote the Clerk user to TEACHER in Admin management first.",
        { status: 404 }
      );
    }

    if (!["TEACHER", "ADMIN"].includes(targetUser.role)) {
      return new NextResponse("Only teachers can be assigned to a course", {
        status: 400,
      });
    }

    const instructor = await db.courseInstructor.upsert({
      where: {
        courseId_userId: {
          courseId: params.courseId,
          userId,
        },
      },
      update: { role },
      create: {
        courseId: params.courseId,
        userId,
        role,
      },
    });

    return NextResponse.json(instructor);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    await getManager(params.courseId);

    if (!userId) {
      return new NextResponse("userId is required", { status: 400 });
    }

    const assignment = await db.courseInstructor.findUnique({
      where: {
        courseId_userId: {
          courseId: params.courseId,
          userId,
        },
      },
    });

    if (!assignment) {
      return new NextResponse("Instructor assignment not found", { status: 404 });
    }
    if (userId === (await db.course.findUnique({ where: { id: params.courseId }, select: { userId: true } }))?.userId) {
      return new NextResponse("The course owner cannot be removed", { status: 400 });
    }

    await db.courseInstructor.delete({
      where: { id: assignment.id },
    });

    return new NextResponse("Removed", { status: 200 });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
