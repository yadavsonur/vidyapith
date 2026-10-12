"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function ReviewModerationForm({ reviewId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const update = async (next) => { try { const { data } = await axios.patch(`/api/admin/reviews/${reviewId}`, { status: next }); setStatus(data.status); toast.success("Review moderation updated"); } catch (error) { toast.error(error?.response?.data || "Unable to moderate review"); } };
  return <div className="flex gap-2 items-center flex-wrap"><span className="text-[10px] font-mono text-ink-400">{status}</span><Button size="sm" onClick={() => update("APPROVED")} disabled={status === "APPROVED"}>Approve</Button><Button size="sm" variant="outline" onClick={() => update("HIDDEN")} disabled={status === "HIDDEN"}>Hide</Button></div>;
}
