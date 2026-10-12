import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
export default async function ProfilePage(){const {userId}=auth();if(!userId)return redirect("/sign-in");return <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6"><div><div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700">Account</div><h1 className="font-serif text-3xl font-medium">Profile</h1></div><ProfileForm /></div>}
