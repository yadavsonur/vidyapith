"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function CompletionRulesForm({ courseId }) {
  const [data, setData] = useState({ requireAllLessons: true, minimumProgress: 100, requireAllQuizzes: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    axios.get(`/api/courses/${courseId}/completion-rules`).then(({ data }) => setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, [courseId]);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try { const { data: saved } = await axios.put(`/api/courses/${courseId}/completion-rules`, data); setData(saved); toast.success("Completion rules saved"); }
    catch (error) { toast.error(error?.response?.data || "Unable to save completion rules"); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="text-xs font-mono text-ink-400">Loading completion policy…</div>;
  return <form onSubmit={save} className="rounded-lg border border-ink-200 bg-white p-5 space-y-4">
    <div><h3 className="font-serif text-base">Completion & Certificate Policy</h3><p className="text-xs text-ink-500 mt-1">Certificates are issued only after these server-side rules pass.</p></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.requireAllLessons} onChange={(e) => setData({ ...data, requireAllLessons: e.target.checked })} /> Require every required lesson</label>
    <label className="block text-sm"><span className="text-xs font-mono uppercase text-ink-500">Minimum progress %</span><input type="number" min="0" max="100" value={data.minimumProgress} onChange={(e) => setData({ ...data, minimumProgress: Number(e.target.value) })} className="mt-1 w-full border border-ink-200 rounded-md px-3 py-2" /></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.requireAllQuizzes} onChange={(e) => setData({ ...data, requireAllQuizzes: e.target.checked })} /> Require all published required quizzes</label>
    <Button disabled={saving} type="submit" className="bg-ink-900">{saving ? "Saving…" : "Save policy"}</Button>
  </form>;
}
