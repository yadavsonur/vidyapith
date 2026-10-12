"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function DiscussionModerationForm({ threadId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const update = async (next) => { try { const { data } = await axios.patch(`/api/admin/discussions/${threadId}`, { status: next }); setStatus(data.status); toast.success("Discussion status updated"); } catch (error) { toast.error(error?.response?.data || "Unable to moderate discussion"); } };
  return <div className="flex gap-2 items-center flex-wrap"><span className="text-[10px] font-mono text-ink-400">{status}</span><Button size="sm" onClick={() => update("OPEN")} disabled={status === "OPEN"}>Open</Button><Button size="sm" variant="outline" onClick={() => update("CLOSED")} disabled={status === "CLOSED"}>Close</Button><Button size="sm" variant="ghost" onClick={() => update("HIDDEN")} disabled={status === "HIDDEN"}>Hide</Button></div>;
}
