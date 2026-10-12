"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const ChapterAccesssForm = ({ initialData, courseId, chapterId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Access settings updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ink-100">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
          Preview Permissions
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
              <Pencil className="h-3 w-3 mr-1" />
              Configure
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-ink-500">Access Mode:</span>
          {initialData.isFree ? (
            <span className="px-2 py-0.5 rounded bg-ochre-50 border border-ochre-200 text-ochre-800 font-medium">
              Free preview enabled for all visitors
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-parchment-100 border border-ink-200 text-ink-700">
              Restricted to enrolled scholars only
            </span>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-ink-200 p-3 bg-parchment-25">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription className="text-xs text-ink-700 font-sans">
                      Check this box to allow non-enrolled visitors to watch this video lesson for free as a preview.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                size="sm"
                className="bg-ink-900 text-parchment-50"
                disabled={!isValid || isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Saving..." : "Save Setting"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
