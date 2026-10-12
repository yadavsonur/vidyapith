"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const QuizCreateForm = ({ courseId }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [required, setRequired] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/quizzes`, {
        title,
        passingScore: 70,
        maxAttempts: 3,
        requiredForCompletion: required,
      });
      router.push(`/teacher/courses/${courseId}/quizzes/${data.id}`);
    } catch (error) {
      toast.error(error?.response?.data || "Unable to create assessment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={create} className="flex gap-2.5">
      <input
        className="flex-1 border border-ink-200 rounded-md px-3 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
        placeholder="New assessment title (e.g. 'Mid-Term Comprehensive Exam')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label className="flex items-center gap-2 text-xs font-mono px-2"><input type="checkbox" checked={required} onChange={e=>setRequired(e.target.checked)} /> Required for completion</label>
      <Button
        size="sm"
        disabled={saving || !title.trim()}
        className="bg-ink-900 text-parchment-50 shrink-0"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        {saving ? "Creating..." : "Initialize Assessment"}
      </Button>
    </form>
  );
};
