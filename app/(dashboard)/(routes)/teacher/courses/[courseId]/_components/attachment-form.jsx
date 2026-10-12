"use client";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FileUpload } from "@/components/file-upload";

const formSchema = z.object({
  url: z.string().min(1),
});

export const AttachmentForm = ({ initialData, courseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingID] = useState(null);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const onSubmit = async (values) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      toast.success("Attachment added");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onDelete = async (id) => {
    try {
      setDeletingID(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Attachment deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingID(null);
    }
  };

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ink-100">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
          Supplementary Assets ({initialData.attachement?.length || 0})
        </span>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          size="sm"
          className="text-xs text-ink-600 hover:text-ink-950 h-7 px-2"
        >
          {isEditing ? (
            <>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle className="h-3 w-3 mr-1" />
              Add File
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="space-y-2">
          {initialData.attachement?.length === 0 && (
            <p className="text-xs text-ink-400 font-mono italic py-4 text-center border border-dashed border-ink-200 rounded-md">
              No supplementary files or reading documents attached yet.
            </p>
          )}
          {initialData.attachement?.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center p-2.5 w-full bg-parchment-50 border border-ink-200 rounded-md text-ink-800 text-xs font-mono"
            >
              <FileText className="h-4 w-4 mr-2 text-ink-500 shrink-0" />
              <p className="truncate flex-1 font-sans">{attachment.name}</p>

              {deletingId === attachment.id ? (
                <div>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onDelete(attachment.id)}
                  className="ml-auto hover:text-vermilion-600 text-ink-400 transition p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="pt-2">
          <FileUpload
            endpoint="courseAttachement"
            onChange={(url) => {
              if (url) {
                onSubmit({ url });
              }
            }}
          />
          <div className="text-[11px] font-mono text-ink-400 mt-2 text-center">
            PDFs, reading guides, sample repos, or problem sets
          </div>
        </div>
      )}
    </div>
  );
};
