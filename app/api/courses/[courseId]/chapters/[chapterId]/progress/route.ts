
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const {isCompleted}=await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (typeof isCompleted !== "boolean") {
      return new NextResponse("Invalid completion state", { status: 400 });
    }

    const chapter = await db.chapter.findFirst({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
        isPublished: true,
      },
      select: {
        isFree: true,
      },
    });

    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!chapter.isFree) {
      const purchase = await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: params.courseId,
          },
        },
      });

      if (!purchase) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const userProgress =await db.userProgress.upsert({
        where:{
            userId_chapterId:{
                userId,
                chapterId:params.chapterId,

            }
        },
        update:{
            isCompleted
        },
        create:{
            userId,
            chapterId:params.chapterId,
            isCompleted,
        }
    })

   return NextResponse.json(userProgress); 
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
