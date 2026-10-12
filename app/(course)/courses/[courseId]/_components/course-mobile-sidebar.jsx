import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CourseSidebar } from "./course-sidebar";
import { auth } from "@clerk/nextjs/server";

export const CourseMobileSidebar = async ({ course, progressCount }) => {
  const { userId } = auth();
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition"><Menu /></SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-72"><CourseSidebar course={course} progressCount={progressCount} userId={userId} /></SheetContent>
    </Sheet>
  );
};
