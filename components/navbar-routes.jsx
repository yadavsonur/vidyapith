"use client";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut, ShieldCheck, UserRound, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";

export const NavbarRoutes = ({ role }) => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isAdminPage = pathname?.startsWith("/admin");
  const isCoursePage = pathname?.startsWith("/courses/");
  const isSearchPage = pathname === "/search";
  const isTeacher = role === "TEACHER" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2.5 ml-auto items-center">
        {isTeacherPage || isCoursePage || isAdminPage ? (
          <Link href="/">
            <Button size="sm" variant="outline" className="border-ink-200">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Exit Studio
            </Button>
          </Link>
        ) : (
          <>
            {isTeacher && (
              <Link href="/teacher/courses">
                <Button size="sm" variant="outline" className="border-ink-200 text-ink-800">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-ochre-600" />
                  Teacher Studio
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <Button size="sm" variant="outline" className="border-ink-200 text-ink-800">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-lapis-700" />
                  Governance
                </Button>
              </Link>
            )}
            {!role && (
              <>
                <Link href="/sign-in">
                  <Button size="sm" variant="ghost" className="text-ink-700">
                    <UserRound className="h-3.5 w-3.5 mr-1.5" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" variant="default">
                    Enroll
                  </Button>
                </Link>
              </>
            )}
          </>
        )}
        {role && (
          <div className="pl-2 border-l border-ink-200/80">
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </div>
    </>
  );
};
