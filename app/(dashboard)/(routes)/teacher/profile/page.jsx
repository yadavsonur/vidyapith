import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeacherProfileForm } from "./_components/teacher-profile-form";
import { UserCheck } from "lucide-react";

const TeacherProfilePage = async () => {
  const user = await requireTeacher();
  const profile = await db.instructorProfile.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-ink-200/80 pb-6">
        <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
          <UserCheck className="h-3.5 w-3.5" />
          <span>Faculty Credentials</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
          Public Instructor Profile
        </h1>
        <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
          This biography, expertise ledger, and portfolio link will be rendered on public course listings.
        </p>
      </div>

      <TeacherProfileForm initialData={profile || {}} />
    </div>
  );
};

export default TeacherProfilePage;
