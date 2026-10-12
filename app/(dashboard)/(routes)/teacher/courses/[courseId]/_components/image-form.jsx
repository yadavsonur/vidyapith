"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FileUpload } from "@/components/file-upload";
import Image from "next/image";

const formSchema = z.object({
  imageUrl: z.string().min(1, {
    message: "Image is required",
  }),
});

export const ImageForm = ({ initialData, courseId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Cover artwork updated");
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
          Cover Artwork & Folio Image
        </span>
        <Button
          onClick={toggleEdit}
          variant="ghost"
          size="sm"
          className="text-xs text-ink-600 hover:text-ink-950 h-7 px-2"
        >
          {isEditing && (
            <>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </>
          )}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className="h-3 w-3 mr-1" />
              Upload Cover
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className="h-3 w-3 mr-1" />
              Change
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        !initialData.imageUrl ? (
          <div className="flex flex-col items-center justify-center h-48 bg-parchment-100/70 border border-dashed border-ink-300 rounded-md">
            <ImageIcon className="h-8 w-8 text-ink-400 mb-1" />
            <p className="text-xs text-ink-500 font-mono">No cover artwork uploaded yet</p>
          </div>
        ) : (
          <div className="relative aspect-[16/9] mt-2 rounded-md overflow-hidden border border-ink-200 shadow-subtle">
            <Image
              alt="Course Cover"
              fill
              className="object-cover"
              src={initialData.imageUrl}
            />
          </div>
        )
      )}

      {isEditing && (
        <div className="pt-2">
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="text-[11px] font-mono text-ink-500 mt-2 text-center">
            Standard 16:9 ratio recommended · PNG, JPG or WebP
          </div>
        </div>
      )}
    </div>
  );
};
