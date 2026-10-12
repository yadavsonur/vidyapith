"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export function DiscussionPanel({ courseId, chapterId = null }) {
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyFor, setReplyFor] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => { try { const { data } = await axios.get(`/api/courses/${courseId}/discussions`); setThreads(data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, [courseId]);
  const createThread = async (event) => { event.preventDefault(); if (!title.trim() || !content.trim()) return; await axios.post(`/api/courses/${courseId}/discussions`, { title, content, chapterId }); setTitle(""); setContent(""); load(); };
  const postReply = async (threadId) => { if (!reply.trim()) return; await axios.post(`/api/courses/${courseId}/discussions/${threadId}/posts`, { content: reply }); setReply(""); setReplyFor(null); load(); };
  return <section className="space-y-5">
    <div><div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700">Course Q&A</div><h2 className="font-serif text-2xl font-medium text-ink-950">Discussions & Questions</h2></div>
    <form onSubmit={createThread} className="rounded-xl border border-ink-200 bg-white p-5 space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Question title" className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm" maxLength={255}/>
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Ask the faculty or share a useful explanation" className="w-full border border-ink-200 rounded-md px-3 py-2 text-sm min-h-24" maxLength={20000}/>
      <Button type="submit" className="bg-ink-900">Start discussion</Button>
    </form>
    {loading ? <div className="text-xs text-ink-400">Loading discussions…</div> : threads.length ? <div className="space-y-3">{threads.map(thread=><article key={thread.id} className="rounded-xl border border-ink-200 bg-white p-5"><div className="flex justify-between gap-4"><div><h3 className="font-serif font-medium text-ink-950">{thread.title}</h3><p className="text-sm text-ink-700 mt-2 whitespace-pre-wrap">{thread.content}</p></div><span className="text-[10px] font-mono text-ink-400">{thread._count.posts} replies</span></div><button type="button" className="mt-4 text-xs font-mono text-ochre-700" onClick={()=>setReplyFor(replyFor===thread.id?null:thread.id)}>{replyFor===thread.id?"Cancel":"Reply"}</button>{replyFor===thread.id&&<div className="mt-3 flex gap-2"><textarea value={reply} onChange={e=>setReply(e.target.value)} className="flex-1 border border-ink-200 rounded-md p-2 text-sm" placeholder="Write a reply"/><Button type="button" size="sm" onClick={()=>postReply(thread.id)}>Post</Button></div>}</article>)}</div> : <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-xs text-ink-400">No questions yet. Start the first discussion.</div>}
  </section>;
}
