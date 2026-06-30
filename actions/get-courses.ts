import { getProgress } from "@/actions/get-progress"; // Corrected the import syntax
import { db } from "@/lib/db"; // Ensure correct import path
import { Category,Course } from "@prisma/client";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: {id: string}[];
    progress: number | null;
  };

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

// Example function to get courses with progress
export const getCourses = async ({ 
    userId, 
    title,
    categoryId
   }: GetCourses): Promise<CourseWithProgressWithCategory[]>=> {
      
  try {
    
    const courses = await db.course.findMany({
      where: {
        isPublished:true,
        title:{
          contains:title,
        },
        categoryId,
      },
      include: {
        category: true, 
        chapters: {
          where:{
            isPublished:true,

          },
          select: {
            id: true,
            
          },
        },
        purchases:{
          where:{
            userId,

          }
        }
      },
      orderBy:{
        createAt:"desc"
      }
    });

    // Map courses to include progress data
    const coursesWithProgress: CourseWithProgressWithCategory[] = await 
    Promise.all(
      courses.map(async (course) => {
        if (course.purchases.length ===0){
          return {
            ...course,
            progress:null,
            
          };

        }
        const progressPercentage =await getProgress(userId,course.id);
        return{
          ...course,
          progress:progressPercentage,
        } 
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return [];
  }
};
