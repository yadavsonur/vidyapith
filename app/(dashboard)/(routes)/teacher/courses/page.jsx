import { requireTeacher } from "@/lib/auth";
import { columns } from "./_components/column";
import { DataTable } from "./_components/data-table";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";

const CoursesPage = async () => {
  const user = await requireTeacher();

  const where =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { userId: user.id },
            {
              instructors: {
                some: { userId: user.id },
              },
            },
          ],
        };

  const courses = await db.course.findMany({
    where,
    orderBy: { createAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-ink-200/80 pb-6">
        <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Faculty Studio</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
          Course Roster & Modules
        </h1>
        <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
          Manage your authoring portfolio, publish chapter video assets, and configure enrollment fees.
        </p>
      </div>

      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
