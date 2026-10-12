"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function CategoryManager({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const add = async (event) => { event.preventDefault(); if (!name.trim()) return; try { const { data } = await axios.post("/api/admin/categories", { name }); setCategories((items) => [...items, { ...data, _count: { courses: 0 } }].sort((a,b) => a.name.localeCompare(b.name))); setName(""); toast.success("Category created"); } catch (error) { toast.error(error?.response?.data || "Unable to create category"); } };
  const rename = async (category) => { const next = window.prompt("Category name", category.name); if (!next || next.trim() === category.name) return; try { const { data } = await axios.patch(`/api/admin/categories/${category.id}`, { name: next }); setCategories((items) => items.map((item) => item.id === category.id ? { ...item, name: data.name } : item)); } catch (error) { toast.error(error?.response?.data || "Unable to rename category"); } };
  const remove = async (category) => { if (category._count.courses) return toast.error("Reassign courses before deleting this category"); try { await axios.delete(`/api/admin/categories/${category.id}`); setCategories((items) => items.filter((item) => item.id !== category.id)); } catch (error) { toast.error(error?.response?.data || "Unable to delete category"); } };
  return <div className="space-y-4"><form onSubmit={add} className="flex gap-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="flex-1 border border-ink-200 rounded-md px-3 py-2" /><Button type="submit">Add</Button></form><div className="grid md:grid-cols-2 gap-3">{categories.map((c) => <div key={c.id} className="border border-ink-200 rounded-xl bg-white p-5 flex justify-between gap-3"><div><div className="font-serif">{c.name}</div><div className="text-xs font-mono text-ink-400">{c._count?.courses || 0} courses</div></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => rename(c)}>Rename</Button><Button size="sm" variant="ghost" onClick={() => remove(c)}>Delete</Button></div></div>)}</div></div>;
}
