import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  ROLES,
  COURSE_ROLES,
  COURSE_PERMISSIONS,
  COURSE_ROLE_PERMISSIONS,
  isStaffRole,
} from "@/lib/permissions";

export { ROLES, COURSE_ROLES, COURSE_PERMISSIONS, isStaffRole };

export class AuthorizationError extends Error {
  constructor(message = "Unauthorized", status = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

const BOOTSTRAP_ADMIN_ID = process.env.RBAC_BOOTSTRAP_ADMIN_ID || "user_3H26c55ljZpSP1Ybm5ovXhyD2b8";

export const getCurrentAppUser = async () => {
  const { userId } = auth();
  if (!userId) return null;

  const existingUser = await db.user.findUnique({ where: { id: userId } });
  if (existingUser) return existingUser;

  return db.user.create({
    data: {
      id: userId,
      role: userId === BOOTSTRAP_ADMIN_ID ? ROLES.ADMIN : ROLES.STUDENT,
    },
  });
};

export const requireAuth = async () => {
  const user = await getCurrentAppUser();
  if (!user) throw new AuthorizationError("Unauthorized", 401);
  return user;
};

export const requireRole = async (...allowedRoles) => {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError("Forbidden", 403);
  }
  return user;
};

export const requireTeacher = async () =>
  requireRole(ROLES.TEACHER, ROLES.ADMIN);

export const requireAdmin = async () => requireRole(ROLES.ADMIN);

export const getCourseAuthorization = async (courseId, permission) => {
  const user = await requireAuth();

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AuthorizationError("Not found", 404);

  if (user.role === ROLES.ADMIN) {
    return { user, course, courseRole: COURSE_ROLES.OWNER };
  }

  if (user.role !== ROLES.TEACHER) {
    throw new AuthorizationError("Forbidden", 403);
  }

  if (course.userId === user.id) {
    return { user, course, courseRole: COURSE_ROLES.OWNER };
  }

  const assignment = await db.courseInstructor.findUnique({
    where: { courseId_userId: { courseId, userId: user.id } },
  });

  if (!assignment) throw new AuthorizationError("Forbidden", 403);

  const allowed = COURSE_ROLE_PERMISSIONS[assignment.role];
  if (!allowed?.has(permission)) {
    throw new AuthorizationError("Forbidden", 403);
  }

  return { user, course, courseRole: assignment.role };
};

export const requireCoursePermission = async (courseId, permission) =>
  getCourseAuthorization(courseId, permission);

export const requireCourseOwner = async (courseId) =>
  getCourseAuthorization(courseId, COURSE_PERMISSIONS.MANAGE_INSTRUCTORS);
