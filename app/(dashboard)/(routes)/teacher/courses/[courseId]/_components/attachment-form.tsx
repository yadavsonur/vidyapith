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
import { ImageIcon, Pencil, PlusCircle,File, Loader2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Attachement, Course } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";
import Image from "next/image";

interface AttachmentProps {
  initialData: Course & {attachement:Attachement[]};
  courseId: string;
}

const formSchema = z.object({
 url:z.string().min(1)
});

export const AttachmentForm = ({ initialData, courseId }: AttachmentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingID]=useState<string | null>(null);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  
  

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
    console.log(values);
  };

  const onDelete =async(id:string)=>{
    try{
      setDeletingID(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`)
      toast.success("Attachment deleted");
      router.refresh();

    }catch{
      toast.error("something went wrong");
    }finally{
      setDeletingID(null);
    }

  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing &&  (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
          
        </Button>
      </div>
      {!isEditing && (
        <>
        {initialData.attachement.length ===0 && (
          <p className="text-sm mt-2 text-slate-500 italic">
            No Attchements yet
          </p>

        )
        }
        {initialData.attachement.map((attachment)=>(
          <div
          key={attachment.id}
          className="flex items-center p-3 w-full bg-sky-100
          border-sky-200 border text-sky-700 rounded-md"
          >
            <File className="h-4 w-4 mr-2 flex-shrink-0" 
            />
            <p className="text-xs line-clamp-1">
              {attachment.name}
            </p>
            {deletingId ==attachment.id &&(
              <div>
                <Loader2 className="h-4 w-4 animate-spin"/>
              </div>
            )}
            {deletingId !==attachment.id &&(
              <button
              onClick={()=>onDelete(attachment.id)}
               className="ml-auto hover:opacity-75 transition">
                <X className="h-4 w-4 "/>
              </button>
            )}
           

          </div>
          
        ))}

        </>
       

      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachement"
            onChange={(url) => {
              if (url) {
                onSubmit({ url: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Add anything your student might need to complete the course.
          </div>
        </div>
      )}
    </div>
  );
};
