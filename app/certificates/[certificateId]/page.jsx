import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";

export default async function CertificatePage({ params }) {
  const certificate = await db.certificate.findUnique({
    where: { id: params.certificateId },
    include: {
      course: { select: { id: true, title: true } },
      user: { select: { studentProfile: { select: { displayName: true } }, profile: { select: { displayName: true } } } },
    },
  });
  if (!certificate || certificate.revokedAt) return redirect("/verify");
  const studentName = certificate.user.studentProfile?.displayName || certificate.user.profile?.displayName || "Learner";
  return <main className="min-h-screen bg-parchment-50 p-6 md:p-12 flex items-center justify-center">
    <section className="w-full max-w-4xl border-2 border-ink-900 bg-white shadow-elevated p-8 md:p-14 text-center space-y-8">
      <Link href="/verify" className="inline-flex items-center gap-2 text-xs font-mono text-ink-500 hover:text-ink-900"><ArrowLeft className="h-3.5 w-3.5" /> Verify another certificate</Link>
      <div><ShieldCheck className="h-10 w-10 mx-auto text-ochre-700" /><div className="text-[10px] font-mono uppercase tracking-[0.25em] text-ochre-700 mt-3">Vidhyapith Academic Credential</div><h1 className="font-serif text-4xl md:text-6xl font-medium text-ink-950 mt-2">Certificate of Completion</h1></div>
      <div className="space-y-3"><p className="text-xs font-mono uppercase text-ink-400">This certifies that</p><p className="font-serif text-3xl md:text-4xl text-ink-950">{studentName}</p><p className="text-sm text-ink-600">has successfully completed</p><p className="font-serif text-2xl text-ink-900">{certificate.course.title}</p></div>
      <div className="flex items-center justify-center gap-2 text-sm font-mono text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Valid credential</div>
      <div className="border-t border-ink-200 pt-5 grid sm:grid-cols-2 gap-3 text-left text-xs font-mono text-ink-500"><div><span className="text-ink-400">Certificate number</span><div className="text-ink-900 mt-1 break-all">{certificate.certificateNumber}</div></div><div><span className="text-ink-400">Issued</span><div className="text-ink-900 mt-1">{new Date(certificate.issuedAt).toLocaleDateString()}</div></div></div>
    </section>
  </main>;
}
