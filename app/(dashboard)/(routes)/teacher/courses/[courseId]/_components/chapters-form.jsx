"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ChapterList } from "./chapters-list";

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, courseId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const toggleCreating = () => setIsCreating((current) => !current);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters`, values);
      toast.success("Chapter created");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onReorder = async (updateData) => {
    try {
      setIsUpdating(true);
      await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
        list: updateData,
      });
      toast.success("Chapters reordered");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-3 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-lg flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 animate-spin text-ochre-600" />
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-ink-100">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
          Curriculum Chapters ({initialData.chapters?.length || 0})
        </span>
        <Button
          onClick={toggleCreating}
          variant="ghost"
          size="sm"
          className="text-xs text-ink-600 hover:text-ink-950 h-7 px-2"
        >
          {isCreating ? (
            <>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Chapter
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pb-2 border-b border-ink-100">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Chapter 01: Foundations & Architecture'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              size="sm"
              className="bg-ink-900 text-parchment-50"
              disabled={!isValid || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Save Chapter"}
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div>
          {!initialData.chapters.length && (
            <div className="text-xs text-ink-400 font-mono italic py-4 text-center border border-dashed border-ink-200 rounded-md">
              No chapters outlined in this syllabus yet.
            </div>
          )}
          <ChapterList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.chapters || []}
          />
        </div>
      )}

      {!isCreating && (
        <p className="text-[11px] font-mono text-ink-400 pt-1">
          Drag handles to re-sequence chapter chronology for students
        </p>
      )}
    </div>
  );
};
