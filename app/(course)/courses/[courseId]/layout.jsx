import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProgress } from "@/actions/get-progress";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { getCurrentAppUser } from "@/lib/auth";

const CourseLayout = async ({ children, params }) => {
  const { userId } = auth();
  const appUser = await getCurrentAppUser();
  const chapterInclude = userId ? { userProgress: { where: { userId } } } : {};
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      category: true,
      chapters: {
        where: { isPublished: true },
        include: chapterInclude,
        orderBy: { position: "asc" },
      },
      reviews: { select: { rating: true } },
      instructors: { include: { user: { include: { profile: true } } }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!course) return redirect("/");
  const progressCount = userId ? await getProgress(userId, course.id) : 0;

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount} role={appUser?.role || null} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} userId={userId} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
