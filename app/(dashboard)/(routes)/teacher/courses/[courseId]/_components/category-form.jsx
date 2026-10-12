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
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  categoryId: z.string().min(1),
});

export const CategoryForm = ({ initialData, courseId, options }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Category updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.categoryId
  );

  return (
    <div className="border border-ink-200/90 bg-white rounded-lg p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ink-100">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-600 font-medium">
          Academic Taxonomy / Discipline
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
              Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p
          className={cn(
            "text-sm font-medium text-ink-900 font-mono",
            !initialData.categoryId && "text-ink-400 italic font-sans"
          )}
        >
          {selectedOption?.label ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-ink-200 bg-parchment-100 text-ink-800 text-xs">
              {selectedOption.label}
            </span>
          ) : (
            "No discipline selected"
          )}
        </p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox
                      options={options}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isSubmitting ? "Saving..." : "Save Discipline"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
