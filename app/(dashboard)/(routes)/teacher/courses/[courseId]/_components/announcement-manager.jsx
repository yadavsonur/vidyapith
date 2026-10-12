"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const AnnouncementManager = ({ courseId, initialAnnouncements = [] }) => {
  const [items, setItems] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [saving, setSaving] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/announcements`, {
        title,
        content,
        isPublished: publishNow,
      });
      setItems((current) => [data, ...current]);
      setTitle("");
      setContent("");
      toast.success("Notice broadcasted to scholars");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to post announcement");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`/api/courses/${courseId}/announcements/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Notice removed");
    } catch (error) {
      toast.error(error?.response?.data || "Unable to delete announcement");
    }
  };

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-4">
      <div>
        <div className="flex items-center gap-2 pb-1 border-b border-ink-100">
          <Bell className="h-4 w-4 text-ochre-600" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
            Scholar Bulletins & Notices ({items.length})
          </h3>
        </div>
        <p className="text-xs text-ink-500 mt-2 font-sans">
          Post important cohort updates, syllabus modifications, or lecture schedules.
        </p>
      </div>

      <form onSubmit={create} className="space-y-3">
        <input
          className="w-full border border-ink-200 rounded-md px-3 py-1.5 text-xs bg-white text-ink-900 focus:outline-none focus:border-ink-800"
          placeholder="Bulletin headline or notice title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border border-ink-200 rounded-md px-3 py-2 text-xs bg-white text-ink-900 min-h-[80px] focus:outline-none focus:border-ink-800"
          placeholder="Detailed memo for matriculated students..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
            <Checkbox
              checked={publishNow}
              onCheckedChange={(checked) => setPublishNow(!!checked)}
            />
            <span>Publish immediately upon posting</span>
          </label>
          <Button
            size="sm"
            className="bg-ink-900 text-parchment-50"
            disabled={saving || !title.trim() || !content.trim()}
          >
            {saving ? "Posting..." : "Post Notice"}
          </Button>
        </div>
      </form>

      <div className="space-y-2.5 pt-2 border-t border-ink-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-ink-200 rounded-md p-3.5 bg-parchment-25 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-serif font-medium text-sm text-ink-950">
                  {item.title}
                </div>
                <div className="text-[10px] font-mono text-ink-400">
                  {item.isPublished ? "Published Notice" : "Draft Memo"}
                </div>
              </div>
              <button
                type="button"
                className="text-ink-400 hover:text-vermilion-600 transition p-1"
                onClick={() => remove(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-ink-700 whitespace-pre-wrap leading-relaxed font-sans">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
