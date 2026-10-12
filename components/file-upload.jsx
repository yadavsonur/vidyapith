"use client";
import { UploadDropzone } from "@/lib/uploadthing";
import toast from "react-hot-toast";

export const FileUpload = ({ onChange, endpoint }) => (
  <UploadDropzone
    endpoint={endpoint}
    onClientUploadComplete={(res) => onChange(res?.[0]?.url)}
    onUploadError={(error) => toast.error(error?.message || "Upload failed")}
  />
);
