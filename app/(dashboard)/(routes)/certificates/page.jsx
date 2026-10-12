import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function CertificatesPage() {
  const { userId } = auth(); if (!userId) return redirect("/sign-in");
  const certificates = await db.certificate.findMany({ where: { userId, revokedAt: null }, include: { course: { select: { id: true, title: true } } }, orderBy: { issuedAt: "desc" } });
  return <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6"><div><div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700">Academic Record</div><h1 className="font-serif text-3xl font-medium text-ink-950">Certificates</h1></div>{certificates.length?<div className="grid md:grid-cols-2 gap-4">{certificates.map(c=><Link key={c.id} href={`/certificates/${c.id}`} className="border border-ink-200 rounded-xl bg-white p-5 hover:border-ink-400"><div className="text-xs font-mono text-ink-400">{c.certificateNumber}</div><h2 className="font-serif text-xl mt-2">{c.course.title}</h2><p className="text-xs text-ink-500 mt-2">Issued {new Date(c.issuedAt).toLocaleDateString()}</p></Link>)}</div>:<div className="border border-dashed border-ink-200 rounded-xl p-10 text-center text-sm text-ink-400">Certificates will appear here after course completion.</div>}</div>;
}
