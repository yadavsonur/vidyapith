import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseMobileSidebar } from "./course-mobile-sidebar";

export const CourseNavbar = ({ course, progressCount, role }) => (
  <header className="px-6 h-full flex items-center bg-white/80 backdrop-blur-md border-b border-ink-200/80 shadow-subtle">
    <CourseMobileSidebar course={course} progressCount={progressCount} />
    <NavbarRoutes role={role} />
  </header>
);
