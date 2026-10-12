import { requireTeacher } from "@/lib/auth";
import { redirect } from "next/navigation";

const TeacherLayout = async ({ children }) => {
  try {
    await requireTeacher();
  } catch {
    return redirect("/");
  }

  return <>{children}</>;
};

export default TeacherLayout;
