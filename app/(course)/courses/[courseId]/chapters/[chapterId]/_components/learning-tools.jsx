"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bookmark, BookmarkCheck, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function LearningTools({ courseId, chapterId, bookmarked: initialBookmarked = false }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => { try { const { data } = await axios.get(`/api/courses/${courseId}/notes`); setNotes(data.filter(n => n.chapterId === chapterId)); } catch {} };
  useEffect(() => { load(); }, [courseId, chapterId]);
  const toggleBookmark = async () => { try { if (bookmarked) { await axios.delete(`/api/courses/${courseId}/bookmarks?chapterId=${chapterId}`); setBookmarked(false); } else { await axios.post(`/api/courses/${courseId}/bookmarks`, { chapterId }); setBookmarked(true); } } catch (e) { toast.error(e?.response?.data || "Unable to update bookmark"); } };
  const addNote = async (e) => { e.preventDefault(); if (!content.trim()) return; setLoading(true); try { await axios.post(`/api/courses/${courseId}/notes`, { chapterId, content }); setContent(""); load(); toast.success("Note saved"); } catch (e) { toast.error(e?.response?.data || "Unable to save note"); } finally { setLoading(false); } };
  const removeNote = async (id) => { try { await axios.delete(`/api/courses/${courseId}/notes?noteId=${id}`); load(); } catch {} };
  return <div className="grid md:grid-cols-[auto_1fr] gap-4"><Button type="button" variant="outline" onClick={toggleBookmark} className="border-ink-200"><span className="flex items-center gap-2">{bookmarked?<BookmarkCheck className="h-4 w-4"/>:<Bookmark className="h-4 w-4"/>}{bookmarked?"Bookmarked":"Bookmark lesson"}</span></Button><div className="rounded-xl border border-ink-200 bg-white p-5 space-y-4"><div className="flex items-center gap-2 font-serif"><StickyNote className="h-4 w-4"/>Personal notes</div><form onSubmit={addNote} className="flex gap-2"><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write a private study note…" className="flex-1 border border-ink-200 rounded-md p-2 text-sm min-h-20"/><Button disabled={loading} type="submit" size="sm">Save</Button></form>{notes.map(n=><div key={n.id} className="border-t border-ink-100 pt-3 flex items-start justify-between gap-4"><p className="text-sm text-ink-700 whitespace-pre-wrap">{n.content}</p><button onClick={()=>removeNote(n.id)} type="button" aria-label="Delete note" className="text-ink-400 hover:text-red-700"><Trash2 className="h-4 w-4"/></button></div>)}</div></div>;
}
