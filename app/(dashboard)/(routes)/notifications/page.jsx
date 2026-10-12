import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import NotificationsClient from "./notifications-client";

export default async function NotificationsPage(){
  const {userId}=auth();
  if(!userId)return redirect("/sign-in");
  const items=await db.notification.findMany({where:{userId},orderBy:{createdAt:"desc"},take:100});
  return <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6"><div><div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700">Activity</div><h1 className="font-serif text-3xl font-medium">Notifications</h1></div><NotificationsClient initialItems={items} /></div>
}
