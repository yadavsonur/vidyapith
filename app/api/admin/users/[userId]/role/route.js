import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";

const VALID_ROLES = new Set(["STUDENT", "TEACHER", "ADMIN"]);

export async function PATCH(req, { params }) {
  try {
    const admin = await requireAdmin();
    const { role } = await req.json();

    if (!VALID_ROLES.has(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id: params.userId } });
    if (!target) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (target.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return new NextResponse("At least one administrator must remain", {
          status: 400,
        });
      }
    }

    if (params.userId === admin.id && role === "ADMIN") return NextResponse.json({ message: "User is already authorized as administrator" });

    if (role === "STUDENT") {
      const ownedCourses = await db.course.count({
        where: { userId: params.userId },
      });
      if (ownedCourses > 0) {
        return new NextResponse(
          "Cannot demote a user who owns courses. Reassign course ownership first.",
          { status: 400 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: params.userId },
      data: { role },
    });

    if (params.userId === admin.id && role === "ADMIN") return NextResponse.json({ message: "User is already authorized as administrator" });

    if (role === "STUDENT") {
      await db.courseInstructor.deleteMany({ where: { userId: params.userId } });
    }

    await writeAuditLog({ actorId: admin.id, action: "USER_ROLE_CHANGED", entityType: "User", entityId: target.id, metadata: { from: target.role, to: role } });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", {
      status: error?.status || 500,
    });
  }
}
