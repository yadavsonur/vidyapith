import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRoleForm } from "./_components/user-role-form";
import Link from "next/link";
import { ArrowLeft, Users, ShieldAlert } from "lucide-react";

const AdminUsersPage = async () => {
  try {
    await requireAdmin();
  } catch {
    return redirect("/");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link
          href="/admin"
          className="inline-flex items-center text-xs font-mono text-ink-500 hover:text-ink-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Administrative Governance
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-ink-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
              <Users className="h-3.5 w-3.5 text-lapis-700" />
              <span>Role Permissions & Access Control</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
              Institutional User Register
            </h1>
            <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
              Appoint faculty privileges (TEACHER) or elevated governance authority (ADMIN) to scholars.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-ink-200/90 rounded-lg overflow-hidden bg-white shadow-subtle divide-y divide-ink-100">
        <div className="px-5 py-3 bg-parchment-100/70 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink-600">
          <span>Scholar ID & Registration Date</span>
          <span>Assigned Authority</span>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-ink-400">
            No scholars registered in the system registry yet.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-parchment-50/60 transition-colors"
            >
              <div className="space-y-1">
                <div className="font-mono text-xs font-semibold text-ink-950 break-all">
                  {user.id}
                </div>
                <div className="text-[11px] font-mono text-ink-400">
                  Enrolled on {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
              <div>
                <UserRoleForm userId={user.id} initialRole={user.role} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
