"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function CourseGovernanceForm({ courseId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const update = async (nextStatus) => {
    setSaving(true);
    try { const { data } = await axios.patch(`/api/admin/courses/${courseId}`, { status: nextStatus, reviewNote: nextStatus === "REJECTED" ? "Please revise the course content and resubmit for review." : null }); setStatus(data.status); toast.success(`Course marked ${data.status.toLowerCase()}`); }
    catch (error) { toast.error(error?.response?.data || "Unable to update course"); }
    finally { setSaving(false); }
  };
  return <div className="flex items-center gap-2 flex-wrap">
    <span className="text-[10px] font-mono text-ink-400">{status}</span>
    {status !== "PUBLISHED" && <Button size="sm" disabled={saving} onClick={() => update("PUBLISHED")}>Approve</Button>}
    {status !== "REJECTED" && <Button size="sm" variant="outline" disabled={saving} onClick={() => update("REJECTED")}>Reject</Button>}
    {status !== "ARCHIVED" && status === "PUBLISHED" && <Button size="sm" variant="ghost" disabled={saving} onClick={() => update("ARCHIVED")}>Archive</Button>}
  </div>;
}
