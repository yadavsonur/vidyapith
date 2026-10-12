"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyCertificateForm() {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setResult(null);
    try { const { data } = await axios.get(`/api/certificates/verify?number=${encodeURIComponent(number.trim())}`); setResult(data); }
    catch (error) { setResult(error?.response?.data || { valid: false }); }
    finally { setLoading(false); }
  };
  return <div className="border border-ink-200 rounded-xl bg-white p-6 shadow-subtle space-y-5"><form onSubmit={submit} className="flex gap-2"><input required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="VID-…" className="flex-1 border border-ink-200 rounded-md px-3 py-2 font-mono text-sm" /><Button disabled={loading}>{loading ? "Checking…" : "Verify"}</Button></form>{result && (result.valid ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 text-emerald-800 font-medium"><CheckCircle2 className="h-5 w-5" /> Credential verified</div><div className="mt-3 text-sm text-ink-800"><div><strong>Learner:</strong> {result.certificate.studentName}</div><div><strong>Course:</strong> {result.certificate.course.title}</div><div><strong>Issued:</strong> {new Date(result.certificate.issuedAt).toLocaleDateString()}</div></div></div> : <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800 flex items-center gap-2"><XCircle className="h-5 w-5" /> Certificate not found or revoked.</div>)}{result?.certificate?.course?.id && <Link href={`/certificates/${result.certificate.id || ""}`} className="text-xs underline text-ink-700">Open credential</Link>}</div>;
}
