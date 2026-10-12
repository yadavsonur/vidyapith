"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotificationsClient({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const unread = items.filter((item) => !item.readAt).length;
  const markAll = async () => { try { await axios.patch("/api/notifications", { all: true }); setItems((current) => current.map((item) => ({ ...item, readAt: new Date().toISOString() }))); } catch {} };
  const open = async (item) => { if (!item.readAt) { try { await axios.patch("/api/notifications", { notificationId: item.id }); setItems((current) => current.map((row) => row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row)); } catch {} } };
  return <div className="space-y-3"><div className="flex justify-end">{unread > 0 && <Button size="sm" variant="outline" onClick={markAll}>Mark all as read ({unread})</Button>}</div><div className="divide-y divide-ink-100 border border-ink-200 rounded-xl bg-white">{items.length?items.map((x)=><Link onClick={()=>open(x)} key={x.id} href={x.link||"/"} className={`block p-5 ${x.readAt?"":"bg-parchment-50"}`}><div className="font-medium text-ink-950">{x.title}</div><p className="text-sm text-ink-600 mt-1">{x.body}</p><div className="text-[10px] font-mono text-ink-400 mt-2">{new Date(x.createdAt).toLocaleString()}</div></Link>):<div className="p-10 text-center text-sm text-ink-400">No notifications yet.</div>}</div></div>;
}
