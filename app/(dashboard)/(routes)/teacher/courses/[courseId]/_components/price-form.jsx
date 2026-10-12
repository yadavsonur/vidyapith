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
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

const formSchema = z.object({
  price: z.coerce.number(),
});

export const PriceForm = ({ initialData, courseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Tuition fee updated");
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
          Tuition Pricing
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
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-ink-950">
            {initialData.price !== null && initialData.price !== undefined
              ? formatPrice(initialData.price)
              : "Not priced"}
          </span>
          {initialData.price === 0 && (
            <span className="text-xs font-mono text-sage-700 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
              Open / Free Access
            </span>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isSubmitting}
                      placeholder="e.g. 49.99 (Enter 0 for free open access)"
                      className="font-mono text-base"
                      {...field}
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
                {isSubmitting ? "Saving..." : "Save Tuition"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
