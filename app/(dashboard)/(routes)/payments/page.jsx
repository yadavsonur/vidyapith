import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Receipt, CheckCircle2, Clock } from "lucide-react";

const PaymentsPage = async () => {
  const user = await requireAuth();
  const purchases = await db.purchase.findMany({
    where: { userId: user.id },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-ink-200/80 pb-6">
        <div className="flex items-center gap-2 text-ochre-700 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
          <Receipt className="h-3.5 w-3.5" />
          <span>Bursar & Statements</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink-950">
          Payment Ledger
        </h1>
        <p className="text-xs md:text-sm text-ink-500 mt-1 font-sans">
          Historical invoice records for enrolled courses and lifetime access fees.
        </p>
      </div>

      <div className="border border-ink-200/90 rounded-lg overflow-hidden bg-white shadow-subtle">
        <div className="px-5 py-3 bg-parchment-100/70 border-b border-ink-200 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink-600">
          <span>Transaction & Course</span>
          <span>Settlement</span>
        </div>

        {purchases.length === 0 ? (
          <div className="p-10 text-center text-xs text-ink-500 font-mono">
            No transactions recorded in this scholar account yet.
          </div>
        ) : (
          purchases.map((purchase) => {
            const isSuccess = purchase.status === "SUCCEEDED";
            return (
              <div
                key={purchase.id}
                className="p-5 border-b border-ink-100 last:border-b-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-parchment-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-serif font-medium text-base text-ink-950">
                    {purchase.course.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-ink-500">
                    <span>{new Date(purchase.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      {isSuccess ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-sage-600" />
                          <span className="text-sage-700 font-semibold">{purchase.status}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 text-ochre-600" />
                          <span>{purchase.status}</span>
                        </>
                      )}
                    </span>
                    <span>·</span>
                    <span className="text-ink-400">ID: {purchase.id.slice(0, 10)}...</span>
                  </div>
                </div>

                <div className="font-mono text-base font-bold text-ink-950">
                  {formatPrice(purchase.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
