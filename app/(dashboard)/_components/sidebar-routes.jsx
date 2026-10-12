"use client";
import { BarChart, BookOpen, Compass, Layout, List, Receipt, ShieldCheck, UserCircle, Bookmark, Bell, Award, Users, Tags, MessageSquare, CreditCard, ScrollText } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const studentRoutes = [
  { icon: Layout, label: "My Learning", href: "/" },
  { icon: Compass, label: "Browse", href: "/search" },
  { icon: BookOpen, label: "My Courses", href: "/my-courses" },
  { icon: Receipt, label: "Payments", href: "/payments" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { icon: Award, label: "Certificates", href: "/certificates" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
];

const teacherRoutes = [
  { icon: List, label: "Courses", href: "/teacher/courses" },
  { icon: BarChart, label: "Analytics", href: "/teacher/analytics" },
  { icon: UserCircle, label: "Instructor Profile", href: "/teacher/profile" },
  { icon: Users, label: "Faculty Workspace", href: "/teacher" },
];

const adminRoutes = [
  { icon: ShieldCheck, label: "Admin Dashboard", href: "/admin" },
  { icon: UserCircle, label: "Users", href: "/admin/users" },
  { icon: Tags, label: "Categories", href: "/admin/categories" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: MessageSquare, label: "Moderation", href: "/admin/reviews" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: Award, label: "Certificates", href: "/admin/certificates" },
  { icon: ScrollText, label: "Audit Log", href: "/admin/audit" },
];

export const SidebarRoutes = ({ role }) => {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") && role === "ADMIN") {
    return <div className="flex flex-col w-full">{adminRoutes.map((route) => <SidebarItem key={route.href} {...route} />)}</div>;
  }
  if (pathname?.startsWith("/teacher") && (role === "TEACHER" || role === "ADMIN")) {
    return <div className="flex flex-col w-full">{teacherRoutes.map((route) => <SidebarItem key={route.href} {...route} />)}</div>;
  }
  return <div className="flex flex-col w-full">{studentRoutes.map((route) => <SidebarItem key={route.href} {...route} />)}</div>;
};
