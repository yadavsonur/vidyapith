"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Users2, ShieldAlert, Trash2 } from "lucide-react";

export const InstructorManager = ({ courseId, ownerId, initialInstructors }) => {
  const [instructors, setInstructors] = useState(initialInstructors || []);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("INSTRUCTOR");
  const [isSaving, setIsSaving] = useState(false);

  const addInstructor = async () => {
    if (!userId.trim()) return;
    setIsSaving(true);
    try {
      const response = await axios.post(`/api/courses/${courseId}/instructors`, {
        userId: userId.trim(),
        role,
      });
      setInstructors((current) => {
        const existing = current.find((item) => item.userId === response.data.userId);
        if (existing) {
          return current.map((item) =>
            item.userId === response.data.userId ? response.data : item
          );
        }
        return [...current, response.data];
      });
      setUserId("");
      toast.success("Faculty member assigned");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to assign instructor");
    } finally {
      setIsSaving(false);
    }
  };

  const removeInstructor = async (assignedUserId) => {
    try {
      await axios.delete(
        `/api/courses/${courseId}/instructors?userId=${encodeURIComponent(assignedUserId)}`
      );
      setInstructors((current) =>
        current.filter((item) => item.userId !== assignedUserId)
      );
      toast.success("Instructor unassigned");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to remove instructor");
    }
  };

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-4">
      <div>
        <div className="flex items-center gap-2 pb-1 border-b border-ink-100">
          <Users2 className="h-4 w-4 text-ochre-600" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
            Faculty Collaboration & Chairs
          </h3>
        </div>
        <p className="text-xs text-ink-500 mt-2 font-sans">
          Appoint fellow lecturers or co-editors. The original course progenitor retains immutable ownership.
        </p>
      </div>

      <div className="text-xs font-mono border border-ink-200/80 rounded-md p-3 bg-parchment-50 flex items-center justify-between">
        <div>
          <span className="text-ink-400 uppercase text-[10px] block">Lead Progenitor</span>
          <span className="text-ink-900 font-semibold">{ownerId}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-ink-900 text-parchment-50 text-[10px]">
          OWNER
        </span>
      </div>

      {instructors
        .filter((item) => item.userId !== ownerId)
        .map((instructor) => (
          <div
            key={instructor.userId}
            className="flex items-center justify-between gap-3 text-xs border border-ink-200 rounded-md p-3 bg-white"
          >
            <div className="min-w-0 font-mono">
              <div className="truncate text-ink-900 font-medium">{instructor.userId}</div>
              <div className="text-[10px] text-ink-400 mt-0.5 uppercase tracking-wider">
                {instructor.role}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeInstructor(instructor.userId)}
              className="text-ink-400 hover:text-vermilion-600 transition p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 pt-2 border-t border-ink-100">
        <input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="User ID (Clerk ID)"
          className="border border-ink-200 rounded-md px-3 py-1.5 text-xs font-mono bg-white focus:outline-none focus:border-ink-800"
          disabled={isSaving}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="border border-ink-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-ink-800 focus:outline-none focus:border-ink-800"
          disabled={isSaving}
        >
          <option value="INSTRUCTOR">Instructor</option>
          <option value="EDITOR">Editor</option>
        </select>
        <Button
          type="button"
          onClick={addInstructor}
          disabled={isSaving || !userId.trim()}
          size="sm"
          className="bg-ink-900 text-parchment-50"
        >
          {isSaving ? "Saving..." : "Appoint"}
        </Button>
      </div>
    </div>
  );
};
