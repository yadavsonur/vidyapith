import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { url }: { url: string } = await req.json();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user is the owner of the course
    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId, // Ensure userId is matched with the course owner
      },
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Safely extract the file name or provide a default if undefined
    const fileName = url.split("/").pop() || "default_filename";

    // Create the attachment
    const attachment = await db.attachement.create({
      data: {
        url,
        name: fileName, // Use the extracted or default file name
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attachment);

  } catch (error) {
    console.error("COURSE_ID_ATTACHMENTS", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
