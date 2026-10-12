"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Download, Plus, Trash2 } from "lucide-react";

export function ChapterResourceForm({ courseId, chapterId, initialResources = [] }) {
  const [resources, setResources] = useState(initialResources);
  const [form, setForm] = useState({ name: "", url: "" });
  const [saving, setSaving] = useState(false);

  const add = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/resources`, { chapterId, ...form });
      setResources((items) => [data, ...items]);
      setForm({ name: "", url: "" });
      toast.success("Resource added");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to add resource");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`/api/courses/${courseId}/resources/${id}`);
      setResources((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error?.response?.data || "Unable to remove resource");
    }
  };

  return <div className="rounded-lg border border-ink-200 bg-white p-5 space-y-4">
    <div className="flex items-center gap-2"><Download className="h-4 w-4 text-ochre-700" /><h3 className="font-serif text-base">Lesson Resources</h3></div>
    <form onSubmit={add} className="grid md:grid-cols-[1fr_2fr_auto] gap-2">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Resource name" className="border border-ink-200 rounded-md px-3 py-2 text-sm" />
      <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" className="border border-ink-200 rounded-md px-3 py-2 text-sm" type="url" />
      <Button type="submit" disabled={saving} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
    </form>
    {resources.map((resource) => <div key={resource.id} className="flex items-center justify-between border-t border-ink-100 pt-3 gap-3"><div className="min-w-0"><div className="text-sm font-medium truncate">{resource.name}</div><div className="text-[11px] font-mono text-ink-400 truncate">{resource.url}</div></div><button type="button" onClick={() => remove(resource.id)} className="text-ink-400 hover:text-red-700" aria-label={`Remove ${resource.name}`}><Trash2 className="h-4 w-4" /></button></div>)}
  </div>;
}
