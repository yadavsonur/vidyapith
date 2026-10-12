import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Star,
  Receipt,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Stat = ({ icon: Icon, label, value, highlight }) => (
  <div className="border border-ink-200/90 rounded-lg bg-white p-5 shadow-subtle space-y-2 hover:border-ink-300 transition-colors">
    <div className="flex items-center gap-2 text-ink-500 text-xs font-mono uppercase tracking-wider">
      <Icon className="h-3.5 w-3.5 text-ochre-600" />
      <span>{label}</span>
    </div>
    <div className="font-serif text-3xl font-bold text-ink-950">
      {value}
    </div>
  </div>
);

const AdminDashboardPage = async () => {
  await requireAdmin();
  const [
    users,
    teachers,
    courses,
    publishedCourses,
    enrollments,
    reviews,
    purchases,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "TEACHER" } }),
    db.course.count(),
    db.course.count({ where: { isPublished: true } }),
    db.enrollment.count({ where: { status: { not: "CANCELLED" } } }),
    db.courseReview.count(),
    db.purchase.findMany({
      where: { status: "SUCCEEDED" },
      select: { amount: true },
    }),
  ]);

  const revenue = purchases.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-ink-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-lapis-700" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
            Administrative Registry & Stats
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
            Institutional ledger of user roles, course publication statuses, and treasury settlements.
          </p>
        </div>

        <Link href="/admin/users">
          <Button size="sm" className="bg-ink-900 text-parchment-50 hover:bg-ink-800">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Manage Scholars & Faculty
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-500">
          Platform Demographics
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="Total Registered Users" value={users} />
          <Stat icon={ShieldCheck} label="Appointed Faculty" value={teachers} />
          <Stat
            icon={BookOpen}
            label="Curricula Catalogued"
            value={`${publishedCourses} / ${courses}`}
          />
          <Stat icon={GraduationCap} label="Total Enrollments" value={enrollments} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-500">
          Treasury & Quality Feedback
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon={Receipt} label="Gross Tuition Volume" value={formatPrice(revenue)} />
          <Stat icon={Star} label="Scholar Reviews Logged" value={reviews} />
          <Stat
            icon={BookOpen}
            label="Settled Invoices"
            value={purchases.length}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
