import { requireTeacher } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/actions/get-analytics";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import { BarChart3 } from "lucide-react";

const AnalyticsPage = async () => {
  try {
    const user = await requireTeacher();
    const { data, totalRevenue, totalSales } = await getAnalytics(user);

    return (
      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
        <div className="border-b border-ink-200/80 pb-6">
          <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Faculty Financial Insights</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
            Yield & Matriculation Analytics
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
            Review earnings generated across your curriculum catalog and cumulative enrollment volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DataCard label="Total Accrued Revenue" value={totalRevenue} shouldFormat />
          <DataCard label="Total Matriculations / Sales" value={totalSales} />
        </div>

        <div className="border border-ink-200/90 rounded-lg p-6 bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <div>
              <h2 className="font-serif text-lg font-medium text-ink-950">
                Revenue Ingress by Coursework
              </h2>
              <p className="text-xs text-ink-500">Distribution of tuition receipts across active titles</p>
            </div>
            <span className="font-mono text-xs text-ink-400 uppercase tracking-wider">
              USD Currency
            </span>
          </div>
          <Chart data={data} />
        </div>
      </div>
    );
  } catch {
    return redirect("/");
  }
};

export default AnalyticsPage;
