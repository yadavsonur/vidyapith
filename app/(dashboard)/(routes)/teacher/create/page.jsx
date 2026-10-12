"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Compass, Sparkles } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
});

const CreatePage = () => {
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
      const response = await axios.post("/api/courses", values);
      router.push(`/teacher/courses/${response.data.id}`);
      toast.success("Curriculum created");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col justify-center min-h-[calc(100vh-140px)] p-6">
      <div className="rounded-xl border border-ink-200/90 bg-white p-8 md:p-10 shadow-card">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-ochre-50 text-ochre-800 border border-ochre-200 mb-4">
          <Sparkles className="h-3 w-3 text-ochre-600" />
          <span>Curriculum Inception</span>
        </div>

        <h1 className="font-serif text-3xl font-medium text-ink-950">
          Name your treatise or curriculum
        </h1>
        <p className="text-xs text-ink-500 mt-2 font-sans leading-relaxed">
          Give your course a clear, scholarly or professional working title. You can refine this title, add syllabi, and set descriptions prior to publication.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase text-ink-700">
                    Course Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Advanced Distributed Systems & Consensus Architecture'"
                      className="font-serif text-base py-5 placeholder:font-sans placeholder:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-ink-400">
                    What core discipline or mastery will you teach in this syllabus?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-3 pt-4 border-t border-ink-100">
              <Link href="/teacher/courses">
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                size="sm"
                className="bg-ink-900 text-parchment-50 hover:bg-ink-800"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Initiating..." : "Continue to Course Studio"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePage;
