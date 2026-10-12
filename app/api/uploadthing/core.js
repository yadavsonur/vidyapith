import { requireTeacher } from "@/lib/auth";
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await requireTeacher();
  return { userId: user.id };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
  courseAttachement: f(["text", "image", "video", "audio", "pdf"])
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "512GB" } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
};
